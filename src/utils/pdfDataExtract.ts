import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

interface ServiceAgreementHeader {
  providerID: string
  agreementNumber: string
  recipientID: string
  recipientName: string
  effectiveDate: string
  throughDate: string
  diagnosisCode: string
  caseManager: string
}

interface ServiceItem {
  lineNumber: string
  status: string
  procedureCode: string
  modifiers: string
  description: string
  additionalCode?: string // For codes like 38U/D
  totalAmount: string
  rateUnit: string
  quantity: string
  startDate: string
  endDate: string
  notes?: string // For reason codes and explanations
}

interface ServiceAgreement {
  header: ServiceAgreementHeader
  serviceItems: ServiceItem[]
}

// Define proper interfaces for PDF.js text content
interface TextItem {
  str: string
  transform: number[]
  width: number
  height: number
  dir: string
  fontName: string
}

interface TextContent {
  items: (TextItem | any)[]
  styles: any
}

/**
 * Extract structured text from PDF
 */
export async function extractStructuredTextFromPDF(file: File): Promise<string[]> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const pageTexts: string[] = []

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = (await page.getTextContent()) as TextContent

      const sortedItems = textContent.items
        .filter((item: any) => 'str' in item && 'transform' in item)
        .sort((a: any, b: any) => {
          const yDiff = Math.abs(a.transform[5] - b.transform[5])
          if (yDiff < 3) {
            return a.transform[4] - b.transform[4]
          }
          return b.transform[5] - a.transform[5]
        })

      const lines: Array<{ text: string; y: number }> = []
      let currentLine = ''
      let currentY: any = null

      for (const item of sortedItems) {
        if (currentY === null) {
          currentY = item.transform[5]
        }

        const yDiff = Math.abs(item.transform[5] - currentY)

        if (yDiff > 3) {
          if (currentLine.trim()) {
            lines.push({ text: currentLine.trim(), y: currentY })
          }
          currentLine = item.str
          currentY = item.transform[5]
        } else {
          if (currentLine && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
            currentLine += ' '
          }
          currentLine += item.str
        }
      }

      if (currentLine.trim()) {
        lines.push({ text: currentLine.trim(), y: currentY as number })
      }

      lines.sort((a, b) => b.y - a.y)
      const pageText = lines.map(line => line.text)
      pageTexts.push(...pageText)
    }

    return pageTexts
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

/**
 * Parse header information from text lines
 */
function parseHeaderInformation(lines: string[]): ServiceAgreementHeader {
  // Initialize with empty values
  const header: ServiceAgreementHeader = {
    providerID: '',
    agreementNumber: '',
    recipientID: '',
    recipientName: '',
    effectiveDate: '',
    throughDate: '',
    diagnosisCode: '',
    caseManager: ''
  }

  // Extract Provider ID
  const providerIDLine = lines.find(line => line.includes('Provider ID'))
  if (providerIDLine) {
    const match = providerIDLine.match(/Provider ID\s+([A-Za-z0-9]+)/)
    if (match) header.providerID = match[1]
  }

  // Extract case manager
  const managerLine = lines.find(line => line.includes('Case Manager Name and Number:'))
  if (managerLine) {
    const match = managerLine.match(/Case Manager Name and Number:\s+(.+)/)
    if (match) header.caseManager = match[1]
  }

  // Extract agreement #, recipient ID, name, and dates
  const agreementLine = lines.find(line => line.includes('AGREEMENT#') || line.match(/AGREEMENT\s*#/))
  if (agreementLine) {
    const nextLine = lines[lines.indexOf(agreementLine) + 1]
    if (nextLine) {
      const parts = nextLine.split(/\s+/)
      if (parts.length >= 5) {
        header.agreementNumber = parts[0]
        header.recipientID = parts[1]

        // Find the recipient name (which may contain spaces)
        const nameEndIndex = parts.findIndex(part => part.match(/\d{2}\/\d{2}\/\d{2}/))
        if (nameEndIndex > 2) {
          header.recipientName = parts.slice(2, nameEndIndex).join(' ')
          header.effectiveDate = parts[nameEndIndex]
          header.throughDate = parts[nameEndIndex + 1]
        }
      }
    }
  }

  // Extract diagnosis code
  const diagnosisLine = lines.find(line => line.includes('ICD-10 DIAGNOSIS CODE:'))
  if (diagnosisLine) {
    const match = diagnosisLine.match(/ICD-10 DIAGNOSIS CODE:\s+([A-Z]\d{1,2}(?:\.?\d)?)/)
    if (match) header.diagnosisCode = match[1]
  }

  return header
}

/**
 * Parse service items from text lines
 */
function parseServiceItems(lines: string[]): ServiceItem[] {
  const serviceItems: ServiceItem[] = []

  // Find where the service items start
  // The header line contains "LINE", "STATUS", "PROCEDURE", and "CODE"
  const headerIndex = lines.findIndex(
    line => line.includes('LINE') && line.includes('STATUS') && line.includes('PROCEDURE') && line.includes('CODE')
  )

  if (headerIndex === -1) {
    // Try an alternative header format
    const altHeaderIndex = lines.findIndex(
      line => line.includes('NBR') && line.includes('STATUS') && line.includes('CODE') && line.includes('MOD')
    )

    if (altHeaderIndex === -1) {
      console.log('Could not find service items header')
      return serviceItems
    } else {
      console.log('Found alternative header at index:', altHeaderIndex)
    }
  } else {
    console.log('Found header at index:', headerIndex)
  }

  // Start processing from the line after the header
  const startIndex =
    Math.max(
      lines.findIndex(line => line.includes('NBR') && line.includes('STATUS') && line.includes('CODE')),
      headerIndex
    ) + 1

  console.log('Extracted Starting service item parsing at index:', startIndex)

  // Process lines after the header
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()

    // Debugging
    console.log(`Processing line ${i}: "${line}"`)

    // Match line items like "03 APPROVED T1019 PERSONAL CARE SERVICES, 15 MIN"
    // Updated regex to be more flexible with spacing and capture pattern
    const serviceLineMatch = line.match(/^(\d+)\s+(APPROVED|DENIED)\s+([A-Z0-9]+)(?:\s+([A-Z0-9]*))?\s+(.+)$/i)

    if (serviceLineMatch) {
      console.log('Extracted Found service item match:', serviceLineMatch)

      const lineNumber = serviceLineMatch[1]
      const status = serviceLineMatch[2]
      const procedureCode = serviceLineMatch[3]
      const modifiers = serviceLineMatch[4] || ''
      const description = serviceLineMatch[5].trim()

      // Initialize the service item
      const serviceItem: ServiceItem = {
        lineNumber,
        status,
        procedureCode,
        modifiers,
        description,
        totalAmount: '',
        rateUnit: '',
        quantity: '',
        startDate: '',
        endDate: ''
      }

      // Look for additional codes like 38U/D on next line
      if (
        i + 1 < lines.length &&
        lines[i + 1].trim() &&
        !lines[i + 1].match(/^\d+\s+(APPROVED|DENIED)/i) &&
        !lines[i + 1].match(/Total Amount/i)
      ) {
        const nextLine = lines[i + 1].trim()
        if (nextLine.match(/^\d+[A-Z]/)) {
          // This looks like a reason code, skip it
          console.log('Skipping reason code line:', nextLine)
        } else {
          serviceItem.additionalCode = nextLine
          console.log('Found additional code:', nextLine)
          i++
        }
      }

      // Look ahead for additional details
      let notes = ''
      let detailsFound = false

      for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
        const detailLine = lines[j].trim()

        // Debug
        console.log(`Checking detail line ${j}: "${detailLine}"`)

        // Check if we've hit another service item
        if (detailLine.match(/^\d+\s+(APPROVED|DENIED)/i)) {
          console.log('Hit next service item, stopping detail search')
          break
        }

        // Extract total amount
        const totalMatch = detailLine.match(/Total Amount:\s*\$([0-9,.]+)/i)
        if (totalMatch) {
          serviceItem.totalAmount = totalMatch[1]
          detailsFound = true
          console.log('Found total amount:', totalMatch[1])
        }

        // Extract rate/unit
        const rateMatch = detailLine.match(/Rate\/Unit:\s*\$([0-9,.]+)/i)
        if (rateMatch) {
          serviceItem.rateUnit = rateMatch[1]
          console.log('Found rate/unit:', rateMatch[1])
        }

        // Extract quantity
        const quantityMatch = detailLine.match(/Quantity:\s*([0-9,]+)/i)
        if (quantityMatch) {
          serviceItem.quantity = quantityMatch[1]
          console.log('Found quantity:', quantityMatch[1])
        }

        // Extract dates
        const dateMatch = detailLine.match(/Start Date:\s*(\d{2}\/\d{2}\/\d{2})\s+End Date:\s*(\d{2}\/\d{2}\/\d{2})/i)
        if (dateMatch) {
          serviceItem.startDate = dateMatch[1]
          serviceItem.endDate = dateMatch[2]
          console.log('Found dates:', dateMatch[1], 'to', dateMatch[2])
        }

        // Look for reason code notes (e.g., "841 THIS LINE ITEM IS NO LONGER NEEDED.")
        const reasonCodeMatch = detailLine.match(/^(\d{3})\s+(.+)$/i)
        if (reasonCodeMatch) {
          notes += (notes ? ' ' : '') + reasonCodeMatch[2]
          console.log('Found reason code note:', reasonCodeMatch[2])
        }

        // Check if we've found a details line with Total Amount, if so, increment i
        if (detailsFound && totalMatch) {
          i = j
        }
      }

      if (notes) {
        serviceItem.notes = notes
      }

      serviceItems.push(serviceItem)
      console.log('Added service item:', serviceItem)
    }
  }

  console.log(`Total service items found: ${serviceItems.length}`)
  return serviceItems
}
/**
 * Process text lines or an array directly
 */
export function parseServiceAgreement(textData: any): ServiceAgreement {
  const lines = Array.isArray(textData) ? textData : JSON.parse(textData)

  const header = parseHeaderInformation(lines)
  const serviceItems = parseServiceItems(lines)

  return {
    header,
    serviceItems
  }
}

/**
 * Process a PDF file and extract service agreement information
 */
export async function processPDFFile(file: File): Promise<ServiceAgreement> {
  try {
    const textLines = await extractStructuredTextFromPDF(file)
    return parseServiceAgreement(textLines)
  } catch (error) {
    console.error('Error processing PDF file:', error)
    throw error
  }
}

/**
 * Process text lines that were already extracted
 */
export function processExtractedLines(textLines: string[]): ServiceAgreement {
  return parseServiceAgreement(textLines)
}

/**
 * React hook for PDF upload handling
 */
export function usePDFUploadHandler() {
  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file || file.type !== 'application/pdf') {
      console.error('Invalid file type. Please upload a PDF.')
      return null
    }

    try {
      const result = await processPDFFile(file)
      console.log('Extracted Service Agreement:', result)
      return result
    } catch (error) {
      console.error('Error processing PDF:', error)
      return null
    }
  }

  return {
    handlePDFUpload
  }
}

// Example usage with already extracted text lines
export function exampleUsage(jsonText: string) {
  const result = parseServiceAgreement(jsonText)
  console.log('Parsed Service Agreement:', result)
  return result
}

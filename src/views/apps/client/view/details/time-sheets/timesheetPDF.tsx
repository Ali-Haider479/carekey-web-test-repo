import { Dispatch, SetStateAction } from 'react'
import { jsPDF } from 'jspdf'
import moment from 'moment'
import { ServiceEntry, SignatureState } from '.'
import './TimesheetPdf.css'
interface exportToPDFProps {
  setIsLoading: Dispatch<SetStateAction<boolean>>
  authUser: any
  pdfData: ServiceEntry[][]
  weekDates: moment.Moment[]
  durationsByDate: { [key: string]: number }
}

const getLatestSignature = (data: ServiceEntry[], signatureType: 'clientSignature' | 'caregiverSignature') => {
  const latestEntry = data
    ?.filter(item => item?.signature?.[signatureType])
    .sort((a, b) => new Date(b.signature!.createdAt!).getTime() - new Date(a.signature!.createdAt!).getTime())[0]

  if (!latestEntry?.signature?.[signatureType]) {
    return { image: '', text: '', date: '' }
  }

  const signature = latestEntry.signature[signatureType]!
  const isBase64Image = signature.startsWith('data:image') || /^[A-Za-z0-9+/=]+$/.test(signature)
  const date = latestEntry.signature.createdAt || ''

  return {
    image: isBase64Image ? (signature.startsWith('data:image') ? signature : `data:image/png;base64,${signature}`) : '',
    text: isBase64Image ? '' : signature,
    date: date ? moment(date).format('MM/DD/YYYY') : 'N/A'
  }
}

export const exportToPDF = async ({
  setIsLoading,
  authUser,
  pdfData,
  weekDates,
  durationsByDate
}: exportToPDFProps) => {
  setIsLoading(true)
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    if (Array.isArray(pdfData) && Array.isArray(pdfData[0])) {
      pdfData.map((item, index) => {
        const clientSignature = getLatestSignature(item, 'clientSignature')
        const caregiverSignature = getLatestSignature(item, 'caregiverSignature')

        if (index !== 0) {
          doc.addPage()
        }

        const pageWidth = doc.internal.pageSize.width
        const margin = 10
        const contentWidth = pageWidth - margin * 2

        doc.setFont('helvetica', 'normal')

        // Header Section
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        const titleText = authUser.tenant.companyName
        const titleWidth = doc.getStringUnitWidth(titleText) * 16 * 0.352778
        doc.text(titleText, (pageWidth - titleWidth) / 2, 15)

        const subTitleText = 'Caregiver Time and Activity Documentation'
        const subTitleWidth = doc.getStringUnitWidth(subTitleText) * 16 * 0.352778
        doc.text(subTitleText, (pageWidth - subTitleWidth) / 2, 22)

        doc.setFontSize(10)
        const addressText = `Address: ${authUser.tenant.address}  Contact: ${authUser.tenant.contactNumber}`
        const addressWidth = doc.getStringUnitWidth(addressText) * 10 * 0.352778
        doc.text(addressText, (pageWidth - addressWidth) / 2, 29)

        doc.setDrawColor(0, 0, 0)
        doc.setLineWidth(0.5)
        doc.line(margin, 32, pageWidth - margin, 32)

        // Checkout Notes Section
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Checkout Notes', margin, 40)
        doc.setFont('helvetica', 'normal')

        let yPosition = 50
        const sortedTimelogDataWithNotes = [...item]
          .filter(item => item.notes !== '')
          .sort((a, b) => new Date(a.dateOfService).getTime() - new Date(b.dateOfService).getTime())

        sortedTimelogDataWithNotes.forEach(entry => {
          const dateStr = moment(entry.dateOfService).format('MM/DD/YYYY')
          const timeIn = moment(entry.clockIn).format('hh:mm A')
          const timeOut = moment(entry.clockOut).format('hh:mm A')
          doc.setFontSize(11)
          doc.setFont('helvetica', 'bold')
          doc.text(`${dateStr} ${timeIn} - ${timeOut}`, margin, yPosition)
          doc.setFont('helvetica', 'normal')

          const notesText = `- ${entry.notes}`
          const splitNotes = doc.splitTextToSize(notesText, contentWidth)
          doc.setFontSize(10)
          doc.text(splitNotes, margin, yPosition + 5)

          const noteBlockHeight = 5 + splitNotes.length * 5
          yPosition += noteBlockHeight + 5

          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
        })

        // New Page for Table
        doc.addPage()
        yPosition = 15

        // Client and Caregiver Info Section
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(
          `RECIPIENT NAME - ${item[0]?.client?.firstName || ''} ${item[0]?.client?.lastName || ''} (${item[0]?.client?.clientCode || ''})`,
          margin,
          yPosition
        )
        const icsText = `${item[0]?.serviceName}`
        const icsWidth = doc.getStringUnitWidth(icsText) * 11 * 0.352778
        doc.text(icsText, pageWidth - margin - icsWidth, yPosition)

        yPosition += 5
        doc.text(
          `CAREGIVER NAME - ${item[0]?.caregiver?.firstName || ''} ${item[0]?.caregiver?.lastName || ''}`,
          margin,
          yPosition
        )
        const startDate = moment(item[0]?.payPeriodHistory.startDate).format('MMMM DD, YYYY')
        const endDate = moment(weekDates[weekDates.length - 1]).format('MMMM DD, YYYY')
        const weekDurationText = `Week Duration: ${startDate} To ${endDate}`
        const weekDurationWidth = doc.getStringUnitWidth(weekDurationText) * 11 * 0.352778
        doc.text(weekDurationText, pageWidth - margin - weekDurationWidth, yPosition)

        yPosition += 5
        doc.setDrawColor(0, 0, 0)
        doc.setLineWidth(0.5)
        doc.line(margin, yPosition, pageWidth - margin, yPosition)

        // First Table Section (Service Entries)
        yPosition += 10

        const allEntries = [...item].sort(
          (a, b) => new Date(a.dateOfService).getTime() - new Date(b.dateOfService).getTime()
        )

        const columns = allEntries.map(entry => ({
          date: moment(entry.dateOfService).format('MM/DD/YY'),
          day: moment(entry.dateOfService).format('ddd').toUpperCase(),
          entry
        }))
        console.log('Columns:', columns) // Debug: Check total columns

        const rowDefinitions = [
          { label: 'Ratio', key: 'ratio', width: 15 },
          { label: 'Shared location', key: 'sharedLocation', width: 20 },
          { label: 'Loc. Approved', key: 'locApproved', width: 20 },
          { label: 'Facility Stay', key: 'facilityStay', width: 20 },
          { label: 'Time In', key: 'timeIn', width: 20 },
          { label: 'Time Out', key: 'timeOut', width: 20 },
          { label: 'Activities', key: 'activities', width: 40 }
        ]

        const drawCell = (
          text: string,
          x: number,
          y: number,
          width: number,
          initialHeight: number,
          isHeader = false,
          align: 'left' | 'center' | 'right' = 'center',
          wrapText = false
        ) => {
          doc.rect(x, y, width, initialHeight)

          doc.setFont('helvetica', isHeader ? 'bold' : 'normal')
          doc.setFontSize(isHeader ? 9 : 8)

          if (wrapText) {
            const splitText = doc.splitTextToSize(text, width - 4)
            const lineHeight = 5
            const neededHeight = splitText.length * lineHeight

            splitText.forEach((line: string, i: number) => {
              const lineY = y + i * lineHeight + lineHeight / 2 + 2
              doc.text(line, x + 2, lineY)
            })

            return Math.max(initialHeight, neededHeight)
          } else {
            let textX = x
            const textY = y + initialHeight / 2 + 2

            if (align === 'center') {
              const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() * 0.352778
              textX = x + (width - textWidth) / 2
            } else if (align === 'left') {
              textX = x + 2
            } else if (align === 'right') {
              const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() * 0.352778
              textX = x + width - textWidth - 2
            }

            doc.text(text, textX, textY)
            return initialHeight
          }
        }

        const dateColWidth = 25
        const firstColWidth = 30
        const maxColumnsPerRow = 6
        const maxColumnsPerPage = Math.floor((pageWidth - margin * 2 - firstColWidth) / dateColWidth)

        let printedColumns = 0

        const drawColumnsPage = (startIndex: number) => {
          const columnsToDraw = columns.slice(startIndex)
          let currentX = margin
          let currentY = yPosition
          let columnCount = 0

          // Draw date header for each row
          const drawHeaderRow = (rowColumns: number) => {
            currentX = margin
            drawCell('Date', currentX, currentY, firstColWidth, 8, true, 'center')
            currentX += firstColWidth

            for (let i = 0; i < rowColumns; i++) {
              const col = columnsToDraw[columnCount + i]
              const dateText = `${col.date}`
              drawCell(dateText, currentX, currentY, dateColWidth, 8, true, 'center')
              currentX += dateColWidth
            }
            currentY += 8
          }

          let maxActivityHeight = 0
          columnsToDraw.forEach(col => {
            const activitiesText =
              col.entry?.checkedActivity?.activities?.map((a: any) => a.title.toUpperCase())?.join(', ') || ''
            const splitText = doc.splitTextToSize(activitiesText, dateColWidth - 4)
            const neededHeight = splitText.length * 5
            if (neededHeight > maxActivityHeight) maxActivityHeight = neededHeight
          })

          while (columnCount < columnsToDraw.length) {
            console.log(`Starting row at columnCount: ${columnCount}, remaining: ${columnsToDraw.length - columnCount}`)
            const columnsInRow = Math.min(maxColumnsPerRow, columnsToDraw.length - columnCount)
            drawHeaderRow(columnsInRow)

            rowDefinitions.forEach(rowDef => {
              currentX = margin
              drawCell(
                rowDef.label,
                currentX,
                currentY,
                firstColWidth,
                rowDef.key === 'activities' ? maxActivityHeight : 8,
                true,
                'left'
              )
              currentX += firstColWidth

              for (let i = 0; i < columnsInRow; i++) {
                const col = columnsToDraw[columnCount + i]
                let cellValue = ''

                switch (rowDef.key) {
                  case 'ratio':
                    cellValue = '1:1'
                    break
                  case 'sharedLocation':
                    cellValue = 'No'
                    break
                  case 'locApproved':
                    cellValue = col.entry.locApproved ? '✓' : 'X'
                    break
                  case 'facilityStay':
                    cellValue = ''
                    break
                  case 'timeIn':
                    cellValue = col.entry.clockIn ? moment(col.entry.clockIn).format('hh:mm A') : '--'
                    break
                  case 'timeOut':
                    cellValue = col.entry.clockOut ? moment(col.entry.clockOut).format('hh:mm A') : '--'
                    break
                  case 'activities':
                    cellValue =
                      col.entry?.checkedActivity?.activities?.map((a: any) => a.title.toUpperCase())?.join(', ') || ''
                    break
                }

                doc.setTextColor(cellValue === 'X' ? 'red' : 'black')
                if (rowDef.key === 'activities') {
                  drawCell(cellValue, currentX, currentY, dateColWidth, maxActivityHeight, false, 'left', true)
                } else {
                  drawCell(cellValue, currentX, currentY, dateColWidth, 8, false, 'center')
                }
                currentX += dateColWidth
                printedColumns++
              }
              currentY += rowDef.key === 'activities' ? maxActivityHeight : 0
              doc.setTextColor('black')
              currentY += 8

              if (currentY > doc.internal.pageSize.height - 20) {
                doc.addPage()
                currentY = 15
                drawHeaderRow(columnsInRow)
              }
            })

            columnCount += columnsInRow
            if (columnCount < columnsToDraw.length) currentY += 10
          }

          console.log(`Printed Columns: ${printedColumns}, Total Columns: ${columns.length}`)
          yPosition = currentY
        }

        for (let i = 0; i < columns.length; i += maxColumnsPerPage) {
          if (i > 0) {
            doc.addPage()
            yPosition = 15
          }
          if (printedColumns < columns.length) drawColumnsPage(i)
        }

        // Calculate and display totals
        // yPosition += 10
        const totalMinutes = Object.values(durationsByDate).reduce(
          (sum: number, duration) => sum + Number(duration || 0),
          0
        )
        const totalHours = Math.floor(totalMinutes / 60)
        const totalMins = Math.round(totalMinutes % 60)

        doc.setFont('helvetica', 'bold')
        doc.text(`Week One - ${totalHours} Hrs ${totalMins} Min`, margin, yPosition)
        doc.text(`Total Hours - ${totalHours} Hrs ${totalMins} Min`, 100, yPosition)
        doc.text(`Ratio(1:1) - ${totalHours} Hrs ${totalMins} Min`, margin, yPosition + 5)

        yPosition += 10
        doc.setDrawColor(0, 0, 0)
        doc.setLineWidth(0.2)
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 10

        // Client Acknowledgement Section
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('Acknowledge and Required Signature for Client', margin, yPosition)
        doc.setFont('helvetica', 'normal')

        const clientAcknowledgement =
          'After the Caregiver has documented his/her time and activity, the recipient must draw a line through any dates/times he/she did not receive service from the Caregiver. Review the completed time sheet for accuracy before signing. It is a crime to provide false information on Caregiver billings for Medical Assistance payment. By signing below you swear and verify the time and services entered above are accurate and that the services were performed by the Caregiver listed below as specified in the PCA Care Plan.'
        const clientAckLines = doc.splitTextToSize(clientAcknowledgement, contentWidth)
        doc.text(clientAckLines, margin, yPosition + 5)
        yPosition += 15 + clientAckLines.length * 3

        doc.setFont('helvetica', 'bold')
        doc.text('RECIPIENT NAME', margin, yPosition)
        doc.text('PMI NUMBER', 60, yPosition)
        doc.text('RECIPIENT SIGNATURE', 100, yPosition)
        doc.text('DATE', 160, yPosition)

        doc.setFont('helvetica', 'normal')
        doc.text(`${item[0]?.client?.firstName || ''} ${item[0]?.client?.lastName || ''}`, margin, yPosition + 5)
        doc.text(`${item[0]?.client?.pmiNumber || ''}`, 60, yPosition + 5)
        if (clientSignature.image) {
          doc.addImage(clientSignature.image, 'JPEG', 100, yPosition - 2, 30, 20)
        } else {
          doc.text(clientSignature.text || 'No signature available', 100, yPosition + 5)
        }
        doc.text(clientSignature.date, 160, yPosition + 5)

        yPosition += 20

        // Caregiver Acknowledgement Section
        doc.setFont('helvetica', 'bold')
        doc.text('Acknowledgement and Required Signatures for Caregiver', margin, yPosition)
        doc.setFont('helvetica', 'normal')

        const caregiverAcknowledgement =
          'I certify and swear under penalty of law that I have accurately reported on this time sheet the hours I actually worked, the service I provided, and the dates and times worked. I understand that misreporting my hours is fraud for which I could face criminal prosecution and civil proceedings.'
        const caregiverAckLines = doc.splitTextToSize(caregiverAcknowledgement, contentWidth)
        doc.text(caregiverAckLines, margin, yPosition + 5)
        yPosition += 15 + caregiverAckLines.length * 3

        doc.setFont('helvetica', 'bold')
        doc.text('CAREGIVER NAME', margin, yPosition)
        doc.text('CAREGIVER NPI/UMPI', 60, yPosition)
        doc.text('CAREGIVER SIGNATURE', 100, yPosition)
        doc.text('DATE', 160, yPosition)

        doc.setFont('helvetica', 'normal')
        doc.text(`${item[0]?.caregiver?.firstName || ''} ${item[0]?.caregiver?.lastName || ''}`, margin, yPosition + 5)
        doc.text(`${item[0]?.caregiver?.caregiverUMPI || ''}`, 60, yPosition + 5)
        if (caregiverSignature.image) {
          doc.addImage(caregiverSignature.image, 'JPEG', 100, yPosition - 2, 30, 20)
        } else {
          doc.text(caregiverSignature.text || 'No signature available', 100, yPosition + 5)
        }
        doc.text(caregiverSignature.date, 160, yPosition + 5)
      })
    }

    doc.save(
      `Timesheet_${pdfData[0][0]?.client?.firstName || 'Client'}_${pdfData[0][0]?.caregiver?.firstName || 'Caregiver'}.pdf`
    )
  } catch (error) {
    console.error('Error generating PDF:', error)
  } finally {
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }
}

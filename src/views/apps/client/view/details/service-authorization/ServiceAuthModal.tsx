'use client'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import {
  Button,
  Grid2 as Grid,
  Dialog,
  Typography,
  TextField,
  Divider,
  Box,
  CircularProgress,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  FormControlLabel,
  Checkbox,
  DialogContent
} from '@mui/material'
import { useEffect, useState } from 'react'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { placeOfServiceOptions, payerOptions } from '@/utils/constants'
import OcrCustomDropDown from '@/@core/components/custom-inputs/OcrCustomDropdown'
import api from '@/utils/api'
import { extractStructuredTextFromPDF, parseServiceAgreement } from '@/utils/pdfDataExtract'
import { useTheme } from '@emotion/react'
import axios from 'axios'
import CustomAlert from '@/@core/components/mui/Alter'
import { parseISO, startOfDay } from 'date-fns'

interface ServiceAuthListModalProps {
  open: boolean
  onClose: () => void
  clientId: any
  serviceAuthData: any
  fetchClientServiceAuthData: () => Promise<void>
  getClientDocuments: () => Promise<void>
  fetchData?: () => Promise<void>
}

interface FormRow {
  providerId: string
  agreementNumber: string
  recipientId: string
  caseManagerNumber: string
  diagnosisCode: string
  procedureCode: string
  modifierCode: string | null
  startDate: string
  endDate: string
  procedureDescription: string
  totalAmount: string
  serviceRate: string
  quantity: string
  usedUnits: string
  frequency: string
  umpiNumber: string
  taxonomy: string
  reimbursement: string
  placeOfService: string
  caseManagerName?: string // Optional fields from OCR
  recepientName?: string
  status?: string
  serviceDescription?: string
  serviceName?: string
}

interface UploadedFile {
  name: string
  extension: string
  size: string
}

interface AuthUser {
  id: number
  [key: string]: any
}

export const ServiceAuthListModal: React.FC<ServiceAuthListModalProps> = ({
  open,
  onClose,
  clientId,
  fetchClientServiceAuthData,
  getClientDocuments,
  fetchData,
  serviceAuthData
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [enableOcrDataFill, setEnableOcrDataFill] = useState<boolean>(true)
  const [formData, setFormData] = useState<any>([])
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [billableStates, setBillableStates] = useState<boolean[]>([])
  const [ocrData, setOcrData] = useState<FormRow[]>([])
  const [extractedData, setExtractedData] = useState<any>(null)
  const [rawFile, setRawFile] = useState<any>(null)
  const authUser: AuthUser = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const [payerName, setPayerName] = useState<string>('MA')
  const [clientDocuments, setClientDocuments] = useState<any>([])
  const [alertProps, setAlertProps] = useState<any>()
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [serviceAuthServices, setServiceAuthServices] = useState<any>([])
  const [allServices, setAllServices] = useState<any>()
  const theme: any = useTheme()

  // const getClientDocuments = async () => {
  //   try {
  //     const response = await api.get(`/client/client-documents/${clientId}`)
  //     console.log('Client Documents:', response.data)
  //     const serviceAuthFilteredDocuments = response.data.filter(
  //       (doc: any) => doc.documentType === 'serviceAuthDocument'
  //     )
  //     setClientDocuments(serviceAuthFilteredDocuments)
  //   } catch (error) {
  //     console.error('Error fetching client documents:', error)
  //   }
  // }

  const fetchServiceAuthServices = async () => {
    try {
      const response = await api.get(`/service/service-auth/services`)
      console.log('Response from service auth services:', response.data)
      setServiceAuthServices(response.data)
    } catch (error) {
      console.error('Error fetching service auth services:', error)
    }
  }

  const fetchAllServices = async () => {
    try {
      const response = await api.get(`/service/tenant/${authUser?.tenant?.id}`)
      setAllServices(response.data)
    } catch (error) {
      console.error('Error fetching services: ', error)
    }
  }

  useEffect(() => {
    getClientDocuments()
    fetchServiceAuthServices()
    fetchAllServices()
  }, [])

  const uploadDocuments = async (files: File[], documentType: string, id: string) => {
    if (!files || files.length === 0) {
      console.log(`No files found for ${documentType}. Skipping upload.`)
      return null
    }

    try {
      // Extract file names
      const fileNames = files.map(file => file.name)

      console.log('Files to be uploaded:', fileNames)

      // Request pre-signed URLs from the backend
      const { data: preSignedUrls } = await api.post(`/upload-document/get-signed-pdf-put-url`, fileNames)

      console.log('Received Pre-Signed URLs:', preSignedUrls)

      // Upload each file to S3
      const uploadPromises = files.map(async (file, index) => {
        console.log('Uploading file:', file)
        const { key, url } = preSignedUrls[index] // Get corresponding pre-signed URL
        const fileType = file.type.split('/').pop() || 'pdf' // Default to 'pdf' if undefined

        console.log(`Uploading ${file.name} with URL: ${url} to S3...`)

        // Upload file to S3
        await axios.put(url, file, {
          headers: {
            'Content-Type': 'application/pdf' // Adjust based on file type
          }
        })

        console.log(`${file.name} uploaded successfully.`)

        // Prepare metadata to store in DB
        const body = {
          fileName: file.name,
          documentType,
          fileKey: key,
          fileType,
          fileSize: file.size,
          clientId: id
        }

        // Store record in backend
        return api.post(`/client/documents`, body)
      })

      // Wait for all uploads & database records to complete
      const results = await Promise.all(uploadPromises)

      console.log('All files uploaded & records created:', results)

      return results
    } catch (error) {
      console.error(`Error uploading ${documentType} documents:`, error)
      return null
    }
  }

  const initialFormRow: FormRow = {
    providerId: '',
    agreementNumber: '',
    recipientId: '',
    caseManagerNumber: '',
    diagnosisCode: '',
    procedureCode: '',
    modifierCode: null,
    startDate: '',
    endDate: '',
    procedureDescription: '',
    totalAmount: '',
    serviceRate: '',
    quantity: '',
    frequency: 'daily',
    umpiNumber: '',
    taxonomy: '',
    reimbursement: 'per unit',
    placeOfService: 'home',
    caseManagerName: '',
    recepientName: '',
    status: '',
    serviceDescription: '',
    serviceName: '',
    usedUnits: ''
  }

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open])

  useEffect(() => {
    if (open) {
      if (enableOcrDataFill && ocrData.length > 0) {
        // Merge ocrData with initialFormRow to ensure all fields are present
        const mergedData = ocrData.map(item => ({
          ...initialFormRow,
          ...item,
          placeOfService: formData[0]?.placeOfService || '' // Preserve placeOfService from UI
        }))
        setFormData(mergedData)
        setBillableStates(mergedData.map(() => true))
      } else {
        setFormData([initialFormRow])
        setBillableStates([true])
      }
    }
  }, [enableOcrDataFill, open, ocrData])

  const resetForm = (): void => {
    setFormData([initialFormRow])
    setBillableStates([true])
    setUploadedFile(null)
    setOcrData([])
    setRawFile(null)
  }

  const handleInputChange = (index: number, field: keyof FormRow, value: string): void => {
    const updatedData = [...formData]
    updatedData[index][field] = value
    setFormData(updatedData)
  }

  const handleCommonFieldChange = (field: string, value: string): void => {
    console.log('ONE Field', field, value)
    const updatedData = formData.map((item: any) => ({
      ...item,
      [field === 'serviceAuthNumber'
        ? 'agreementNumber'
        : field === 'diagnosisCode'
          ? 'diagnosisCode'
          : field === 'taxonomy'
            ? 'taxonomy'
            : field === 'umpiNumber'
              ? 'providerId'
              : field === 'memberId'
                ? 'recipientId'
                : field === 'placeOfService'
                  ? 'placeOfService'
                  : 'recipientId']: value
    }))
    setFormData(updatedData as FormRow[])
  }

  console.log('FORM DATAAA ==========>> ', formData)

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    console.log('Uploaded File ---->> ', event)
    if (file && file.type === 'application/pdf') {
      setIsLoading(true)
      setUploadedFile({
        name: file.name,
        extension: file.name.split('.').pop() || '',
        size: (file.size / 1024).toFixed(2) + ' KB'
      })
      setRawFile(file) // Store the raw file for later use

      try {
        // Extract text using the helper function
        const textLines = await extractStructuredTextFromPDF(file)
        console.log('TEXT LINES ---->> ', textLines)
        const extracted = parseServiceAgreement(textLines)
        console.log('EXTRCTED DATA', extracted)
        setExtractedData(extracted)
        // If enableOcrDataFill is true, populate form fields with extracted data
        if (enableOcrDataFill && extracted.serviceItems.length > 0) {
          // Map service items to form rows
          const mappedFormData = extracted.serviceItems
            .filter(item => item.status === 'APPROVED') // Only include approved items
            .map(item => {
              // Find matching service in allServices
              const matchingService = allServices.find((service: any) => {
                const isProcedureCodeMatch = service.procedureCode?.trim() === item.procedureCode?.trim()
                const isModifierMatch =
                  service.modifierCode === item.modifiers ||
                  (service.modifierCode == null && (item.modifiers == null || item.modifiers.includes('PERSONAL'))) // Handle null/undefined

                console.log('Checking service:', {
                  serviceProcedureCode: service.procedureCode,
                  serviceModifierCode: service.modifierCode,
                  itemProcedureCode: item.procedureCode,
                  itemModifiers: item.modifiers,
                  isProcedureCodeMatch,
                  isModifierMatch
                })

                return isProcedureCodeMatch && isModifierMatch
              })

              console.log('Service matched with item ---~---~--->> ', matchingService)

              return {
                procedureCode: item.procedureCode || '',
                modifierCode: item?.modifiers?.includes('PERSONAL') ? null : item.modifiers,
                serviceDescription: item.description,
                serviceName: matchingService ? matchingService?.name : item.description,
                startDate: formatDateString(item.startDate),
                endDate: formatDateString(item.endDate),
                serviceRate: item.rateUnit ? `$${item.rateUnit}` : '',
                quantity: item.quantity ? item.quantity.replace(/,/g, '') : '',
                // Default values for missing fields
                frequency: 'daily',
                taxonomy: '',
                reimbursement: 'per unit',
                placeOfService: 'home',
                // Keep the extracted data for reference
                providerId: extracted.header.providerID,
                recipientId: extracted.header.recipientID,
                agreementNumber: extracted.header.agreementNumber,
                diagnosisCode: extracted.header.diagnosisCode,
                status: 'APPROVED'
              }
            })

          setFormData(mappedFormData)
          setBillableStates(mappedFormData.map(() => true))

          // Also update other state as needed
          setPayerName('MA') // Default value
        }
      } catch (error) {
        console.error('Error processing PDF:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const formatDateString = (dateStr: string): string => {
    if (!dateStr || dateStr.trim() === '') return ''

    // Parse MM/DD/YY format
    const parts = dateStr.split('/')
    if (parts.length !== 3) return dateStr

    const month = parts[0].padStart(2, '0')
    const day = parts[1].padStart(2, '0')
    let year = parts[2]

    // Ensure year is 4 digits
    if (year.length === 2) {
      // Assume 20XX for years less than 50, and 19XX for years 50 or greater
      const prefix = parseInt(year) < 50 ? '20' : '19'
      year = prefix + year
    }

    return `${year}-${month}-${day}`
  }

  const parsedDate = (dateStr: string | undefined): string | undefined => {
    if (!dateStr) return undefined

    console.log('Parsing date string: ', dateStr)

    // If already properly formatted ISO string, return it
    if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(dateStr)) return dateStr

    // If it's a date-only string (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      console.log("Date string found in format 'YYYY-MM-DD': ", dateStr)
      const now = new Date()
      const hours = String(now.getUTCHours()).padStart(2, '0')
      const minutes = String(now.getUTCMinutes()).padStart(2, '0')
      const seconds = String(now.getUTCSeconds()).padStart(2, '0')
      const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0')
      return `${dateStr}T${hours}:${minutes}:${seconds}.${milliseconds}Z`
    }

    // Try to parse as Date object
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? undefined : date.toISOString()
  }

  // Updated common fields calculation based on the extracted data
  const getCommonFields = () => {
    if (!enableOcrDataFill || formData.length === 0) {
      return {
        payer: '',
        serviceAuthNumber: '',
        memberId: '',
        diagnosisCode: '',
        taxonomy: '',
        umpiNumber: '',
        placeOfService: 'home'
      }
    }

    // Use the first form row as the source of common fields
    const firstRow = formData[0]
    return {
      payer: payerName,
      serviceAuthNumber: firstRow.agreementNumber || '',
      memberId: firstRow.recipientId || '',
      diagnosisCode: firstRow.diagnosisCode || '',
      taxonomy: firstRow.taxonomy || '',
      umpiNumber: firstRow.providerId || '',
      placeOfService: firstRow.placeOfService || 'home'
    }
  }

  const handleModalClose = (): void => {
    resetForm()
    onClose()
  }

  const handleAddRow = (): void => {
    setFormData([...formData, initialFormRow])
    setBillableStates([...billableStates, true])
  }

  const handleRemoveRow = (index: number): void => {
    if (formData.length > 1) {
      const updatedData = formData.filter((_: any, i: any) => i !== index)
      const updatedBillableStates = billableStates.filter((_, i) => i !== index)
      setFormData(updatedData)
      setBillableStates(updatedBillableStates)
    }
  }

  const handleBillableChange = (index: number): void => {
    const updatedBillableStates = [...billableStates]
    updatedBillableStates[index] = !updatedBillableStates[index]
    setBillableStates(updatedBillableStates)
  }

  const handleDateRangeChange = (index: number, dates: [Date | null, Date | null]): void => {
    const [startDate, endDate] = dates

    const updatedFormData = [...formData]
    updatedFormData[index] = {
      ...updatedFormData[index],
      startDate: parsedDate(startDate?.toLocaleDateString()),
      endDate: parsedDate(endDate?.toLocaleDateString())
    }
    setFormData(updatedFormData)
  }

  const commonFields = getCommonFields()

  // Updated handleSubmit function
  const handleSubmit = async (): Promise<void> => {
    try {
      setIsLoading(true)

      // Upload the PDF file using uploadDocuments if a file exists
      let fileKey: string | null = null
      if (rawFile) {
        const files = [
          {
            path: `./${rawFile.name}`, // Use file name as path (adjust if actual path is needed)
            size: rawFile.size,
            name: rawFile.name
          }
        ]
        const documentType = 'serviceAuthDocument' // Adjust based on your needs
        const uploadResults = await uploadDocuments([rawFile], documentType, clientId.toString())
        console.log('UPLOADED RESULTS ---->> ', uploadResults)
        if (uploadResults && uploadResults.length > 0) {
          fileKey = uploadResults[0]?.data?.uploadedDocument?.fileKey // Get fileKey from the first result
          console.log('Uploaded fileKey:', fileKey)
        }
      }

      console.log('formData before submission:', formData)

      // Prepare service auth payloads
      const serviceAuthPayloads = formData.map((item: FormRow, index: number) => ({
        payer: payerName,
        memberId: item.recipientId ? Number(item.recipientId) : 0,
        serviceAuthNumber: item.agreementNumber ? Number(item.agreementNumber) : 0,
        procedureCode: item.procedureCode || '',
        modifierCode: (item.modifierCode === '' ? null : item.modifierCode) || null,
        startDate: parsedDate(item.startDate),
        endDate: parsedDate(item.endDate),
        serviceRate: item.serviceRate ? Number(item.serviceRate.replace(/[$,]/g, '')) : 0,
        units: item.quantity ? Number(item.quantity.replace(/,/g, '')) : 0,
        usedUnits: 0,
        diagnosisCode: item.diagnosisCode || '',
        umpiNumber: item.providerId || '',
        reimbursementType: item.reimbursement || 'per unit',
        taxonomy: item.taxonomy,
        frequency: item.frequency || 'daily',
        clientId: clientId,
        billable: billableStates[index],
        placeOfService: item.placeOfService || 'home',
        serviceName:
          item.procedureCode === 'T1019' && item.modifierCode === 'U9'
            ? 'PCA (CFSS)'
            : item.procedureCode === 'S5116' && item.modifierCode === 'U9'
              ? 'WORKER TRNG & DEV'
              : item?.serviceName,
        serviceDescription: item?.serviceDescription,
        fileKey: fileKey || null // Use the uploaded file key if available
      }))

      console.log('Service Auth Payloads:', serviceAuthPayloads)

      const serviceAuthResponses = await Promise.all(
        serviceAuthPayloads.map((payload: any) => api.post(`/client/service-auth`, payload))
      )
      console.log('RESPONSE OCR', serviceAuthResponses)

      const accountHistoryPayLoad = {
        actionType: 'ClientServiceAuthCreate',
        details: `Service authorization list created for Client (ID: ${clientId}) by User (ID: ${authUser?.id})`,
        userId: authUser?.id,
        clientId
      }
      await api.post(`/account-history/log`, accountHistoryPayLoad)

      let createServicesResponse

      // Iterate over extractedData.serviceItems to send individual payloads
      if (extractedData?.serviceItems?.length > 0) {
        for (const item of formData) {
          console.log('Item to create ---->> ', item)
          const compareService =
            serviceAuthServices.find(
              (service: any) =>
                service.procedureCode === item.procedureCode &&
                (service.modifierCode === item.modifierCode ||
                  (service.modifierCode === null && item.modifierCode === null))
            ) || []
          console.log('Comparing Service ---->> ', compareService)
          if (new Date(item.endDate) > new Date()) {
            if (item.status === 'APPROVED') {
              if (compareService.length === 0) {
                console.log('Compare Service (If block) ---->> ', compareService)
                const ServiceAuthServicesPayload = {
                  name: item?.serviceName,
                  description: item?.description,
                  modifierCode: item?.modifierCode?.includes('PERSONAL') ? null : item?.modifierCode,
                  procedureCode: item?.procedureCode || '',
                  rate: item?.serviceRate ? Number(item?.serviceRate?.split('$')[1]) : 100,
                  evv: true
                }

                console.log(`Sending payload for service item:`, ServiceAuthServicesPayload)
                createServicesResponse = await api.post(`/service/service-auth/services`, ServiceAuthServicesPayload)
                console.log('CREATING SERVICE AUTH SERVICES ---->> ', createServicesResponse)
                const clientServicePayload = {
                  clientId: clientId,
                  serviceAuthServiceId: createServicesResponse?.data?.id,
                  note: '',
                  evvEnforce: true
                }

                const createClientServiceResponse = await api.post(`/client/client-service`, clientServicePayload)
                console.log('Client Service Creation Response ---->> ', createClientServiceResponse)
              } else {
                console.log('Service already exists, skipping creation.')
                const clientServicePayload = {
                  clientId: clientId,
                  serviceAuthServiceId: compareService.id,
                  note: '',
                  evvEnforce: true
                }

                const createClientServiceResponse = await api.post(`/client/client-service`, clientServicePayload)
                console.log('Client Service Creation Response ---->> ', createClientServiceResponse)
              }
            }
          }
        }
      } else {
        // Fallback to single payload if no extractedData (maintain existing behavior)
        if (new Date(serviceAuthResponses[0].data.endDate) > new Date()) {
          const compareService =
            serviceAuthServices.find(
              (service: any) =>
                service.procedureCode === serviceAuthResponses[0].data.procedureCode &&
                (service.modifierCode === serviceAuthResponses[0].data.modifierCode ||
                  (service.modifierCode === null && serviceAuthResponses[0].data.modifierCode === null))
            ) || []
          console.log('Compare Service (Else block) ---->> ', compareService)
          const ServiceAuthServicesPayload = {
            name: serviceAuthResponses[0].data.serviceName,
            description: serviceAuthResponses[0].data.serviceName,
            modifierCode: serviceAuthResponses[0].data.modifierCode || null,
            procedureCode: serviceAuthResponses[0].data.procedureCode,
            rate: serviceAuthResponses[0].data.serviceRate,
            evv: true
          }

          if (compareService.length === 0) {
            console.log('Service does not exist, creating new service.')
            createServicesResponse = await api.post(`/service/service-auth/services`, ServiceAuthServicesPayload)
            console.log('CREATING SERVICE AUTH SERVICES ---->> ', createServicesResponse)
            const clientServicePayload = {
              clientId: clientId,
              serviceAuthServiceId: createServicesResponse?.data?.id,
              note: '',
              evvEnforce: true
            }

            const createClientServiceResponse = await api.post(`/client/client-service`, clientServicePayload)
            console.log('Client Service Creation Response ---->> ', createClientServiceResponse)
          } else {
            console.log('Service already exists, skipping creation.')
            const clientServicePayload = {
              clientId: clientId,
              serviceAuthServiceId: compareService.id,
              note: '',
              evvEnforce: true
            }

            const createClientServiceResponse = await api.post(`/client/client-service`, clientServicePayload)
            console.log('Client Service Creation Response ---->> ', createClientServiceResponse)
          }
        }
      }

      await fetchClientServiceAuthData()
      await getClientDocuments()
      await fetchServiceAuthServices()
      if (fetchData) {
        await fetchData()
      }
      handleModalClose()
    } catch (error: any) {
      console.error('Error saving service auth list:', error)
      if (
        error?.response?.data?.message?.includes(
          'Failed to create client service auth: Service auth date range conflicts with existing service auth date range'
        )
      ) {
        setAlertOpen(true)
        setAlertProps({
          severity: 'error',
          message: 'Service auth date range conflicts with existing service auth date range'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Define the input interface
  interface QuantityPerFrequencyInput {
    startDate?: string | Date
    endDate?: string | Date
    quantity?: string | number
    frequency?: string
  }

  // List of supported frequencies
  type Frequency = 'daily' | 'weekly' | 'monthly'

  const calculateQuantityPerFrequency = ({
    startDate,
    endDate,
    quantity,
    frequency
  }: QuantityPerFrequencyInput): number => {
    // Helper function to parse quantity (string or number) into a number
    const parseQuantity = (qty: string | number | undefined): number => {
      if (qty === undefined || qty === null) return NaN
      if (typeof qty === 'number') return isNaN(qty) ? NaN : qty
      // Remove commas and convert string to number
      const cleaned = qty.replace(/,/g, '')
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? NaN : parsed
    }

    // Parse quantity
    const parsedQuantity = parseQuantity(quantity)

    // Validate inputs
    if (!startDate || !endDate || isNaN(parsedQuantity) || !frequency) {
      return NaN
    }

    // Convert dates to Date objects
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NaN
    }

    // Check if endDate is after startDate
    if (end <= start) {
      return NaN
    }

    // Calculate time difference in milliseconds
    const timeDiffMs = end.getTime() - start.getTime()

    // Calculate quantity per frequency
    let frequencyUnits: number
    switch (frequency.toLowerCase() as Frequency) {
      case 'daily':
        // Convert time difference to days
        frequencyUnits = timeDiffMs / (1000 * 60 * 60 * 24)
        break
      case 'weekly':
        // Convert time difference to weeks
        frequencyUnits = timeDiffMs / (1000 * 60 * 60 * 24 * 7)
        break
      case 'monthly':
        // Calculate months (approximate using average days per month: 30.42)
        frequencyUnits = timeDiffMs / (1000 * 60 * 60 * 24 * 30.42)
        break
      default:
        return NaN // Unsupported frequency
    }

    // Calculate quantity per frequency
    if (frequencyUnits <= 0) {
      return NaN
    }

    return parsedQuantity / frequencyUnits
  }
  const isFormValid = formData.every(
    (row: {
      serviceName: string
      procedureCode: string
      startDate: string
      endDate: string
      serviceRate: string
      quantity: string
      providerId: string
      agreementNumber: string
      diagnosisCode: string
      recipientId: string
    }) =>
      row.serviceName?.trim() !== '' &&
      row.procedureCode?.trim() !== '' &&
      row.startDate?.trim() !== '' &&
      row.endDate?.trim() !== '' &&
      row.quantity?.trim() !== '' &&
      row.agreementNumber?.trim() !== '' &&
      row.providerId?.trim() !== '' &&
      row.diagnosisCode?.trim() !== '' &&
      row.recipientId?.trim() !== ''
  )

  return (
    <>
      <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
      <Dialog
        open={open}
        onClose={handleModalClose}
        maxWidth='lg'
        sx={{
          '& .MuiDialog-paper': {
            overflow: 'visible',
            maxHeight: '90vh',
            width: '100%'
          },
          '& .MuiDialogContent-root': {
            overflowY: 'auto'
          }
        }}
      >
        <DialogCloseButton onClick={handleModalClose} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <DialogContent sx={{ overflowY: 'auto', maxHeight: 'calc(90vh - 64px)', position: 'relative' }}>
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <CircularProgress size={40} color='success' />
            </Box>
          )}
          <Box sx={{ filter: isLoading ? 'blur(0.8px)' : 'none', pointerEvents: isLoading ? 'none' : 'auto' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                position: 'sticky',
                top: 0,
                zIndex: 5,
                px: 3,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                Service Authorization List
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginRight: '1rem' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={enableOcrDataFill}
                      onChange={event => setEnableOcrDataFill(event.target.checked)}
                      disabled={isLoading}
                    />
                  }
                  label='OCR'
                />
                <Button variant='contained' onClick={handleModalClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  onClick={handleSubmit}
                  disabled={isLoading || formData.length === 0 || !isFormValid}
                >
                  Submit
                </Button>
                <Button variant='contained' component='label' disabled={isLoading}>
                  Upload PDF
                  <input type='file' hidden accept='application/pdf' onChange={handlePDFUpload} />
                </Button>
              </Box>
            </Box>

            {/* General Info Card */}
            <Card sx={{ mx: 2, mb: 2, boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 20px' }}>
              <CardHeader title='General Info' />
              <CardContent>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    {/* <TextField label='Payer' value={commonFields.payer} fullWidth size='small' disabled={isLoading} /> */}
                    <OcrCustomDropDown
                      label='Payer'
                      name='payer'
                      value={payerName}
                      onChange={(e: any) => setPayerName(e.target.value)}
                      optionList={payerOptions}
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label='Member ID'
                      value={commonFields.memberId}
                      onChange={e => handleCommonFieldChange('memberId', e.target.value)}
                      fullWidth
                      size='small'
                      disabled={isLoading}
                      required={true}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label='Service Auth Number'
                      value={commonFields.serviceAuthNumber}
                      onChange={e => handleCommonFieldChange('serviceAuthNumber', e.target.value)}
                      fullWidth
                      size='small'
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label='Diagnosis Code'
                      value={commonFields.diagnosisCode}
                      onChange={e => handleCommonFieldChange('diagnosisCode', e.target.value)}
                      fullWidth
                      size='small'
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label='Taxonomy'
                      value={commonFields.taxonomy}
                      onChange={e => handleCommonFieldChange('taxonomy', e.target.value)}
                      fullWidth
                      size='small'
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label='Npi/Umpi'
                      value={commonFields.umpiNumber}
                      onChange={e => handleCommonFieldChange('umpiNumber', e.target.value)}
                      fullWidth
                      size='small'
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <OcrCustomDropDown
                      label='Place Of Service'
                      name='placeOfService'
                      value={commonFields.placeOfService}
                      onChange={(e: any) => handleCommonFieldChange('placeOfService', e.target.value)}
                      optionList={placeOfServiceOptions}
                      disabled={isLoading}
                    />
                  </Grid>
                </Grid>
              </CardContent>

              <Box
                sx={{
                  height: '20px',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: '-16px',
                    right: '-16px',
                    height: '5px',
                    backgroundColor: theme.palette.mode === 'light' ? '#C1C1C1' : '#212131',
                    boxShadow: 'rgba(0, 0, 0, 0.1) 0px -2px 5px, rgba(0, 0, 0, 0.1) 0px 2px 5px',
                    zIndex: 0
                  }
                }}
              />

              <Typography
                variant='h5'
                sx={{
                  marginInlineStart: '25px'
                }}
              >
                Services
              </Typography>
              <CardContent>
                {formData.map((row: FormRow, index: number) => (
                  <Box key={index} sx={{ mb: 4, position: 'relative' }}>
                    <Grid container spacing={2} alignItems='center'>
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                          <Divider sx={{ flex: 1 }} />
                          <Typography variant='h6' sx={{ textAlign: 'center', minWidth: '2rem' }}>
                            {index + 1}
                          </Typography>
                          <Divider sx={{ flex: 1 }} />
                        </Box>
                        {formData.length >= 1 && (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={billableStates[index]}
                                  onChange={() => handleBillableChange(index)}
                                  disabled={isLoading}
                                />
                              }
                              label='Billable'
                            />
                            <Typography
                              onClick={() => handleRemoveRow(index)}
                              className='text-sm text-red-500 cursor-pointer'
                              sx={{ pointerEvents: isLoading ? 'none' : 'auto' }}
                            >
                              Remove
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          label='Service Name'
                          value={row.serviceName}
                          onChange={e => handleInputChange(index, 'serviceName', e.target.value)}
                          fullWidth
                          size='small'
                          disabled={isLoading}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          label='Service Description'
                          value={row.serviceDescription}
                          onChange={e => handleInputChange(index, 'serviceDescription', e.target.value)}
                          fullWidth
                          size='small'
                          disabled={isLoading}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          label='Procedure Code'
                          value={row.procedureCode}
                          onChange={e => handleInputChange(index, 'procedureCode', e.target.value)}
                          fullWidth
                          size='small'
                          disabled={isLoading}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          label='Modifier'
                          value={row.modifierCode}
                          onChange={e => handleInputChange(index, 'modifierCode', e.target.value)}
                          fullWidth
                          size='small'
                          disabled={isLoading}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <AppReactDatepicker
                          selectsRange
                          startDate={row.startDate ? startOfDay(parseISO(row.startDate)) : null}
                          endDate={row.endDate ? startOfDay(parseISO(row.endDate)) : null}
                          id={`dateRange_${index}`}
                          onChange={(dates: [Date | null, Date | null]) => handleDateRangeChange(index, dates)}
                          placeholderText='MM/DD/YYYY - MM/DD/YYYY'
                          customInput={
                            <TextField
                              fullWidth
                              size='small'
                              label='Start and End Date'
                              placeholder='MM/DD/YYYY - MM/DD/YYYY'
                              disabled={isLoading}
                              InputProps={{
                                endAdornment: (
                                  <IconButton size='small'>
                                    <CalendarTodayIcon style={{ scale: 1 }} />
                                  </IconButton>
                                )
                              }}
                            />
                          }
                          // popperPlacement='bottom'
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          label='Service Rate'
                          value={row.serviceRate}
                          onChange={e => handleInputChange(index, 'serviceRate', e.target.value)}
                          fullWidth
                          size='small'
                          disabled={isLoading}
                          type='number'
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <OcrCustomDropDown
                          label='Reimbursement'
                          name={`reimbursement_${index}`}
                          value={row.reimbursement}
                          onChange={(e: any) => handleInputChange(index, 'reimbursement', e.target.value as string)}
                          optionList={[
                            { key: 1, value: 'per unit', optionString: 'Per Unit' },
                            { key: 2, value: 'per diem', optionString: 'Per Diem' }
                          ]}
                          disabled={isLoading}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          label='Quantity'
                          value={row.quantity}
                          onChange={e => handleInputChange(index, 'quantity', e.target.value)}
                          fullWidth
                          size='small'
                          disabled={isLoading}
                          type='number'
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <OcrCustomDropDown
                          label='Frequency'
                          name={`frequency_${index}`}
                          value={row.frequency}
                          onChange={(e: any) => handleInputChange(index, 'frequency', e.target.value as string)}
                          optionList={[
                            { key: 1, value: 'daily', optionString: 'Daily' },
                            { key: 2, value: 'weekly', optionString: 'Weekly' },
                            { key: 3, value: 'monthly', optionString: 'Monthly' }
                          ]}
                          disabled={isLoading}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Typography sx={{ paddingBottom: 0, marginBottom: -0.8 }}>Quantity per Frequency </Typography>
                        {isNaN(
                          calculateQuantityPerFrequency({
                            startDate: row.startDate,
                            endDate: row.endDate,
                            quantity: row.quantity,
                            frequency: row.frequency
                          })
                        )
                          ? 'N/A'
                          : calculateQuantityPerFrequency({
                              startDate: row.startDate,
                              endDate: row.endDate,
                              quantity: row.quantity,
                              frequency: row.frequency
                            }).toFixed(2)}{' '}
                      </Grid>
                    </Grid>
                    {index === formData.length - 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Typography
                          onClick={handleAddRow}
                          className='text-sm text-green-400 cursor-pointer'
                          sx={{ pointerEvents: isLoading ? 'none' : 'auto' }}
                        >
                          Add
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* PDF Attachment Card */}
            {uploadedFile && (
              <Card sx={{ mx: 2, mb: 2, boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 20px' }}>
                <CardHeader title='PDF Attachment' />
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12 }}>
                      <Box>
                        <Typography variant='subtitle1'>Uploaded PDF Details:</Typography>
                        <Typography variant='body2'>File Name: {uploadedFile.name}</Typography>
                        <Typography variant='body2'>File Extension: {uploadedFile.extension}</Typography>
                        <Typography variant='body2'>File Size: {uploadedFile.size}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

'use client'
import { Button, Card, CardContent, CircularProgress, Dialog, Tab, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import React, { useEffect, useState } from 'react'
import InfoCard from '../../../components/InfoCard'
import CustomTabList from '@/@core/components/mui/TabList'
import AllFilesTab from './AllFilesTab'
import SentFilesTab from './SentFilesTab'
import RecievedFilesTab from './RecievedFilesTab'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { PDFDocument, PDFTextField, PDFRadioGroup, PDFCheckBox, PDFDropdown, PDFOptionList, PDFButton } from 'pdf-lib'
import axios from 'axios'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { FormProvider, useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import api from '@/utils/api'
import { generateOptions } from '@/utils/helperFunctions'
import Dropdown from '@/@core/components/mui/DropDown'
import { useParams } from 'next/navigation'
import CustomAlert from '@/@core/components/mui/Alter'

// Define PDF field type
type PdfField = {
  name: string
  type: string
}

type DeepValueType<T, P extends string> = P extends `${infer Key}[${infer Index}].${infer Rest}`
  ? Key extends keyof T
  ? T[Key] extends (infer U)[]
  ? DeepValueType<U, `${Rest}`>
  : never
  : never
  : P extends `${infer Key}[${infer Index}]`
  ? Key extends keyof T
  ? T[Key] extends (infer U)[]
  ? U
  : never
  : never
  : P extends keyof T
  ? T[P]
  : never

// Define form sections
const formSections: { [key: string]: string } = {
  'date-of-referral': 'Referral Dates',
  'date-SA-ends': 'Referral Dates',
  'date-of-assesessment': 'Referral Dates',
  'recip-info': 'Recipient Information',
  physician: 'Physician Information',
  'PCA-provider1': 'PCA Provider 1 Information',
  'PCA-provider2': 'PCA Provider 2 Information',
  language: 'Language',
  'direct-own-care': 'Direct Own Care/Responsible Party',
  diagnosis: 'Diagnosis and Living Arrangement',
  'living-arrangement': 'Diagnosis and Living Arrangement',
  'other-comments': 'Diagnosis and Living Arrangement',
  OtherPerson: 'Other Person Detail',
  Responsible: 'Responsible Party Details',
  PWD: 'Basic Details',
  Signed: 'Signature Section'
}

const E_Document = () => {
  // State declarations
  const [activeTab, setActiveTab] = useState('allFilesTab')
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [clientDocsLoading, setClientDocsLoading] = useState<boolean>(false)
  const [pdfObj, setPdfObj] = useState<any>()
  const [selectedForm, setSelectedForm] = useState<any>('')
  const [caseManagerEmail, setCaseManagerEmail] = useState<any>('')
  const [pdfBlob, setPdfBlob] = useState<any>()
  const [tenantDocuments, setTenantDocuments] = useState<any>([])
  const [clientDocuments, setClientDocuments] = useState<any>([])
  const [pdfFields, setPdfFields] = useState<PdfField[]>([])
  const [clientData, setClientData] = useState<any>(null)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()
  const { id } = useParams()
  const [docTitle, setDocTitle] = useState<string>()
  const [pdfFormMappings, setPdfFormMappings] = useState<any[]>([])
  const [selectedMapping, setSelectedMapping] = useState<any>(null)
  const [dynamicFieldMappings, setDynamicFieldMappings] = useState<any[]>([])
  const [emailSubject, setEmailSubject] = useState<string>('')
  const [emailBody, setEmailBody] = useState<string>('')
  const [emailSending, setEmailSending] = useState<boolean>(false)
  const [showHtmlForm, setShowHtmlForm] = useState<boolean>(true)
  const [htmlFormData, setHtmlFormData] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await api.get(`/client/detail/${id}`)
      console.log('CLIENT RES', response.data)
      setClientData(response.data)
    } catch (error) {
      console.error('Error fetching data', error)
    }
  }
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }

  // Initialize form
  const methods = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = methods

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      const response = await api.get(`/tenant/tenant-documents/${authUser?.tenant?.id}`)
      console.log('TENANT DOCS RESP', response.data)
      const tenantDocs = response?.data?.filter((item: any) => !item.isDeleted)

      const resp = await api.get(`/pdf-form-mapping/tenant/${authUser?.tenant?.id}`)
      console.log('PDF FORM MAPPING RESP', resp.data)
      setPdfFormMappings(resp.data)

      // Create options from both tenant documents and mapped forms
      const tenantOptions = generateOptions(tenantDocs)

      // Add mapped forms to options
      const mappedFormOptions = resp.data
        .filter((mapping: any) => !mapping.tenantDocument.isDeleted)
        .map((mapping: any) => ({
          key: mapping.tenantDocument.fileKey,
          value: mapping.tenantDocument.fileName,
          mappingId: mapping.id,
          hasMappings: true
        }))

      // Combine and deduplicate options
      const allOptions = [
        ...tenantOptions,
        ...mappedFormOptions.filter((mapped: any) => !tenantOptions.some((tenant: any) => tenant.value === mapped.key))
      ]

      setTenantDocuments(allOptions)

      const clientEmailsHistoryRes = await api.get(`/client/email-history`)
      console.log("Client's Email History Retrieved ---->> ", clientEmailsHistoryRes.data)
      setClientDocuments(clientEmailsHistoryRes.data)
    } catch (error) {
      console.error('Error fetching initial data:', error)
    }
  }

  const getClientDataValue = (clientDataKey: string): string => {
    if (!clientData) return ''
    console.log('ClientData', clientData)

    // Handle special cases first
    if (clientDataKey === 'fullName') {
      const firstName = clientData.firstName || ''
      const lastName = clientData.lastName || ''
      return `${firstName} ${lastName}`.trim()
    }

    // Handle nested properties like "address.city", "clientPhysician.name"
    const keys = clientDataKey.split('.')
    console.log('keys', keys)
    let value = clientData

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]

      if (key === 'address' && keys.length > 1 && i === 0) {
        // Only use addresses array if it's a nested property like "address.city" and it's the first key
        const residentialAddress = clientData?.addresses?.find(
          (addr: any) => addr.address.addressType === 'Residential'
        )?.address

        const mailingAddress = clientData?.addresses?.find(
          (addr: any) => addr.address.addressType === 'Mailing'
        )?.address

        // Use residential address first, then mailing, then first available
        value = residentialAddress || mailingAddress || clientData?.addresses?.[0]?.address || {}
      } else if (key === 'address' && keys.length === 1) {
        // For single "address" key, use the address string directly from residential address
        const residentialAddress = clientData?.addresses?.find(
          (addr: any) => addr.address.addressType === 'Residential'
        )?.address?.address

        const mailingAddress = clientData?.addresses?.find((addr: any) => addr.address.addressType === 'Mailing')
          ?.address?.address

        return residentialAddress || mailingAddress || clientData?.addresses?.[0]?.address?.address || ''
      } else if (key === 'address' && i > 0) {
        // If "address" appears again in the path (like "address.address"),
        // access the address property of the address object
        value = value?.address || ''
        break // Return early since we found the final address string
      } else if (key === 'clientPhysician') {
        value = clientData?.clientPhysician || {}
      } else if (key === 'clientResponsibilityParty') {
        value = clientData?.clientResponsibilityParty || {}
      } else if (key === 'clientCaseManager') {
        value = clientData?.clientCaseManager || {}
      } else {
        // For direct properties or continuation of nested access
        value = value?.[key]
      }

      if (value === null || value === undefined) return ''
    }

    return String(value || '')
  }

  const fetchClientsForm = async () => {
    try {
      setClientDocsLoading(true)
      setLoading(true)
      const clientDocs = await api.get(`/client/client-documents/${id}`)
      const clientData = await api.get(`/client/case-manager/${id}`)
      setCaseManagerEmail(clientData?.data?.clientCaseManager?.caseManagerEmail)
      // setClientDocuments(clientDocs?.data)
      setClientDocsLoading(false)
      setLoading(false)
    } catch (error) {
      setClientDocsLoading(false)
      setLoading(false)
      console.error('Error fetching initial data:', error)
    }
  }

  useEffect(() => {
    fetchInitialData()
    fetchClientsForm()
  }, [])

  // Load and extract PDF fields

  const GetPrePopulatedPdf = async (key: any) => {
    console.log('Selected PDF Key ---->> ', key)
    try {
      setLoading(true)

      // Find if this PDF has mappings
      const mappingData = pdfFormMappings.find(mapping => mapping.tenantDocument.fileKey === key)

      setSelectedMapping(mappingData)

      const { data: existingPdf } = await axios.get(`https://carekey-docs-dev.s3.us-east-1.amazonaws.com/${key}`, {
        responseType: 'arraybuffer'
      })

      const pdfDoc = await PDFDocument.load(existingPdf, { ignoreEncryption: true })
      const docTitle = pdfDoc.getTitle()
      setDocTitle(docTitle)

      const form = pdfDoc.getForm()
      const fields = form.getFields()

      console.log('EDOCS EXTRACTED FIELDS ---->> ', fields)

      const extractedFields: PdfField[] = fields.map(field => {
        let type = 'unknown'
        console.log('FIELD INSTANCE ---->> ', field)
        if (field instanceof PDFTextField) {
          type = 'PDFTextField'
        } else if (field instanceof PDFRadioGroup) {
          type = 'PDFRadioGroup'
        } else if (field instanceof PDFCheckBox) {
          type = 'PDFCheckBox'
        } else if (field instanceof PDFDropdown) {
          type = 'PDFDropdown'
        } else if (field instanceof PDFOptionList) {
          type = 'PDFOptionList'
        } else if (field instanceof PDFButton) {
          type = 'PDFButton'
        }
        return {
          name: field.getName(),
          type
        }
      })

      setPdfFields(extractedFields)

      // If mappings exist, prepare HTML form data and show HTML form first
      if (mappingData?.mappedFields?.fieldMappings) {
        const fieldMappings = mappingData.mappedFields.fieldMappings
        setDynamicFieldMappings(fieldMappings)

        // Initialize HTML form data with client values
        const initialFormData: { [key: string]: string } = {}
        fieldMappings.forEach((mapping: any) => {
          const { pdfFieldName, clientDataKey } = mapping
          const clientValue = getClientDataValue(clientDataKey)
          initialFormData[pdfFieldName] = clientValue
        })
        setHtmlFormData(initialFormData)

        // Set to show HTML form first
        setShowHtmlForm(true)
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      setPdfObj(pdfBytes)
      const blobUrl = URL.createObjectURL(blob)
      setPdfBlob(blobUrl)
    } catch (error) {
      console.error('Error modifying PDF:', error)
    } finally {
      setLoading(false)
    }
  }

  function getDeepValue<T extends Record<string, any>, P extends string>(
    obj: T | null | undefined,
    path: P
  ): DeepValueType<T, P> | undefined {
    return path.split('.').reduce((o: any, p: string) => {
      if (o === null || o === undefined) return undefined

      const arrayMatch = p.match(/(\w+)\[(\d+)\]/)
      if (arrayMatch) {
        const prop = arrayMatch[1]
        const index = parseInt(arrayMatch[2], 10)
        return o[prop]?.[index]
      }
      return o[p]
    }, obj)
  }

  // Handle form save (for preview)
  const handleSave = async (data: any) => {
    try {
      console.log('Form Data:', data)
      const pdfDoc = await PDFDocument.load(pdfObj)
      const form = pdfDoc.getForm()
      console.log('EDOCS EXTRACTED FIELDS DURING SAVE', pdfFields)

      // Update PDF fields based on form data
      pdfFields.forEach(field => {
        try {
          if ((field.type === 'PDFTextField' && data[field.name]) || getDeepValue(data, field.name)) {
            const textField = form.getTextField(field.name)
            textField.setText(data[field.name] || getDeepValue(data, field.name))
            textField.setFontSize(8)
          } else if (field.type === 'PDFRadioGroup' && data[field.name]) {
            form.getRadioGroup(field.name).select(data[field.name])
          } else if (field.type === 'PDFCheckBox' && data[field.name]) {
            form.getCheckBox(field.name).check()
          }
        } catch (e) {
          console.error(`Error setting field ${field.name}:`, e)
        }
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const blobUrl = URL.createObjectURL(blob)

      // Update both the blob URL and pdfObj state
      setPdfBlob(blobUrl)
      setPdfObj(pdfBytes) // This is the key addition

      console.log('PDF saved successfully, new blob URL:', blobUrl)
    } catch (error) {
      console.error('Error saving PDF:', error)
    }
  }

  // Handle form selection
  const onFormChange = (e: any) => {
    setSelectedForm(e.target.value)
    setDynamicFieldMappings([])
    setSelectedMapping(null)
    GetPrePopulatedPdf(e.target.value)
  }

  // Handle dialog close
  const onClose = () => {
    setOpenModal(false)
    setSelectedForm('')
    setPdfBlob(null)
    setPdfFields([])
    setDynamicFieldMappings([])
    setSelectedMapping(null)
    setEmailSubject('') // Add this
    setEmailBody('') // Add this
    setEmailSending(false) // Add this
    setShowHtmlForm(true) // Reset to HTML form view
    setHtmlFormData({}) // Clear HTML form data
    reset()
  }

  // Handle HTML form input change
  const handleHtmlFormChange = (fieldName: string, value: string) => {
    setHtmlFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  // Handle HTML form finish - map values to PDF
  const handleHtmlFormFinish = async () => {
    try {
      setLoading(true)

      // Load the PDF
      const pdfDoc = await PDFDocument.load(pdfObj)
      const form = pdfDoc.getForm()

      // Map HTML form data to PDF fields using dynamicFieldMappings
      dynamicFieldMappings.forEach((mapping: any) => {
        const { pdfFieldName, fieldType } = mapping
        const value = htmlFormData[pdfFieldName]

        if (value && form) {
          try {
            if (fieldType === 'PDFTextField') {
              const textField = form.getTextField(pdfFieldName)
              textField.setText(value)
              textField.setFontSize(8)
            } else if (fieldType === 'PDFRadioGroup') {
              const radioGroup = form.getRadioGroup(pdfFieldName)
              const options = radioGroup.getOptions()
              if (options.includes(value)) {
                radioGroup.select(value)
              }
            } else if (fieldType === 'PDFCheckBox') {
              const checkbox = form.getCheckBox(pdfFieldName)
              if (value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes') {
                checkbox.check()
              }
            } else if (fieldType === 'PDFDropdown') {
              const dropdown = form.getDropdown(pdfFieldName)
              const options = dropdown.getOptions()
              if (options.includes(value)) {
                dropdown.select(value)
              }
            }
          } catch (error) {
            console.error(`Error setting field ${pdfFieldName}:`, error)
          }
        }
      })

      // Save and update PDF
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      setPdfObj(pdfBytes)
      const blobUrl = URL.createObjectURL(blob)
      setPdfBlob(blobUrl)

      // Switch to PDF view
      setShowHtmlForm(false)
    } catch (error) {
      console.error('Error processing HTML form:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle back to HTML form
  const handleBackToHtmlForm = () => {
    setShowHtmlForm(true)
  }

  // Render HTML form field based on mapping
  const renderHtmlFormField = (mapping: any) => {
    const { pdfFieldName, clientDataLabel, fieldType, clientDataKey, options } = mapping
    const defaultValue = getClientDataValue(clientDataKey)
    const currentValue = htmlFormData[pdfFieldName] || defaultValue || ''

    console.log('PDF field Name and Type ---->> ', pdfFieldName, fieldType, ' | Client Data Key ---->> ', clientDataKey)

    if (fieldType === 'PDFTextField') {
      return (
        <div key={pdfFieldName} className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>{clientDataLabel}</label>
          <input
            type='text'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            value={currentValue}
            onChange={e => handleHtmlFormChange(pdfFieldName, e.target.value)}
            placeholder={`Enter ${clientDataLabel}`}
          />
        </div>
      )
    } else if (fieldType === 'PDFRadioGroup' || fieldType === 'PDFDropdown') {
      // For radio groups and dropdowns, we need to get options
      let optionsArray: string[] = []
      if (clientDataKey === 'gender') {
        optionsArray = ['Male', 'Female']
      } else {
        // Try to extract optionsArray from the PDF field if available
        // For now, use a text input as fallback
        optionsArray = options ? options : []
      }

      if (optionsArray.length > 0) {
        return (
          <div key={pdfFieldName} className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>{clientDataLabel}</label>
            <select
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              value={currentValue}
              onChange={e => handleHtmlFormChange(pdfFieldName, e.target.value)}
            >
              <option value=''>Select {clientDataLabel}</option>
              {optionsArray.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )
      } else {
        return (
          <div key={pdfFieldName} className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>{clientDataLabel}</label>
            <input
              type='text'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              value={currentValue}
              onChange={e => handleHtmlFormChange(pdfFieldName, e.target.value)}
              placeholder={`Enter ${clientDataLabel}`}
            />
          </div>
        )
      }
    } else if (fieldType === 'PDFCheckBox') {
      return (
        <div key={pdfFieldName} className='mb-4 flex items-center'>
          <input
            type='checkbox'
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            checked={currentValue === 'true' || currentValue === '1' || currentValue.toLowerCase() === 'yes'}
            onChange={e => handleHtmlFormChange(pdfFieldName, e.target.checked ? 'true' : 'false')}
          />
          <label className='ml-2 block text-sm font-medium text-gray-700'>{clientDataLabel}</label>
        </div>
      )
    }

    return null
  }
  const handleFillReferenceButton = () => {
    if (!caseManagerEmail) {
      setAlertOpen(true)
      setAlertProps({
        message: 'Create case manager to proceed further.',
        severity: 'error'
      })
      return
    }
    setOpenModal(true)
  }

  // Group fields by section
  const groupedFields: { [key: string]: PdfField[] } = {}
  pdfFields.forEach(field => {
    if (field.name === 'clear_button 2' || field.name.includes('Clear')) return // Skip buttons
    const sectionKey = Object.keys(formSections).find(key => field.name.includes(key))
    const section = sectionKey ? formSections[sectionKey] : 'Other'
    if (!groupedFields[section]) {
      groupedFields[section] = []
    }
    groupedFields[section].push(field)
  })

  const renderFormField = async (field: PdfField) => {
    if (field.name.includes('Pages') || field.name === 'clear_button 2' || field.name.includes('Clear')) return null

    // Find mapping for this field
    const fieldMapping = dynamicFieldMappings.find(mapping => mapping.pdfFieldName === field.name)

    if (!fieldMapping) return null // Only render fields that have mappings

    const label = fieldMapping.clientDataLabel || field.name
    const error = errors[field.name]
    const defaultValue = getClientDataValue(fieldMapping.clientDataKey)

    if (field.type === 'PDFTextField') {
      let maxLength: number | undefined
      if (field.name.includes('state') || field.name.includes('State')) {
        maxLength = 2
      } else if (field.name.includes('MI')) {
        maxLength = 1
      } else if (field.name.includes('NPIUMPI')) {
        maxLength = 10
      }

      return (
        <Grid
          size={{ xs: 12, sm: field.name.includes('state') || field.name.includes('zip') ? 3 : 6 }}
          key={field.name}
        >
          <CustomTextField
            label={label}
            placeHolder={label}
            name={field.name}
            defaultValue={defaultValue}
            type='text'
            maxLength={maxLength}
            error={error}
            control={control}
            isRequired={false}
          />
        </Grid>
      )
    } else if (field.type === 'PDFRadioGroup') {
      // For radio groups, create dynamic options or use default
      let options = []
      if (fieldMapping.clientDataKey === 'gender') {
        options = [
          { key: 'Male', value: 'Male', optionString: 'Male' },
          { key: 'Female', value: 'Female', optionString: 'Female' }
        ]
      } else {
        // Try to get options from the PDF field itself
        try {
          const { data: existingPdf } = await axios.get(
            `https://carekey-docs-dev.s3.us-east-1.amazonaws.com/${selectedForm}`,
            {
              responseType: 'arraybuffer'
            }
          )
          const pdfDoc = await PDFDocument.load(existingPdf, { ignoreEncryption: true })
          const form = pdfDoc.getForm()
          const radioGroup = form.getRadioGroup(field.name)
          const pdfOptions = radioGroup.getOptions()
          options = pdfOptions.map(opt => ({ key: opt, value: opt, optionString: opt }))
        } catch {
          options = [{ key: defaultValue, value: defaultValue, optionString: defaultValue }]
        }
      }

      return (
        <Grid size={{ xs: 12, sm: 6 }} key={field.name}>
          <CustomDropDown
            name={field.name}
            control={control}
            error={error}
            label={label}
            optionList={options}
            defaultValue={defaultValue}
            isRequired={false}
          />
        </Grid>
      )
    }

    return null
  }

  const updatePdfWithCurrentFormData = async () => {
    try {
      // Get current form values
      const formData = methods.getValues()

      // Only update if there are form changes or if it's a manual form
      if (Object.keys(formData).length > 0 || !selectedMapping) {
        await handleSave(formData)
      }

      // Fetch the current PDF state from the blob
      const response = await fetch(pdfBlob)
      const arrayBuffer = await response.arrayBuffer()

      // Update pdfObj state
      setPdfObj(arrayBuffer)

      return arrayBuffer
    } catch (error) {
      console.error('Error updating PDF with form data:', error)
      throw error
    }
  }

  const handleDownloadPdf = async () => {
    try {
      // Always update PDF with current form data first
      const formData = methods.getValues()
      await handleSave(formData) // This updates pdfObj with form data

      // Then use the updated pdfObj for download
      const blob = new Blob([pdfObj], { type: 'application/pdf' })
      const downloadUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${selectedMapping.tenantDocument.fileName.replace('.pdf', '')}_${clientData?.firstName || 'client'}_${clientData?.lastName || 'form'}.pdf`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  const handleSendEmailWithPdf = async () => {
    if (!caseManagerEmail) {
      console.error('No case manager email available')
      return
    }

    try {
      setEmailSending(true)

      // Update PDF with current form data
      const currentPdfData = await updatePdfWithCurrentFormData()

      // Create and send email
      const pdfFile = new File([currentPdfData], `${selectedMapping.tenantDocument.fileName}`, {
        type: 'application/pdf'
      })

      const formData = new FormData()
      formData.append('file', pdfFile)
      formData.append('recipientEmail', caseManagerEmail)
      formData.append('subject', emailSubject)
      formData.append('emailBody', emailBody)
      formData.append('clientId', clientData.id.toString())
      formData.append('senderName', authUser?.userName || 'System')
      formData.append('clientName', `${clientData?.firstName || ''} ${clientData?.lastName || ''}`.trim())

      await api.post(`/client/send-pdf-email/${clientData.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Success handling
      setAlertOpen(true)
      setAlertProps({
        message: `PDF successfully sent to ${caseManagerEmail}`,
        severity: 'success'
      })

      setEmailSubject('')
      setEmailBody('')
    } catch (error) {
      console.error('Error sending email:', error)
      setAlertOpen(true)
      setAlertProps({
        message: 'Failed to send PDF via email. Please try again.',
        severity: 'error'
      })
    } finally {
      setEmailSending(false)
    }
  }

  return (
    <>
      <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
      <TabContext value={activeTab}>
        <Dialog
          open={openModal}
          onClose={onClose}
          closeAfterTransition={false}
          sx={{
            '& .MuiDialog-paper': {
              overflow: 'visible',
              width: '90vw',
              height: selectedForm ? '90vh' : '30vh',
              maxWidth: '1600px',
              maxHeight: '1000px',
              position: 'relative'
            }
          }}
        >
          <DialogCloseButton onClick={onClose} disableRipple>
            <i className='text-red-500 bx-x' />
          </DialogCloseButton>

          {loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10
              }}
            >
              <CircularProgress />
            </div>
          )}
          <div className='flex justify-between p-3'>
            <div className='flex gap-2 items-center justify-center'>
              <Typography className='text-base font-thin'>Select Form:</Typography>
              <Dropdown
                className='w-80'
                placeholder='Select Form'
                value={selectedForm}
                setValue={(e: string) => setSelectedForm(e)}
                options={tenantDocuments}
                onChange={onFormChange}
              />
            </div>

            {/* {selectedForm && pdfBlob && !loading && (
              <Button variant='contained' onClick={handleUpload} disabled={!isDirty}>
                Save
              </Button>
            )} */}
          </div>

          {selectedForm && pdfBlob && !loading && (
            <Grid className='w-full h-full flex flex-row'>
              {showHtmlForm && selectedMapping ? (
                // Show HTML form for mapped PDFs
                <Card className='w-full h-[100%] overflow-y-auto'>
                  <CardContent className='p-6'>
                    <Typography className='font-semibold text-2xl mb-4'>
                      Fill Form: {selectedMapping.tenantDocument.fileName}
                    </Typography>

                    <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md'>
                      <Typography className='text-blue-800 font-medium'>
                        ℹ️ Please fill in the form fields below
                      </Typography>
                      <Typography className='text-blue-600 text-sm mt-1'>
                        Fields are pre-populated with client data where available. You can modify any values before
                        generating the PDF.
                      </Typography>
                    </div>

                    {/* Render form fields */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {dynamicFieldMappings.map(mapping => renderHtmlFormField(mapping))}
                    </div>

                    {/* Finish button */}
                    <div className='flex justify-end mt-6 pt-4 border-t border-gray-200'>
                      <Button variant='contained' onClick={handleHtmlFormFinish} size='large'>
                        Done - Generate PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Show PDF view with case manager section
                <>
                  <Card className='w-[50%] h-[100%] overflow-y-auto'>
                    <Typography className='font-semibold text-2xl m-4'>
                      {selectedMapping
                        ? `${selectedMapping.tenantDocument.fileName} (Generated)`
                        : docTitle || 'PDF Form'}
                    </Typography>
                    <CardContent>
                      {selectedMapping ? (
                        <div>
                          {/* Back button */}
                          <div className='mb-4'>
                            <Button
                              variant='outlined'
                              startIcon={<i className='bx-arrow-back' />}
                              onClick={handleBackToHtmlForm}
                            >
                              Back to Form
                            </Button>
                          </div>

                          <div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-md'>
                            <Typography className='text-green-800 font-medium'>
                              ✓ PDF has been generated with your form data
                            </Typography>
                            <Typography className='text-green-600 text-sm mt-1'>
                              Review the PDF on the right. You can go back to edit or send it to the case manager.
                            </Typography>
                          </div>

                          {/* Case Manager Information */}
                          <div className='mb-4 p-4 border border-gray-200 rounded-md'>
                            <Typography className='font-medium mb-2'>📧 Case Manager Information</Typography>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                              <div>
                                <Typography className='text-sm font-semibold'>Name:</Typography>
                                <Typography className='text-sm font-medium'>
                                  {clientData?.clientCaseManager?.caseManagerName || 'Not assigned'}
                                </Typography>
                              </div>
                              <div>
                                <Typography className='text-sm font-semibold'>Email:</Typography>
                                <Typography className='text-sm font-medium'>
                                  {caseManagerEmail || 'No email provided'}
                                </Typography>
                              </div>
                            </div>
                          </div>

                          {/* Email Composition Section */}
                          <div className='mb-4 p-4 border border-green-200 rounded-md'>
                            <Typography className='text-green-800 font-medium mb-3'>
                              ✉️ Send PDF to Case Manager
                            </Typography>

                            <div className='mb-3'>
                              <Typography className='text-sm text-gray-50 mb-1'>Email Subject:</Typography>
                              <input
                                type='text'
                                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400'
                                placeholder='Enter email subject...'
                                value={emailSubject}
                                onChange={e => setEmailSubject(e.target.value)}
                              />
                            </div>

                            <div className='mb-4'>
                              <Typography className='text-sm text-gray-50 mb-1'>Email Body:</Typography>
                              <textarea
                                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 resize-none'
                                rows={4}
                                placeholder='Enter email message body...'
                                value={emailBody}
                                onChange={e => setEmailBody(e.target.value)}
                              />
                            </div>

                            <div className='flex gap-3 justify-end'>
                              <Button
                                variant='outlined'
                                color='secondary'
                                onClick={() => {
                                  setEmailSubject('')
                                  setEmailBody('')
                                }}
                              >
                                Clear
                              </Button>

                              {/* Add Download Button */}
                              <Button
                                variant='outlined'
                                color='primary'
                                onClick={handleDownloadPdf}
                                startIcon={<i className='bx-download' />}
                              >
                                Download PDF
                              </Button>
                              <Button
                                variant='contained'
                                color='primary'
                                onClick={handleSendEmailWithPdf}
                                disabled={
                                  !caseManagerEmail || !emailSubject.trim() || !emailBody.trim() || emailSending
                                }
                                startIcon={emailSending ? <CircularProgress size={16} color='inherit' /> : null}
                              >
                                {emailSending ? 'Sending...' : 'Send PDF via Email'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Show form fields for manual entry if no mappings exist
                        <FormProvider {...methods}>
                          <form onSubmit={handleSubmit(handleSave)} autoComplete='off'>
                            <Typography className='text-xl mb-4'>Manual Entry Required</Typography>
                            <Grid container spacing={4}>
                              {pdfFields
                                .filter(field => field.type !== 'PDFButton' && !field.name.includes('clear'))
                                .map(field => renderFormField(field))}
                            </Grid>
                            <div className='flex gap-4 justify-end mt-5 mb-20'>
                              <Button variant='outlined' color='secondary' onClick={onClose}>
                                CANCEL
                              </Button>
                              <Button type='submit' variant='contained'>
                                View
                              </Button>
                            </div>
                          </form>
                        </FormProvider>
                      )}
                    </CardContent>
                  </Card>
                  <iframe key={pdfBlob} className='w-[50%] h-[100%]' src={pdfBlob} title='PDF Preview' />
                </>
              )}
            </Grid>
          )}
        </Dialog>
        <Grid container spacing={0}>
          <Grid size={{ xs: 12, sm: 4, md: 4 }}>
            <InfoCard />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 8 }}>
            <Card className='rounded-lg shadow-md'>
              <div className='flex justify-center'>
                <div className='w-full px-4'>
                  <CardContent className='flex justify-between items-center mb-1'>
                    <h2 className='text-xl font-semibold'>Electronic Documentation</h2>
                    <Button
                      variant='contained'
                      onClick={handleFillReferenceButton}
                      startIcon={loading ? <CircularProgress size={20} color='inherit' /> : null}
                      disabled={loading}
                    >
                      Fill Reference Form
                    </Button>
                  </CardContent>
                  <CustomTabList onChange={handleTabChange} className='w-full' pill='true'>
                    <Tab value={'allFilesTab'} label={'ALL FILES'} className='w-1/3' />
                    <Tab value={'sentFilesTab'} label={'SENT FILES'} className='w-1/3' />
                    <Tab value={'recievedFilesTab'} label={'RECIEVED FILES'} className='w-1/3' />
                  </CustomTabList>
                </div>
              </div>
              <CardContent>
                <div>
                  <TabPanel value='allFilesTab'>
                    <AllFilesTab
                      clientDocuments={clientDocuments}
                      clientDocsLoading={clientDocsLoading}
                      onDocumentDeleted={fetchClientsForm}
                    />
                  </TabPanel>
                  <TabPanel value='sentFilesTab'>
                    <SentFilesTab
                      clientDocuments={clientDocuments}
                      clientDocsLoading={clientDocsLoading}
                      onDocumentDeleted={fetchClientsForm}
                    />
                  </TabPanel>
                  <TabPanel value='recievedFilesTab'>
                    <RecievedFilesTab
                      clientDocuments={clientDocuments}
                      clientDocsLoading={clientDocsLoading}
                      onDocumentDeleted={fetchClientsForm}
                    />
                  </TabPanel>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default E_Document

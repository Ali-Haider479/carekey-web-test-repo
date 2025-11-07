import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Menu,
  MenuItem,
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import LinearProgress from '@mui/material/LinearProgress'
import CustomCheckList from '@/@core/components/mui/CustomChecklist'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import FileUploaderRestrictions from '@/@core/components/mui/FileUploader'
import api from '@/utils/api'
import { PDFDocument, PDFTextField, PDFRadioGroup, PDFCheckBox, PDFDropdown, PDFOptionList, PDFButton } from 'pdf-lib'
import Grid from '@mui/material/Grid2'

// Add options property to PdfField type
type PdfField = {
  name: string
  type: string
  options?: string[]
}

// Define predefined mapping keys for dropdown
const predefinedKeys = [
  // Basic Client Information
  { key: 'fullName', value: 'Full Name' },
  { key: 'firstName', value: 'First Name' },
  { key: 'lastName', value: 'Last Name' },
  { key: 'middleName', value: 'Middle Name' },
  { key: 'gender', value: 'Gender' },
  { key: 'dateOfBirth', value: 'Date of Birth' },
  { key: 'pmiNumber', value: 'PMI Number' },

  // Contact Information
  { key: 'primaryPhoneNumber', value: 'Primary Phone Number' },
  { key: 'primaryCellNumber', value: 'Primary Cell Number' },
  { key: 'additionalPhoneNumber', value: 'Additional Phone Number' },
  { key: 'emailId', value: 'Email Address' },

  // Emergency Contact
  { key: 'emergencyContactName', value: 'Emergency Contact Name' },
  { key: 'emergencyContactNumber', value: 'Emergency Contact Number' },
  { key: 'emergencyEmailId', value: 'Emergency Email' },

  // Address Information (from ClientAddress relationship)
  { key: 'address.address', value: 'Address' },
  { key: 'address.city', value: 'City' },
  { key: 'address.state', value: 'State' },
  { key: 'address.zipCode', value: 'Zip Code' },

  // Physician Information (from ClientPhysician relationship)
  { key: 'clientPhysician.name', value: 'Physician Name' },
  { key: 'clientPhysician.phoneNumber', value: 'Physician Phone' },
  { key: 'clientPhysician.faxNumber', value: 'Physician Fax' },
  { key: 'clientPhysician.email', value: 'Physician Email' },
  { key: 'clientPhysician.clinicName', value: 'Clinic Name' },
  { key: 'clientPhysician.address', value: 'Physician Address' },
  { key: 'clientPhysician.city', value: 'Physician City' },
  { key: 'clientPhysician.state', value: 'Physician State' },
  { key: 'clientPhysician.zipCode', value: 'Physician Zip Code' },

  // Responsible Party Information (from ClientResponsibleParty relationship)
  { key: 'clientResponsibilityParty.name', value: 'Responsible Party Name' },
  { key: 'clientResponsibilityParty.phoneNumber', value: 'Responsible Party Phone' },
  { key: 'clientResponsibilityParty.email', value: 'Responsible Party Email' },
  { key: 'clientResponsibilityParty.relationship', value: 'Relationship to Client' }
]

interface FormCardProps {
  onShowChecklist?: () => void
}

const SubmittedFormCard = ({ onShowChecklist }: FormCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean | null>(false)
  const [submitButtonLoading, setSubmitButtonLoading] = useState<boolean | null>(false)
  const [open, setOpen] = useState(false)
  const [documents, setDocuments] = useState<File | null>(null)
  const [tenantDocuments, setTenantDocuments] = useState<File | null>(null)

  // New states for PDF field mapping
  const [showMappingDialog, setShowMappingDialog] = useState(false)
  const [pdfFields, setPdfFields] = useState<PdfField[]>([])
  const [pdfFieldsForMapping, setPdfFieldsForMapping] = useState<PdfField[]>([])
  const [fieldMappings, setFieldMappings] = useState<{
    [key: string]: { value: string; mappedKey: string; customKey?: string }
  }>({})
  const [pdfBlob, setPdfBlob] = useState<string | null>(null)
  const [pdfObj, setPdfObj] = useState<any>(null)
  const [mappingLoading, setMappingLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showUnmappedWarning, setShowUnmappedWarning] = useState(false)
  const [unmappedFields, setUnmappedFields] = useState<string[]>([])

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, doc: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedDoc(doc)
  }

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/tenant/tenant-documents/${authUser?.tenant?.id}`)
      const tenantDocs = response?.data?.filter((doc: any) => !doc.isDeleted)
      setTenantDocuments(tenantDocs)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error('Error fetching initial data:', error)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedDoc(null)
  }

  const handleEdit = () => {
    console.log(`Edit action for ${selectedDoc}`)
    handleMenuClose()
  }

  const handleDelete = () => {
    console.log(`Delete action for ${selectedDoc}`)
    handleMenuClose()
  }

  // Function to check if uploaded file is a PDF form and extract fields
  const checkAndExtractPdfFields = async (file: File) => {
    try {
      setMappingLoading(true)

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Load PDF document
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

      // Check if PDF has form fields
      const form = pdfDoc.getForm()
      const fields = form.getFields()
      console.log(fields)

      if (fields.length === 0) {
        // No form fields found, proceed with regular upload
        setMappingLoading(false)
        return false
      }

      // Extract form fields
      const extractedFields: PdfField[] = fields.map(field => {
        let type = 'unknown'
        let options: string[] = []

        if (field instanceof PDFTextField) {
          type = 'PDFTextField'
        } else if (field instanceof PDFRadioGroup) {
          type = 'PDFRadioGroup'
          options = field.getOptions() // Extract radio options
        } else if (field instanceof PDFCheckBox) {
          type = 'PDFCheckBox'
        } else if (field instanceof PDFDropdown) {
          type = 'PDFDropdown'
          options = field.getOptions() // Extract dropdown options
        } else if (field instanceof PDFOptionList) {
          type = 'PDFOptionList'
          options = field.getOptions() // Extract option list options
        } else if (field instanceof PDFButton) {
          type = 'PDFButton'
        }

        console.log(`Field: ${field.getName()}, Type: ${type}, Options:`, options)

        return {
          name: field.getName(),
          type,
          options: options.length > 0 ? options : undefined
        }
      })

      console.log('Extracted PDF Fields:', extractedFields)
      setPdfFields(extractedFields)

      // Filter fields for mapping (exclude buttons and clear fields)
      const mappingFields = extractedFields.filter(
        field => field.type !== 'PDFButton' && !field.name.includes('clear') && !field.name.includes('Clear')
      )
      setPdfFieldsForMapping(mappingFields)

      // Initialize field mappings
      const initialMappings: {
        [key: string]: { value: string; mappedKey: string; customKey?: string; options?: any[] }
      } = {}
      mappingFields.forEach(field => {
        initialMappings[field.name] = { value: '', mappedKey: '', customKey: '', options: [] }
      })
      setFieldMappings(initialMappings)

      // Create PDF blob for preview
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      setPdfObj(pdfBytes)
      const blobUrl = URL.createObjectURL(blob)
      setPdfBlob(blobUrl)

      setMappingLoading(false)
      return true // PDF has form fields
    } catch (error) {
      console.error('Error extracting PDF fields:', error)
      setMappingLoading(false)
      return false // Error occurred, proceed with regular upload
    }
  }

  const handelUpload = async () => {
    setSubmitButtonLoading(true)
    setUploadError(null) // Clear any previous errors

    if (!documents || !(documents instanceof File)) {
      console.error('No valid file selected. Expected a File object, got:', documents)
      setSubmitButtonLoading(false)
      return
    }

    // Check if it's a PDF with form fields
    if (documents.type === 'application/pdf') {
      const hasPdfFields = await checkAndExtractPdfFields(documents)

      if (hasPdfFields) {
        // Show mapping dialog instead of uploading immediately
        setOpen(false) // Close upload dialog
        setShowMappingDialog(true) // Show mapping dialog
        setSubmitButtonLoading(false)
        return
      } else {
        // PDF has no form fields - show error
        setUploadError('Please upload a valid PDF form. The selected PDF does not contain any form fields.')
        setSubmitButtonLoading(false)
        return
      }
    } else {
      // Not a PDF file
      setUploadError('Please upload a PDF file only.')
      setSubmitButtonLoading(false)
      setDocuments(null)
      return
    }
  }

  // Handle field mapping value change (for preview/identification only)
  const handleFieldValueChange = async (fieldName: string, value: string) => {
    const updatedMappings = {
      ...fieldMappings,
      [fieldName]: { ...fieldMappings[fieldName], value }
    }
    setFieldMappings(updatedMappings)

    // Update PDF in real-time for preview
    await updatePdfWithMappings(updatedMappings)
  }

  // Handle field mapping key change
  const handleFieldKeyChange = (fieldName: string, mappedKey: string) => {
    setFieldMappings({
      ...fieldMappings,
      [fieldName]: {
        ...fieldMappings[fieldName],
        mappedKey,
        // Clear custom key if switching away from custom
        customKey: mappedKey === 'custom' ? fieldMappings[fieldName]?.customKey || '' : ''
      }
    })
  }

  // Handle custom key change
  const handleCustomKeyChange = (fieldName: string, customKey: string) => {
    setFieldMappings({
      ...fieldMappings,
      [fieldName]: { ...fieldMappings[fieldName], customKey }
    })
  }

  // Update PDF with current mappings (for preview only)
  const updatePdfWithMappings = async (mappings: typeof fieldMappings) => {
    if (!pdfObj) return

    try {
      const pdfDoc = await PDFDocument.load(pdfObj)
      const form = pdfDoc.getForm()

      Object.entries(mappings).forEach(([fieldName, mapping]) => {
        if (mapping.value) {
          try {
            const field = pdfFields.find(f => f.name === fieldName)
            if (field) {
              if (field.type === 'PDFTextField') {
                const textField = form.getTextField(fieldName)
                textField.setText(mapping.value)
                textField.setFontSize(8)
              } else if (field.type === 'PDFRadioGroup') {
                const radioGroup = form.getRadioGroup(fieldName)
                const options = radioGroup.getOptions()
                if (options.includes(mapping.value)) {
                  radioGroup.select(mapping.value)
                }
              } else if (field.type === 'PDFCheckBox') {
                const checkbox = form.getCheckBox(fieldName)
                if (
                  mapping.value.toLowerCase() === 'true' ||
                  mapping.value.toLowerCase() === 'yes' ||
                  mapping.value === '1'
                ) {
                  checkbox.check()
                } else {
                  checkbox.uncheck()
                }
              } else if (field.type === 'PDFDropdown') {
                const dropdown = form.getDropdown(fieldName)
                const options = dropdown.getOptions()
                if (options.includes(mapping.value)) {
                  dropdown.select(mapping.value)
                }
              }
            }
          } catch (e) {
            console.error(`Error updating field ${fieldName}:`, e)
          }
        }
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const blobUrl = URL.createObjectURL(blob)
      setPdfBlob(blobUrl)
      setPdfObj(pdfBytes)
    } catch (error) {
      console.error('Error updating PDF with mappings:', error)
    }
  }

  // Handle save mappings and upload
  const handleSaveMappingsAndUpload = async () => {
    // Check for unmapped fields
    const unmapped = pdfFieldsForMapping.filter(field => {
      const mapping = fieldMappings[field.name]
      return !mapping || !mapping.mappedKey || (mapping.mappedKey === 'custom' && !mapping.customKey)
    })

    // If there are unmapped fields, show warning
    if (unmapped.length > 0) {
      setUnmappedFields(unmapped.map(f => f.name))
      setShowUnmappedWarning(true)
      return
    }

    // Proceed with upload
    await proceedWithUpload()
  }

  const proceedWithUpload = async () => {
    const mappingResults = Object.entries(fieldMappings)
      .filter(([_, mapping]) => {
        // Include if has either a predefined key or custom key
        return mapping.mappedKey === 'custom' ? mapping.customKey : mapping.mappedKey
      })
      .map(([fieldName, mapping]) => {
        // Use custom key if mappedKey is 'custom', otherwise use mappedKey
        const finalKey = mapping.mappedKey === 'custom' ? mapping.customKey : mapping.mappedKey
        const keyLabel =
          mapping.mappedKey === 'custom'
            ? mapping.customKey
            : predefinedKeys.find(key => key.key === mapping.mappedKey)?.value || mapping.mappedKey

        return {
          pdfFieldName: fieldName,
          mappedKey: finalKey,
          keyLabel: keyLabel
        }
      })

    console.group('📋 PDF Field Mappings Summary')
    console.log('📊 Total Fields:', pdfFieldsForMapping.length)
    console.log('✅ Completed Mappings:', mappingResults.length)
    console.groupEnd()

    console.group('✅ Completed Field Mappings')
    mappingResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.pdfFieldName}`)
      console.log(`   Mapped to: ${result.keyLabel} (${result.mappedKey})`)
      console.log('   ---')
    })
    console.groupEnd()

    // Upload the mapped PDF and save mapping data
    if (pdfObj && documents) {
      try {
        setSubmitButtonLoading(true)

        // Step 1: Reset PDF to original state before uploading
        const originalArrayBuffer = await documents.arrayBuffer()
        const originalPdfDoc = await PDFDocument.load(originalArrayBuffer, { ignoreEncryption: true })
        const originalPdfBytes = await originalPdfDoc.save()

        // Create a new file with the original PDF content (without filled data)
        const originalPdfFile = new File([new Uint8Array(originalPdfBytes)], documents.name, {
          type: 'application/pdf'
        })
        const formData = new FormData()
        formData.append('file', originalPdfFile)

        console.log('Original PDF file prepared for upload:', originalPdfFile)
        console.log('FormData prepared for upload:', formData)
        console.log('mappingResults prepared for upload:', mappingResults)

        // return

        // Step 2: Upload the original PDF to get file metadata
        const uploadResponse = await api.post(`/tenant/upload-documents/${authUser?.tenant?.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        console.log('Upload response:', uploadResponse.data)

        // Step 3: Prepare payload for saving mapping data
        const mappingPayload = {
          mappedFields: {
            fieldMappings: mappingResults.map(result => {
              const field = pdfFields.find(f => f.name === result.pdfFieldName)
              const fieldType = field?.type || 'unknown'

              return {
                pdfFieldName: result.pdfFieldName,
                clientDataKey: result.mappedKey,
                clientDataLabel: result.keyLabel,
                fieldType: fieldType,
                options:
                  fieldType === 'PDFRadioGroup'
                    ? field?.options
                    : fieldType === 'PDFDropdown'
                      ? field?.options
                      : undefined
              }
            })
          },
          mappedPdfFormId: uploadResponse.data.id,
          processedBy: authUser?.id || 0,
          tenantId: authUser?.tenant?.id || 0
        }

        console.group('📦 Mapping Payload')
        console.log('Complete payload:', mappingPayload)
        console.groupEnd()

        // Step 4: Save the mapping data to database
        try {
          const mappingResponse = await api.post('pdf-form-mapping', mappingPayload)
          console.log('Mapping saved successfully:', mappingResponse.data)
        } catch (mappingError) {
          console.error('Error saving mapping data:', mappingError)
          // Continue with the process even if mapping save fails
        }

        // Step 5: Update UI and cleanup
        await fetchInitialData()
        setShowMappingDialog(false)
        setDocuments(null)
        resetMappingState()
        console.log('PDF uploaded and mapping data saved successfully')
      } catch (error) {
        console.error('Error in save and upload process:', error)
      } finally {
        setSubmitButtonLoading(false)
      }
    }
  }

  // Reset mapping state
  const resetMappingState = () => {
    setPdfFields([])
    setPdfFieldsForMapping([])
    setFieldMappings({})
    setPdfBlob(null)
    setPdfObj(null)
  }

  // Close mapping dialog
  const closeMappingDialog = () => {
    setShowMappingDialog(false)
    setDocuments(null)
    resetMappingState()
  }

  // Update the dialog close functions
  const handleDialogClose = () => {
    setOpen(false)
    setUploadError(null)
    setDocuments(null)
  }

  const mappedFieldsCount = Object.values(fieldMappings)?.filter(m =>
    m.mappedKey === 'custom' ? m.customKey : m.mappedKey
  ).length

  return (
    <>
      <Card className='rounded-lg shadow-md'>
        <CardContent className='flex justify-between items-center mb-2'>
          <h2 className='text-xl font-semibold'>Submitted Forms</h2>
          <Button variant='contained' onClick={() => setOpen(true)}>
            Upload Form
          </Button>
        </CardContent>
        <CardContent className='mt-2'>
          <CustomCheckList tenantDocuments={tenantDocuments} loading={loading} onDocumentDeleted={fetchInitialData} />
        </CardContent>

        {/* Upload Dialog */}
        <Dialog
          fullWidth
          maxWidth='md'
          open={open}
          onClose={handleDialogClose}
          scroll='body'
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
          <DialogCloseButton onClick={handleDialogClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <DialogTitle variant='h4' className='flex gap-2 flex-col'>
            Upload Forms
          </DialogTitle>
          <DialogContent>
            {uploadError && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
                <div className='flex items-center'>
                  <i className='bx-error text-red-500 text-lg mr-2'></i>
                  <Typography className='text-red-700 text-sm font-medium'>{uploadError}</Typography>
                </div>
              </div>
            )}

            {mappingLoading && (
              <div className='flex justify-center items-center p-8'>
                <CircularProgress />
                <Typography className='ml-4'>Analyzing PDF for form fields...</Typography>
              </div>
            )}

            {!mappingLoading && (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='col-span-1 p-3 rounded-lg border'>
                  <FileUploaderRestrictions
                    onFilesSelected={selectedFiles => {
                      console.log('Selected files:', selectedFiles)
                      const file = Array.isArray(selectedFiles) && selectedFiles.length > 0 ? selectedFiles[0] : null
                      setDocuments(file)
                      setUploadError(null) // Clear error when new file is selected
                    }}
                    mimeType={['application/pdf']}
                    fileCount={1}
                    fileSize={25 * 1024 * 1024}
                    title='Choose Files'
                  />
                </div>
                <div className='col-span-2'>
                  <h3 className='text-lg font-semibold mb-4'>Uploading Files</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {documents && (
                      <div className='p-3 rounded-lg border border-[#32475C] border-opacity-[22%]'>
                        <div className='flex justify-between items-center mb-2'>
                          <div className='flex items-center gap-10'>
                            <div className='flex items-center gap-2'>
                              <PictureAsPdfIcon />
                              <Typography className='font-semibold text-green-600 text-sm'>
                                {documents.name.length > 20 ? `${documents.name.substring(0, 20)}...` : documents.name}{' '}
                                (100%)
                              </Typography>
                            </div>
                            <div>
                              <Typography className='font-semibold text-green-600 text-sm'>Completed</Typography>
                            </div>
                          </div>
                        </div>
                        <div>
                          <LinearProgress variant='determinate' value={100} color='success' />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant='contained'
              onClick={handelUpload}
              startIcon={submitButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
              type='submit'
              disabled={!documents || !(documents instanceof File) || submitButtonLoading === true || mappingLoading}
            >
              {mappingLoading ? 'Analyzing...' : 'Submit'}
            </Button>
            <Button variant='tonal' color='secondary' type='reset' onClick={handleDialogClose}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* PDF Field Mapping Dialog */}
        <Dialog
          open={showMappingDialog}
          onClose={closeMappingDialog}
          closeAfterTransition={false}
          sx={{
            '& .MuiDialog-paper': {
              overflow: 'visible',
              width: '90vw',
              height: '90vh',
              maxWidth: '1600px',
              maxHeight: '1000px',
              position: 'relative'
            }
          }}
        >
          <DialogCloseButton onClick={closeMappingDialog} disableRipple>
            <i className='text-red-500 bx-x' />
          </DialogCloseButton>

          <div className='flex justify-between p-3'>
            <Typography className='text-xl font-semibold'>PDF Form Field Mapping</Typography>
            <div className='flex gap-2'>
              <Button variant='outlined' onClick={closeMappingDialog}>
                Cancel
              </Button>
              <Button
                variant='contained'
                onClick={handleSaveMappingsAndUpload}
                startIcon={submitButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
              >
                Save & Upload
              </Button>
            </div>
          </div>

          {pdfBlob && (
            <Grid className='w-full h-full flex flex-row'>
              <Card className='w-[50%] h-[100%] overflow-y-auto'>
                <div className='m-4 flex justify-between items-center'>
                  <Typography className='font-semibold text-2xl'>PDF Field Mapping</Typography>
                  <Typography className='text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full'>
                    {
                      Object.values(fieldMappings).filter(m => (m.mappedKey === 'custom' ? m.customKey : m.mappedKey))
                        .length
                    }{' '}
                    / {pdfFieldsForMapping.length} mapped
                  </Typography>
                </div>
                <CardContent>
                  <div className='space-y-3 h-auto overflow-y-auto pr-2'>
                    <Typography className='text-sm text-gray-600 mb-4'>
                      Map PDF fields to predefined client data keys. You can optionally enter values to preview how they
                      will appear in the PDF. Only the "Map to Key" selection is required for saving.
                    </Typography>
                    {pdfFieldsForMapping.map((field, index) => (
                      <Card key={field.name} className='border border-gray-200 shadow-sm'>
                        <CardContent className='p-3'>
                          <div className='mb-2'>
                            <Typography className='text-sm font-medium truncate' title={field.name}>
                              {field.name}
                            </Typography>
                            <Typography className='text-xs text-gray-500'>{field.type.replace('PDF', '')}</Typography>
                            {field.options && field.options.length > 0 && (
                              <Typography className='text-xs text-blue-600 mt-1'>
                                Available options: {field.options.join(', ')}
                              </Typography>
                            )}
                          </div>

                          <div className='grid grid-cols-1 gap-3'>
                            {/* Value input for preview/identification (optional) */}
                            <div>
                              <Typography className='text-xs font-medium text-gray-600 mb-1'>
                                Value (Optional - for preview):
                              </Typography>

                              {/* Text Field */}
                              {field.type === 'PDFTextField' && (
                                <input
                                  type='text'
                                  className='w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200'
                                  placeholder='Enter text value to preview'
                                  value={fieldMappings[field.name]?.value || ''}
                                  onChange={e => handleFieldValueChange(field.name, e.target.value)}
                                />
                              )}

                              {/* Radio Group */}
                              {field.type === 'PDFRadioGroup' && field.options && (
                                <select
                                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400'
                                  value={fieldMappings[field.name]?.value || ''}
                                  onChange={e => handleFieldValueChange(field.name, e.target.value)}
                                >
                                  <option value=''>Select an option to preview...</option>
                                  {field.options.map(option => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {/* Checkbox */}
                              {field.type === 'PDFCheckBox' && (
                                <div className='flex items-center space-x-2'>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={fieldMappings[field.name]?.value === 'true'}
                                        onChange={e =>
                                          handleFieldValueChange(field.name, e.target.checked ? 'true' : 'false')
                                        }
                                        size='small'
                                      />
                                    }
                                    label='Preview checkbox'
                                  />
                                </div>
                              )}

                              {/* Dropdown */}
                              {(field.type === 'PDFDropdown' || field.type === 'PDFOptionList') && field.options && (
                                <select
                                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400'
                                  value={fieldMappings[field.name]?.value || ''}
                                  onChange={e => handleFieldValueChange(field.name, e.target.value)}
                                >
                                  <option value=''>Select from dropdown to preview...</option>
                                  {field.options.map(option => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>

                            {/* Mapping key dropdown */}
                            <div>
                              <Typography className='text-xs font-medium text-gray-600 mb-1'>Map to Key:</Typography>
                              <select
                                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400'
                                value={fieldMappings[field.name]?.mappedKey || ''}
                                onChange={e => handleFieldKeyChange(field.name, e.target.value)}
                              >
                                <option value=''>Select a key...</option>
                                <option value='custom'>Custom (Define your own key)</option>
                                {predefinedKeys.map(key => (
                                  <option key={key.key} value={key.key}>
                                    {key.value}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Custom key input - shown only when 'custom' is selected */}
                            {fieldMappings[field.name]?.mappedKey === 'custom' && (
                              <div>
                                <Typography className='text-xs font-medium text-gray-600 mb-1'>
                                  Custom Key Name:
                                </Typography>
                                <input
                                  type='text'
                                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400'
                                  placeholder='e.g., customField1, mySpecialKey'
                                  value={fieldMappings[field.name]?.customKey || ''}
                                  onChange={e => handleCustomKeyChange(field.name, e.target.value)}
                                />
                                <Typography className='text-xs text-gray-500 mt-1'>
                                  Enter a unique identifier for this field (e.g., "customField1", "specialData")
                                </Typography>
                              </div>
                            )}

                            {((fieldMappings[field.name]?.mappedKey === 'custom' &&
                              fieldMappings[field.name]?.customKey) ||
                              (fieldMappings[field.name]?.mappedKey &&
                                fieldMappings[field.name]?.mappedKey !== 'custom')) && (
                              <div className='text-xs text-green-600 bg-green-50 p-2 rounded'>
                                ✓ Mapped to:{' '}
                                {fieldMappings[field.name]?.mappedKey === 'custom'
                                  ? fieldMappings[field.name]?.customKey
                                  : predefinedKeys.find(k => k.key === fieldMappings[field.name]?.mappedKey)?.value}
                                {fieldMappings[field.name]?.value && (
                                  <span className='block text-gray-600 mt-1'>
                                    Preview: {fieldMappings[field.name]?.value}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <iframe key={pdfBlob} className='w-[50%] h-[100%]' src={pdfBlob} title='PDF Preview' />
            </Grid>
          )}
        </Dialog>

        {/* Unmapped Fields Warning Dialog */}
        <Dialog open={showUnmappedWarning} onClose={() => setShowUnmappedWarning(false)} maxWidth='sm' fullWidth>
          <DialogTitle>
            <div className='flex items-center gap-2'>
              <i className='bx-error-circle text-yellow-500 text-2xl'></i>
              <Typography variant='h6'>Unmapped Fields Warning</Typography>
            </div>
          </DialogTitle>
          <DialogContent>
            {mappedFieldsCount < 5 ? (
              <Typography className='mb-3'>Atleast 5 fields should be mapped in order to upload the form</Typography>
            ) : (
              <Typography className='mb-3'>
                The following fields are not mapped and won't be available in the E-Docs section:
              </Typography>
            )}
            <div className='bg-yellow-50 border border-yellow-200 rounded-md p-3 max-h-60 overflow-y-auto'>
              <ul className='list-disc list-inside space-y-1'>
                {unmappedFields.map(fieldName => (
                  <li key={fieldName} className='text-sm text-gray-700'>
                    {fieldName}
                  </li>
                ))}
              </ul>
            </div>
            <Typography className='mt-3 text-sm text-gray-600'>
              Do you want to proceed with uploading? You can always edit the mappings later.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button variant='outlined' onClick={() => setShowUnmappedWarning(false)}>
              Go Back & Map
            </Button>
            <Button
              variant='contained'
              color='warning'
              onClick={() => {
                setShowUnmappedWarning(false)
                proceedWithUpload()
              }}
              disabled={mappedFieldsCount < 5}
            >
              Continue Anyway
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  )
}

export default SubmittedFormCard

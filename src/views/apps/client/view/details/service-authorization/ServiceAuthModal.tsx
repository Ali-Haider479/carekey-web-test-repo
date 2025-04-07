'use client'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import {
  Button,
  Grid2 as Grid,
  Dialog,
  Typography,
  MenuItem,
  TextField,
  Divider,
  Box,
  Select,
  CircularProgress,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import { useEffect, useState } from 'react'
import axios from 'axios'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { placeOfServiceOptions } from '@/utils/constants'
import OcrCustomDropDown from '@/@core/components/custom-inputs/OcrCustomDropdown'

interface ServiceAuthListModalProps {
  open: boolean
  onClose: () => void
  clientId: any
  fetchClientServiceAuthData: () => Promise<void>
}

interface FormRow {
  providerId: string
  agreementNumber: string
  recipientId: string
  caseManagerNumber: string
  diagnosisCode: string
  procedureCode: string
  modifier: string
  startDate: string
  endDate: string
  procedureDescription: string
  totalAmount: string
  serviceRate: string
  quantity: string
  frequency: string
  umpiNumber: string
  taxonomy: string
  reimbursement: string
  placeOfService: string
  caseManagerName?: string // Optional fields from OCR
  recepientName?: string
  status?: string
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
  fetchClientServiceAuthData
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [enableOcrDataFill, setEnableOcrDataFill] = useState<boolean>(true)
  const [formData, setFormData] = useState<FormRow[]>([])
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [billableStates, setBillableStates] = useState<boolean[]>([])
  const [ocrData, setOcrData] = useState<FormRow[]>([])
  const authUser: AuthUser = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const initialFormRow: FormRow = {
    providerId: '',
    agreementNumber: '',
    recipientId: '',
    caseManagerNumber: '',
    diagnosisCode: '',
    procedureCode: '',
    modifier: '',
    startDate: '',
    endDate: '',
    procedureDescription: '',
    totalAmount: '',
    serviceRate: '',
    quantity: '',
    frequency: '',
    umpiNumber: '',
    taxonomy: '',
    reimbursement: '',
    placeOfService: '',
    caseManagerName: '',
    recepientName: '',
    status: ''
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
  }

  const handleInputChange = (index: number, field: keyof FormRow, value: string): void => {
    const updatedData = [...formData]
    updatedData[index][field] = value
    setFormData(updatedData)
  }

  const handleCommonFieldChange = (field: string, value: string): void => {
    console.log('ONE Field', field, value)
    const updatedData = formData.map(item => ({
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

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setIsLoading(true)
      setUploadedFile({
        name: file.name,
        extension: file.name.split('.').pop() || '',
        size: (file.size / 1024).toFixed(2) + ' KB'
      })
      try {
        const pdfFormData = new FormData()
        pdfFormData.append('pdf', file)

        const response = await axios.post<any>(`${process.env.NEXT_PUBLIC_API_URL}/client/ocr`, pdfFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        const extractedData: FormRow[] = response.data.extractedData

        // Store OCR data
        setOcrData(extractedData)

        // If enableOcrDataFill is true, merge OCR data with initialFormRow and preserve placeOfService
        if (enableOcrDataFill) {
          const currentPlaceOfService = formData[0]?.placeOfService || ''
          const mergedData = extractedData.map(item => ({
            ...initialFormRow,
            ...item,
            placeOfService: currentPlaceOfService // Preserve the current placeOfService
          }))
          setFormData(mergedData)
          setBillableStates(mergedData.map(() => true))
        }
      } catch (error) {
        console.error('Error processing PDF:', error)
      } finally {
        setIsLoading(false)
      }
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
      const updatedData = formData.filter((_, i) => i !== index)
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
      startDate: startDate ? startDate.toISOString() : '',
      endDate: endDate ? endDate.toISOString() : ''
    }
    setFormData(updatedFormData)
  }

  const commonFields = {
    payer: enableOcrDataFill && formData[0]?.providerId ? 'MA' : '',
    serviceAuthNumber: enableOcrDataFill ? formData[0]?.agreementNumber || '' : '',
    memberId: enableOcrDataFill ? formData[0]?.recipientId || '' : '',
    diagnosisCode: enableOcrDataFill ? formData[0]?.diagnosisCode || '' : '',
    taxonomy: enableOcrDataFill ? formData[0]?.taxonomy || '' : '',
    umpiNumber: enableOcrDataFill ? formData[0]?.providerId || '' : '',
    placeOfService: enableOcrDataFill ? formData[0]?.placeOfService || '' : ''
  }

  const handelSubmit = async (): Promise<void> => {
    try {
      setIsLoading(true)
      // Always use formData for submission to include UI-managed fields like billable and placeOfService
      const dataToSubmit = formData
      const serviceAuthPayloads = dataToSubmit.map((item: FormRow, index: number) => ({
        payer: 'MA',
        memberId: Number(item.recipientId || 0),
        serviceAuthNumber: Number(item.agreementNumber || 0),
        procedureCode: item.procedureCode || '',
        modifierCode: item.modifier || '',
        startDate: item.startDate ? new Date(item.startDate) : undefined,
        endDate: item.endDate ? new Date(item.endDate) : undefined,
        serviceRate: Number(item.serviceRate.replace('$', '')),
        units: Number(item.quantity || 0),
        diagnosisCode: item.diagnosisCode || '',
        umpiNumber: item.providerId || '',
        reimbursementType: item.reimbursement || '',
        taxonomy: item.taxonomy || '',
        frequency: item.frequency || '',
        clientId: clientId,
        billable: billableStates[index],
        placeOfService: item.placeOfService || ''
      }))
      console.log('ONE serviceAuthPayloads', serviceAuthPayloads)

      const serviceAuthResponses = await Promise.all(
        serviceAuthPayloads.map(payload =>
          axios.post(`${process.env.NEXT_PUBLIC_API_URL}/client/service-auth`, payload)
        )
      )

      const accountHistoryPayLoad = {
        actionType: 'ClientServiceAuthCreate',
        details: `Service authorization list created for Client (ID: ${clientId}) by User (ID: ${authUser?.id})`,
        userId: authUser?.id,
        clientId
      }
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/account-history/log`, accountHistoryPayLoad)

      await fetchClientServiceAuthData()
      handleModalClose()
    } catch (error) {
      console.error('Error saving service auth list:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
      <Box sx={{ overflowY: 'auto', maxHeight: 'calc(90vh - 64px)', position: 'relative' }}>
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
              padding: '1rem 1rem',
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
              <Button
                variant='contained'
                onClick={handleModalClose}
                disabled={isLoading}
                sx={{ backgroundColor: '#4B0082' }}
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                onClick={handelSubmit}
                sx={{ backgroundColor: '#4B0082' }}
                disabled={isLoading}
              >
                Submit
              </Button>
              <Button variant='contained' component='label' sx={{ backgroundColor: '#4B0082' }} disabled={isLoading}>
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
                  <TextField label='Payer' value={commonFields.payer} fullWidth size='small' disabled={isLoading} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label='Member ID'
                    value={commonFields.memberId}
                    onChange={e => handleCommonFieldChange('memberId', e.target.value)}
                    fullWidth
                    size='small'
                    disabled={isLoading}
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
          </Card>

          {/* Services Card */}
          <Card sx={{ mx: 2, mb: 4, boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 20px' }}>
            <CardHeader title='Services' />
            <CardContent>
              {formData.map((row: FormRow, index: number) => (
                <Box key={index} sx={{ mb: 4, position: 'relative' }}>
                  <Grid container spacing={2} alignItems='center'>
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <Divider sx={{ flex: 1 }} />
                        <Typography variant='h6' sx={{ textAlign: 'center', minWidth: '2rem', color: '#fff' }}>
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
                        value={row.modifier}
                        onChange={e => handleInputChange(index, 'modifier', e.target.value)}
                        fullWidth
                        size='small'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <AppReactDatepicker
                        selectsRange
                        startDate={row.startDate ? new Date(row.startDate) : null}
                        endDate={row.endDate ? new Date(row.endDate) : null}
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
      </Box>
    </Dialog>
  )
}

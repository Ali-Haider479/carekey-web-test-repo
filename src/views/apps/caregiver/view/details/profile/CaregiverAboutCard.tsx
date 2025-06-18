'use client'
import React, { useEffect, useState } from 'react'
import { Button, Card, Dialog, LinearProgress, MenuItem, styled, TextField, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import type { CircularProgressProps } from '@mui/material/CircularProgress'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Add, AddOutlined, DeleteOutline, Edit, EditOutlined, SaveOutlined } from '@mui/icons-material'
import { EditableField } from '@/@core/components/custom-inputs/CustomEditableTextField'
import CloseIcon from '@mui/icons-material/Close'
import api from '@/utils/api'
import { string } from 'valibot'
import { error } from 'console'
import { FormProvider, useForm } from 'react-hook-form'
import FileUploaderRestrictions from '@/@core/components/mui/FileUploader'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import { USStates } from '@/utils/constants'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { useTheme } from '@emotion/react'

const CircularProgressDeterminate = styled(CircularProgress)<CircularProgressProps>({
  color: 'var(--mui-palette-customColors-trackBg)'
})

function CaregiverAboutCard() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(true)
  const [accountStatus, setAccountStatus] = useState<string>('')
  const [formData, setFormData] = useState<any>({})
  const [originalFormData, setOriginalFormData] = useState<any>({})
  const [emailError, setEmailError] = useState<boolean>(false)
  const [emergencyEmailError, setEmergencyEmailError] = useState<boolean>(false)
  const [primaryPhoneNumberError, setPrimaryPhoneNumberError] = useState<boolean>(false)
  const [secondaryPhoneNumberError, setSecondaryPhoneNumberError] = useState<boolean>(false)
  const [emergencyPhoneNumberError, setEmergencyPhoneNumberError] = useState<boolean>(false)
  const [addressError, setAddressError] = useState<boolean>(false)
  const [cityError, setCityError] = useState<boolean>(false)
  const [stateError, setStateError] = useState<boolean>(false)
  const [zipCodeError, setZipCodeError] = useState<boolean>(false)
  const [caregiverDocuments, setCaregiverDocuments] = useState<any>()
  const [caregiverDocumentsLoading, setCaregiverDocumentsLoading] = useState<boolean>(false)
  const [umpiDocToEdit, setUmpiDocToEdit] = useState<any>()
  const [deleteModalShow, setDeleteModalShow] = useState<boolean>(false)
  const [newUmpiDocModalShow, setNewUmpiDocModalShow] = useState<boolean>(false)
  const [umpiDocEditModalShow, setUmpiEditModalShow] = useState<boolean>(false)
  const [umpiFile, setUmpiFile] = useState<any>([])
  const [umpiDocSaveButtonLoading, setUmpiDocSaveButtonLoading] = useState<boolean>(false)
  const [deleteButtonLoading, setDeleteButtonLoading] = useState<boolean>(false)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const theme: any = useTheme()
  const lightTheme = theme.palette.mode === 'light'

  type FormValues = {
    payor: string
    umpiNumber: string
    activationdate: Date | null
    expiryDate: Date | null
    newPayor: string
    newUmpiNumber: string
    newActivationDate: Date | null
    newExpiryDate: Date | null
  }

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      payor: umpiDocToEdit?.uploadedDocument?.metaData?.payer,
      umpiNumber: umpiDocToEdit?.uploadedDocument?.metaData?.umpiNumber,
      activationdate: umpiDocToEdit?.uploadedDocument?.metaData?.activationDate,
      expiryDate: umpiDocToEdit?.uploadedDocument?.expiryDate,
      newPayor: '',
      newUmpiNumber: '',
      newActivationDate: null,
      newExpiryDate: null
    }
  })

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    setError,
    clearErrors,
    watch,
    reset
  } = methods

  const payor = watch('payor')
  const umpiNumber = watch('umpiNumber')
  const activationDate = watch('activationdate')
  const expiryDate = watch('expiryDate')

  const newPayor = watch('newPayor')
  const newUmpiNumber = watch('newUmpiNumber')
  const newActivationDate = watch('newActivationDate')
  const newExpiryDate = watch('newExpiryDate')

  const handleUmpiDocumentEditModalOpen = (doc: any) => {
    setUmpiEditModalShow(true)
    setUmpiDocToEdit(doc)
  }

  const handleUmpiDocEditModalClose = () => {
    setUmpiEditModalShow(false)
    setUmpiFile([])
  }

  const handleNewUmpiDocModalClose = () => {
    setNewUmpiDocModalShow(false)
  }

  const handleDeleteModalClose = () => setDeleteModalShow(false)

  const uploadDocuments = async (
    files: { path: string }[],
    documentType: string,
    caregiverId: string,
    expiryDate?: string,
    metaData?: Record<string, any>
  ) => {
    // Skip upload if no files exist
    if (!files || files.length === 0) {
      console.log(`No files found for ${documentType}. Skipping upload.`)
      return null
    }

    // Create a FormData object
    const formData = new FormData()

    // Append files
    files.forEach((file: { path: string }) => {
      // Use File object instead of Blob for better compatibility
      const fileObject = new File([file.path], file.path, {
        type: file.path.endsWith('.pdf')
          ? 'application/pdf'
          : file.path.endsWith('.jpg') || file.path.endsWith('.png')
            ? 'image/jpeg'
            : 'application/octet-stream'
      })
      formData.append('file', fileObject, file.path)
    })

    // Append common parameters
    formData.append('documentType', documentType)
    formData.append('caregiverId', caregiverId)

    // Handle expiry date
    const finalExpiryDate = newExpiryDate?.toISOString().split('T')[0]

    formData.append('expiryDays', '365')
    formData.append('expiryDate', newExpiryDate ? newExpiryDate.toISOString().split('T')[0] : '')

    // Append additional metadata if exists
    if (metaData) {
      formData.append('metaData', JSON.stringify(metaData))
    }

    // Make the API call
    try {
      return await api.post(`/caregivers/document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } catch (error) {
      console.error(`Error uploading ${documentType} documents:`, error)
      return null
    }
  }

  const handleAddNewUmpiDoc = async () => {
    try {
      setUmpiDocSaveButtonLoading(true)
      const metaData = {
        documentName: 'UMPI Letter',
        payer: newPayor,
        umpiNumber: newUmpiNumber,
        activationDate: newActivationDate?.toISOString().split('T')[0]
      }
      const documentUploads = [
        uploadDocuments(umpiFile, 'umpiDocument', String(id), newExpiryDate?.toISOString().split('T')[0], metaData)
      ]
      const uploadResponses = await Promise.all(documentUploads)
      const successfulUploads = uploadResponses.filter(response => response !== null)
      console.log('Successful document uploads:', successfulUploads)
      fetchCaregiverDocuments()
      setNewUmpiDocModalShow(false)
    } catch (error) {
      console.error('Error in adding training certificate: ', error)
    } finally {
      setUmpiDocSaveButtonLoading(false)
    }
  }

  const handleEditUmpiDoc = async (data: any) => {
    try {
      setUmpiDocSaveButtonLoading(true)
      if (!umpiDocToEdit?.id) {
        console.error('No document ID found for editing')
        return
      }

      const formData = new FormData()
      const metaData = {
        documentName: 'UMPI Letter',
        payer: payor,
        umpiNumber: umpiNumber,
        activationDate: activationDate instanceof Date ? activationDate?.toISOString().split('T')[0] : null
      }

      // Append metadata
      formData.append('metaData', JSON.stringify(metaData))

      // Calculate expiry days if a new expiry date is provided
      if (expiryDate && expiryDate instanceof Date) {
        formData.append('expiryDate', expiryDate?.toISOString().split('T')[0])
      }

      // Append document type
      formData.append('documentType', 'umpiDocument')

      // Append new file if provided
      if (umpiFile.length > 0) {
        umpiFile.forEach((file: File) => {
          formData.append('file', file)
        })
      }

      // Make the PATCH API call
      const response = await api.patch(`/upload-document/${umpiDocToEdit.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Edit Driving License Response:', response.data)

      // Close the modal and reset state
      fetchCaregiverDocuments()
      setUmpiEditModalShow(false)
      setUmpiFile([])
      reset({
        umpiNumber,
        expiryDate
      })

      // Optionally refresh the caregiverDocuments list
      // You may need to fetch updated documents or update the local state
    } catch (error) {
      console.error('Error editing driving license:', error)
    } finally {
      setUmpiDocSaveButtonLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleteButtonLoading(true)
      const deleteResponse = await api.delete(`/caregivers/document/${umpiDocToEdit?.id}`)
      console.log('DELETE RESPONSE ---->> ', deleteResponse)
      fetchCaregiverDocuments()
      setDeleteModalShow(false)
    } catch (error) {
      console.error('Error in deleting document: ', error)
    } finally {
      setDeleteButtonLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '')

    // Early return if empty
    if (!numbers) return ''

    // Apply mask according to input length
    if (numbers.length <= 3) {
      return `(${numbers}`
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchCaregiverDocuments = async () => {
    try {
      setCaregiverDocumentsLoading(true)
      const response = await api.get(`/caregivers/document/${id}`)
      console.log('Caregiver documents response ----->> ', response.data)
      setCaregiverDocuments(response.data)
    } catch (error) {
      console.error('Error in fetching caregiver documents: ', error)
    } finally {
      setCaregiverDocumentsLoading(false)
    }
  }

  useEffect(() => {
    fetchCaregiverDocuments()
  }, [])

  const umpiDocument = caregiverDocuments?.filter((doc: any) => doc?.uploadedDocument?.documentType === 'umpiDocument')

  console.log('DATA ----->> ', data)

  const residentialAddress = data?.addresses?.find((address: any) => address.address.addressType === 'Residential')

  // Initialize form data when data is fetched
  useEffect(() => {
    if (data) {
      const formattedData = {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        primaryPhoneNumber: data.primaryPhoneNumber,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        emailAddress: data.user?.emailAddress,
        secondaryPhoneNumber: data.secondaryPhoneNumber,
        emergencyContactNumber: data.emergencyContactNumber,
        emergencyEmailId: data.emergencyEmailId,
        address: residentialAddress?.address?.address,
        city: residentialAddress?.address?.city,
        state: residentialAddress?.address?.state,
        zipCode: residentialAddress?.address?.zipCode,
        payRate: data.payRate,
        payor: data.pcaUMPIInfo?.payor,
        umpi: data.pcaUMPIInfo?.umpi,
        activationDate: data.pcaUMPIInfo?.activationDate,
        receivedDate: data.pcaUMPIInfo?.receivedDate,
        faxDate: data.pcaUMPIInfo?.faxDate,
        expiryDate: data.pcaUMPIInfo?.expiryDate,
        dateOfHire: data.dateOfHire,
        specialRequests: data.caregiverNotes?.specialRequests,
        comments: data.caregiverNotes?.comments,
        allergies: data.caregiverNotes?.allergies
      }
      setFormData(formattedData)
      setAccountStatus(data.user?.accountStatus)
      setOriginalFormData(formattedData)
    }
  }, [data])

  const handleCancel = () => {
    setFormData({ ...originalFormData }) // Reset form data to original values
    setAccountStatus(data.user?.accountStatus) // Reset account status to original
    setEmailError(false)
    setEmergencyEmailError(false)
    setPrimaryPhoneNumberError(false)
    setSecondaryPhoneNumberError(false)
    setEmergencyPhoneNumberError(false)
    setAddressError(false)
    setCityError(false)
    setZipCodeError(false)
    setStateError(false)
    setIsEdit(true) // Switch back to view mode
  }

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/caregivers/caregiver/${id}`)

      setData(response.data)
    } catch (error) {
      console.error('Error fetching data', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (name: string, value: any) => {
    // Handle email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (name === 'emailAddress' && !emailPattern.test(value)) {
      setEmailError(true)
    } else if (name === 'emergencyEmailId' && value.length > 0 && !emailPattern.test(value)) {
      setEmergencyEmailError(true)
    } else {
      setEmailError(false)
      setEmergencyEmailError(false)
    }

    // Handle phone number formatting and validation for primary phone number
    if (name === 'primaryPhoneNumber') {
      const digits = value.replace(/\D/g, '') // Strip non-digits
      // Ignore input if digits exceed 10
      if (digits.length > 10) return
      const formattedNumber = formatPhoneNumber(digits)

      // Set error only if the field is not empty and does not have 10 digits
      setPrimaryPhoneNumberError(digits.length >= 0 && digits.length !== 10)

      setFormData((prev: any) => ({
        ...prev,
        [name]: formattedNumber // Store formatted number in state
      }))
      return
    }

    // Handle phone number formatting and validation for secondary phone number
    if (name === 'secondaryPhoneNumber') {
      const digits = value.replace(/\D/g, '') // Strip non-digits
      // Ignore input if digits exceed 10
      if (digits.length > 10) return
      const formattedNumber = formatPhoneNumber(digits)

      // Set error only if the field is not empty and does not have 10 digits
      setSecondaryPhoneNumberError(digits.length > 0 && digits.length !== 10)

      setFormData((prev: any) => ({
        ...prev,
        [name]: formattedNumber // Store formatted number in state
      }))
      return
    }

    if (name === 'address') {
      // Allow only alphanumeric input for address
      const alphanumericValue = value.replace(/[^a-zA-Z0-9\s.,-]/g, '') // Strip non-alphanumeric characters
      setAddressError(alphanumericValue.length >= 0 && alphanumericValue.length < 2) // Set error if less than 5 characters
      setFormData((prev: any) => ({
        ...prev,
        [name]: alphanumericValue // Store alphanumeric value in state
      }))
      return
    }

    if (name === 'zipCode') {
      // Allow only numeric input for zip code
      const numericValue = value.replace(/[^0-9]/g, '') // Strip non-numeric characters
      if (numericValue.length > 5) return // Ignore input if length exceeds 5
      setZipCodeError(numericValue.length >= 0 && numericValue.length !== 5) // Set error if not exactly 5 digits
      setFormData((prev: any) => ({
        ...prev,
        [name]: numericValue // Store numeric value in state
      }))
      return
    }

    if (name === 'city') {
      // Allow only alphabetic input for city
      const alphabeticValue = value.replace(/[^a-zA-Z\s]/g, '') // Strip non-alphabetic characters
      setCityError(alphabeticValue.length >= 0 && alphabeticValue.length < 2) // Set error if less than 2 characters
      setFormData((prev: any) => ({
        ...prev,
        [name]: alphabeticValue // Store alphabetic value in state
      }))
      return
    }

    if (name === 'payRate') {
      // Allow only numeric input for pay rate
      const numericValue = value.replace(/[^0-9.]/g, '') // Strip non-numeric characters
      setFormData((prev: any) => ({
        ...prev,
        [name]: numericValue // Store numeric value in state
      }))
      return
    }

    // Handle emergency contact number formatting and validation
    if (name === 'emergencyContactNumber') {
      const digits = value.replace(/\D/g, '') // Strip non-digits
      // Ignore input if digits exceed 10
      if (digits.length > 10) return
      const formattedNumber = formatPhoneNumber(digits)

      // Set error only if the field is not empty and does not have 10 digits
      setEmergencyPhoneNumberError(digits.length > 0 && digits.length !== 10)

      setFormData((prev: any) => ({
        ...prev,
        [name]: formattedNumber // Store formatted number in state
      }))
      return
    }

    // Handle all other fields normally
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      await api.put(`/caregivers/${id}`, formData)
      const accountStatusPayload = {
        accountStatus: accountStatus
      }
      await api.patch(`/user/${data.user.id}`, accountStatusPayload)
      const accountHistoryPayLoad = {
        actionType: 'CaregiverProfileInfoUpdate',
        details: `Caregiver (ID: ${id}) profile information updated by User (ID: ${authUser?.id})`,
        userId: authUser?.id,
        caregiverId: id
      }
      await api.post(`/account-history/log`, accountHistoryPayLoad)
      console.log('FORM DATA', formData)
      setIsEdit(true)
      fetchData() // Refresh data after update
    } catch (error) {
      console.error('Error updating data', error)
    } finally {
      setIsLoading(false)
    }
  }

  const personalFields = [
    { label: 'First Name', name: 'firstName', value: formData.firstName },
    { label: 'Middle Name', name: 'middleName', value: formData.middleName },
    { label: 'Last Name', name: 'lastName', value: formData.lastName },
    {
      label: 'Phone Number',
      name: 'primaryPhoneNumber',
      value: formData.primaryPhoneNumber,
      error: primaryPhoneNumberError
    },
    { label: 'Date of Birth', name: 'dateOfBirth', value: formData.dateOfBirth },
    { label: 'Email Address', name: 'emailAddress', value: formData.emailAddress },
    {
      label: 'Cell Phone Number',
      name: 'secondaryPhoneNumber',
      value: formData.secondaryPhoneNumber,
      error: secondaryPhoneNumberError
    },
    { label: 'Gender', name: 'gender', value: formData.gender }
  ]

  const emergencyFields = [
    {
      label: 'Emergency Number',
      name: 'emergencyContactNumber',
      value: formData.emergencyContactNumber,
      error: emergencyPhoneNumberError
    },
    {
      label: 'Emergency Email ID',
      name: 'emergencyEmailId',
      value: formData.emergencyEmailId,
      error: emergencyEmailError
    }
  ]

  const addressFields = [
    { label: 'Address', name: 'address', value: formData.address, error: addressError },
    { label: 'City', name: 'city', value: formData.city, error: cityError },
    { label: 'State', name: 'state', value: formData.state },
    { label: 'Zip Code', name: 'zipCode', value: formData.zipCode, error: zipCodeError },
    { label: 'Pay Rate', name: 'payRate', value: formData.payRate }
  ]

  const pcaUmpiFields = [
    { label: 'Payor', name: 'payor', value: formData.payor },
    { label: 'UMPI', name: 'umpi', value: formData.umpi },
    { label: 'Activation Date', name: 'activationDate', value: formData.activationDate },
    { label: 'Expiry Date', name: 'expiryDate', value: formData.expiryDate },
    { label: 'Fax Date', name: 'faxDate', value: formData.faxDate },
    { label: 'Received Date', name: 'receivedDate', value: formData.receivedDate }
  ]

  const caregiverNotesFields = [
    { label: 'Allergies', name: 'allergies', value: formData.allergies },
    { label: 'Special Requests', name: 'specialRequests', value: formData.specialRequests },
    { label: 'Comments', name: 'comments', value: formData.comments }
  ]

  const renderFileProgress = (files: File[]) => {
    return files.map((file: File, index: number) => (
      <div key={index} className='p-3 rounded-lg border border-[#32475C] border-opacity-[22%]'>
        <div className='flex justify-between items-center mb-2'>
          <div className='flex items-center gap-10'>
            <div className='flex items-center gap-2'>
              <PictureAsPdfIcon />
              <Typography className='font-semibold text-green-600 text-sm'>
                {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name} (100%)
              </Typography>
            </div>
            <div>
              <Typography className='font-semibold text-green-600 text-sm'>Completed</Typography>
            </div>
          </div>
        </div>
        <LinearProgress variant='determinate' value={100} color={'success'} />
      </div>
    ))
  }

  const renderUploadedDocuments = (doc: any) =>
    caregiverDocuments?.length > 0 && (
      <>
        <div className='px-4 py-2 rounded-lg border border-[#32475C] border-opacity-[22%]'>
          <div className='flex flex-row justify-between items-center'>
            <div className='flex items-center gap-2 mb-0'>
              <PictureAsPdfIcon />
              <div>
                <Typography className='font-semibold text-green-600 text-sm'>
                  {doc?.uploadedDocument?.fileName?.length > 25
                    ? `${doc?.uploadedDocument?.fileName?.substring(0, 25)}...`
                    : doc?.uploadedDocument?.fileName}
                </Typography>
                <Typography className='text-sm text-gray-600'>{doc?.uploadedDocument?.documentType}</Typography>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </>
    )

  return (
    <FormProvider {...methods}>
      <>
        {isLoading ? (
          <CircularProgressDeterminate variant='determinate' size={50} thickness={5} value={100} />
        ) : (
          <div>
            <Card className='w-full ml-2 shadow-md rounded-lg p-6'>
              {/* About Header */}
              <div className='flex justify-between items-center mb-6'>
                <Typography variant='h2' className='text-2xl font-semibold'>
                  About
                </Typography>
                <div className='flex items-center justify-center gap-5'>
                  {isEdit ? (
                    <div className='flex justify-between text-sm text-gray-500 items-center gap-2'>
                      <Typography className='text-md text-gray-500'>Status: </Typography>
                      <Typography
                        className={`text-md ${data?.user?.accountStatus === 'Active' ? 'bg-green-200 text-green-600' : 'bg-gray-200 text-gray-600'} font-medium rounded-full py-1 px-3`}
                      >
                        {accountStatus}
                      </Typography>
                    </div>
                  ) : (
                    <TextField
                      select
                      label='Account Status'
                      value={accountStatus}
                      onChange={e => setAccountStatus(e.target.value)}
                      variant='standard'
                      className='outline-none w-1/3'
                      disabled={isEdit}
                    >
                      <MenuItem value='Active'>Active</MenuItem>
                      <MenuItem value='Inactive'>Inactive</MenuItem>
                    </TextField>
                  )}
                  {!isEdit && (
                    <Button
                      variant='contained'
                      startIcon={<CloseIcon />}
                      className='text-white hover:bg-indigo-800'
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant='contained'
                    startIcon={isEdit ? <EditOutlined /> : <SaveOutlined />}
                    className='bg-[#4B0082] text-white'
                    onClick={isEdit ? () => setIsEdit(false) : handleSave}
                    disabled={
                      emailError ||
                      emergencyEmailError ||
                      primaryPhoneNumberError ||
                      secondaryPhoneNumberError ||
                      emergencyPhoneNumberError ||
                      addressError ||
                      cityError ||
                      stateError ||
                      zipCodeError
                    }
                  >
                    {isEdit ? 'Edit' : 'Update'}
                  </Button>
                </div>
              </div>

              {/* Personal Details Section */}
              <div className='mb-6'>
                <Typography variant='h3' className='text-lg font-semibold mb-4'>
                  Personal Details
                </Typography>
                <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
                  {personalFields.map(field => (
                    <EditableField
                      key={field.name}
                      label={field.label}
                      value={field.value}
                      isEdit={isEdit}
                      onChange={handleFieldChange}
                      name={field.name}
                      disabled={['emailAddress', 'gender'].includes(field.name) ? true : false}
                      phoneNumberError={field.error}
                    />
                  ))}
                </div>
              </div>

              {/* Emergency Details Section */}
              <div className='mb-6 border-t pt-6'>
                <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
                  {emergencyFields.map(field => (
                    <EditableField
                      key={field.name}
                      label={field.label}
                      value={field.value}
                      isEdit={isEdit}
                      onChange={handleFieldChange}
                      name={field.name}
                      phoneNumberError={field.error}
                      emailError={field.error}
                    />
                  ))}
                </div>
              </div>

              {/* Additional Details Section */}
              <div className='mb-6 border-t pt-0'></div>
              {/* Section: Responsible Party Details */}
              <div>
                <Typography className='text-lg font-semibold mb-4'>Mailing Address</Typography>
                <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
                  {addressFields.map(field => (
                    <EditableField
                      key={field.name}
                      label={field.label}
                      value={field.value}
                      isEdit={isEdit}
                      onChange={handleFieldChange}
                      name={field.name}
                      AddressError={field.error}
                    />
                  ))}
                </div>
                <Button
                  variant='contained'
                  startIcon={<AddOutlined />}
                  sx={{
                    marginTop: '10px',
                    backgroundColor: '#4B0082',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#6A0DAD'
                    }
                  }}
                >
                  Add Pay Rate
                </Button>
              </div>
            </Card>

            {/* Section: Service Information */}
            <Card className='mt-5 w-full ml-2 shadow-md rounded-lg p-6'>
              <div className='flex flex-row justify-between'>
                <Typography className='text-xl font-semibold mb-4'>PCA-UMPI INFO</Typography>
                {umpiDocument?.length ? (
                  <div className='flex flex-row'>
                    <Button
                      variant='contained'
                      className='mr-5 mb-4 cursor-pointer'
                      color='error'
                      startIcon={<DeleteOutline />}
                      onClick={() => {
                        setDeleteModalShow(true)
                        setUmpiDocToEdit(umpiDocument?.[0])
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant='contained'
                      onClick={() => {
                        umpiDocument?.length
                          ? handleUmpiDocumentEditModalOpen(umpiDocument?.[0])
                          : setNewUmpiDocModalShow(true)
                      }}
                      className='mr-0 mb-4 cursor-pointer'
                      startIcon={umpiDocument?.length ? <Edit /> : <Add />}
                    >
                      {umpiDocument?.length ? 'Update' : 'Add'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant='contained'
                    onClick={() => {
                      umpiDocument?.length
                        ? handleUmpiDocumentEditModalOpen(umpiDocument?.[0])
                        : setNewUmpiDocModalShow(true)
                    }}
                    className='mr-0 mb-4 cursor-pointer'
                    startIcon={umpiDocument?.length ? <Edit /> : <Add />}
                  >
                    {umpiDocument?.length ? 'Update' : 'Add'}
                  </Button>
                )}
              </div>

              {caregiverDocumentsLoading ? (
                <div className='flex justify-center itmes-center'>
                  <CircularProgress />
                </div>
              ) : (
                <div>
                  <div className='flex flex-row gap-2 mb-2'>
                    <Typography className='font-semibold'>Payor: </Typography>
                    <Typography>
                      {umpiDocument?.[0]?.uploadedDocument?.metaData?.payer
                        ? umpiDocument?.[0]?.uploadedDocument?.metaData?.payer
                        : 'N/A'}
                    </Typography>
                  </div>
                  <div className='flex flex-row gap-2 mb-2'>
                    <Typography className='font-semibold'>UMPI Number: </Typography>
                    <Typography>
                      {umpiDocument?.[0]?.uploadedDocument?.metaData?.umpiNumber
                        ? umpiDocument?.[0]?.uploadedDocument?.metaData?.umpiNumber
                        : 'N/A'}
                    </Typography>
                  </div>
                  <div className='flex flex-row gap-2 mb-2'>
                    <Typography className='font-semibold'>Activation Date: </Typography>
                    <Typography>
                      {umpiDocument?.[0]?.uploadedDocument?.metaData?.activationDate
                        ? umpiDocument?.[0]?.uploadedDocument?.metaData?.activationDate
                        : 'N/A'}
                    </Typography>
                  </div>
                  <div className='flex flex-row gap-2 mb-2'>
                    <Typography className='font-semibold'>Expiry Date: </Typography>
                    <Typography>
                      {umpiDocument?.[0]?.uploadedDocument?.expiryDate
                        ? umpiDocument?.[0]?.uploadedDocument?.expiryDate
                        : 'N/A'}
                    </Typography>
                  </div>
                  <div className='flex flex-row items-center gap-2 mb-2'>
                    <Typography className='font-semibold'>Uploaded File: </Typography>
                    {umpiDocument?.length ? renderUploadedDocuments(umpiDocument?.[0]) : <Typography>N/A</Typography>}
                  </div>
                </div>
              )}

              {/* <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
                {pcaUmpiFields.map(field => (
                  <EditableField
                    key={field.name}
                    label={field.label}
                    value={field.value}
                    isEdit={isEdit}
                    onChange={handleFieldChange}
                    name={field.name}
                  />
                ))}
              </div> */}
            </Card>

            {/* Section: Service Plan Details */}
            <Card className='mt-5 w-full ml-2 shadow-md rounded-lg p-6'>
              <Typography className='text-xl font-semibold mb-4'>Caregiver Notes</Typography>
              {caregiverNotesFields.map(field => (
                <EditableField
                  key={field.name}
                  label={field.label}
                  value={field.value}
                  isEdit={isEdit}
                  onChange={handleFieldChange}
                  name={field.name}
                />
              ))}

              <div className='mb-6 border-t pt-6 mt-5'>
                <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <Typography>Available Services: </Typography>
                    <Typography>---</Typography>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <Typography>Place of Services: </Typography>
                    <Typography>---</Typography>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <Typography>Client Location: </Typography>
                    <Typography>---</Typography>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
        <Dialog
          open={umpiDocEditModalShow}
          onClose={handleUmpiDocEditModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' }, paddingY: 2 }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleUmpiDocEditModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            <form onSubmit={handleSubmit(handleEditUmpiDoc)}>
              <div>
                <h2 className='text-xl font-semibold mt-5 mb-4'>Edit Driving License</h2>
              </div>
              <div className='p-0'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='col-span-1 p-3 border rounded-lg'>
                    <FileUploaderRestrictions
                      onFilesSelected={(selectedFiles: any) => {
                        setUmpiFile(selectedFiles)
                      }}
                      mimeType={['application/pdf']}
                      fileCount={1}
                      fileSize={25 * 1024 * 1024}
                    />
                  </div>
                  <div className='col-span-2'>
                    <h3 className='text-lg font-semibold mb-4'>Uploading Files</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{renderFileProgress(umpiFile)}</div>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                  <CustomTextField
                    label={'Payor'}
                    placeHolder={'123ABC'}
                    name={'payor'}
                    defaultValue={umpiDocToEdit?.uploadedDocument?.metaData?.payer}
                    type={'text'}
                    // error={!!errors?.drivingLicenseNumber}
                    isRequired={false}
                    control={control}
                  />
                  <CustomTextField
                    label={'UMPI Number'}
                    placeHolder={'A112233445'}
                    name={'umpiNumber'}
                    defaultValue={umpiDocToEdit?.uploadedDocument?.metaData?.umpiNumber}
                    type={'text'}
                    // error={!!errors?.drivingLicenseNumber}
                    isRequired={false}
                    control={control}
                  />
                  <ControlledDatePicker
                    name={'activationDate'}
                    control={control}
                    label={'Activation Date'}
                    defaultValue={umpiDocToEdit?.uploadedDocument?.metaData?.activationDate}
                    // error={errors.drivingLicenseExpiryDate}
                    isRequired={false}
                  />
                  <ControlledDatePicker
                    name={'expiryDate'}
                    control={control}
                    label={'Expiry Date'}
                    defaultValue={umpiDocToEdit?.uploadedDocument?.expiryDate}
                    // error={errors.drivingLicenseExpiryDate}
                    isRequired={false}
                  />
                </div>
              </div>
              <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                <Button variant='outlined' color='secondary' onClick={handleUmpiDocEditModalClose}>
                  CANCEL
                </Button>
                <Button
                  startIcon={umpiDocSaveButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
                  disabled={umpiDocSaveButtonLoading}
                  type='submit'
                  variant='contained'
                  className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'}`}
                >
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </Dialog>

        <Dialog
          open={newUmpiDocModalShow}
          onClose={handleNewUmpiDocModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' }, paddingY: 2 }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleNewUmpiDocModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            <form onSubmit={handleSubmit(handleAddNewUmpiDoc)}>
              <div>
                <h2 className='text-xl font-semibold mt-5 mb-4'>Add New UMPI Document</h2>
              </div>
              <div className='p-0'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='col-span-1 p-3 border rounded-lg'>
                    <FileUploaderRestrictions
                      onFilesSelected={(selectedFiles: any) => {
                        setUmpiFile(selectedFiles)
                      }}
                      mimeType={['application/pdf']}
                      fileCount={1}
                      fileSize={25 * 1024 * 1024}
                    />
                  </div>
                  <div className='col-span-2'>
                    <h3 className='text-lg font-semibold mb-4'>Uploading Files</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{renderFileProgress(umpiFile)}</div>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                  <CustomTextField
                    label={'Payor'}
                    placeHolder={'Payor'}
                    name={'newPayor'}
                    defaultValue={''}
                    type={'text'}
                    // error={!!errors?.drivingLicenseNumber}
                    isRequired={false}
                    control={control}
                  />
                  <CustomTextField
                    label={'UMPI Number'}
                    placeHolder={'A112233445'}
                    name={'newUmpiNumber'}
                    defaultValue={''}
                    type={'text'}
                    // error={!!errors?.drivingLicenseNumber}
                    isRequired={false}
                    control={control}
                  />
                  <ControlledDatePicker
                    name={'newActivationDate'}
                    control={control}
                    label={'Activation Date'}
                    defaultValue={null}
                    error={errors.newActivationDate}
                    isRequired={false}
                  />
                  <ControlledDatePicker
                    name={'newExpiryDate'}
                    control={control}
                    label={'Expiry Date'}
                    defaultValue={''}
                    // error={errors.drivingLicenseExpiryDate}
                    isRequired={false}
                  />
                </div>
              </div>
              <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                <Button variant='outlined' color='secondary' onClick={handleNewUmpiDocModalClose}>
                  CANCEL
                </Button>
                <Button
                  startIcon={umpiDocSaveButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
                  disabled={umpiDocSaveButtonLoading}
                  type='submit'
                  variant='contained'
                  className={`${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'}`}
                >
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </Dialog>
        <Dialog
          open={deleteModalShow}
          onClose={handleDeleteModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleDeleteModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            {/* <form onSubmit={handleDelete}> */}
            <div>
              <h2 className='text-xl font-semibold mt-5 mb-4'>Delete document</h2>
            </div>
            <div>
              <Typography className='mb-7'>Are you sure you want to delete this document?</Typography>
            </div>
            <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
              <Button variant='outlined' color='secondary' onClick={handleDeleteModalClose}>
                NO
              </Button>
              <Button
                startIcon={deleteButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
                disabled={deleteButtonLoading}
                // type='submit'
                onClick={handleDelete}
                variant='contained'
                className='bg-[#4B0082]'
              >
                YES
              </Button>
            </div>
            {/* </form> */}
          </div>
        </Dialog>
      </>
    </FormProvider>
  )
}

export default CaregiverAboutCard

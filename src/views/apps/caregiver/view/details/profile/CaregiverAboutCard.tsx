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
        caregiverUMPI: data.caregiverUMPI,
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
    { label: 'Gender', name: 'gender', value: formData.gender },
    { label: 'UMPI Number', name: 'caregiverUMPI', value: formData.caregiverUMPI }
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

          {/* Section: Service Plan Details */}
          {/* <Card className='mt-5 w-full ml-2 shadow-md rounded-lg p-6'>
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
            </Card> */}
        </div>
      )}
    </>
  )
}

export default CaregiverAboutCard

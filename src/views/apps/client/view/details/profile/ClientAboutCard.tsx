'use client'
import React, { useEffect, useState } from 'react'
import { Button, Card, CardContent, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { EditOutlined, SaveOutlined } from '@mui/icons-material'
import { EditableField } from '@/@core/components/custom-inputs/CustomEditableTextField'
import CloseIcon from '@mui/icons-material/Close'
import api from '@/utils/api'

const initialErrorState = {
  emailId: false,
  primaryPhoneNumber: false,
  primaryCellNumber: false,
  zipCode: false,
  emergencyEmailId: false,
  emergencyContactNumber: false,
  'physician.phoneNumber': false,
  'physician.faxNumber': false,
  'physician.zipCode': false,
  'caseManager.email': false,
  'caseManager.phoneNumber': false,
  'caseManager.faxNumber': false,
  'responsibleParty.phoneNumber': false,
  'responsibleParty.faxNumber': false,
  'responsibleParty.emailAddress': false
}

function ClientAboutCard() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(true)
  const [formData, setFormData] = useState<any>({})
  const [originalFormData, setOriginalFormData] = useState<any>({})
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const [formErrors, setFormErrors] = useState<any>(initialErrorState)

  const formatPhoneNumber = (value: string = '') => {
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return ''

    if (numbers.length <= 3) {
      return `(${numbers}`
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
    }
  }

  const validateEmail = (email: string) => {
    if (!email) return true
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return pattern.test(email)
  }

  const validatePhoneNumber = (phone: string) => {
    if (!phone) return true
    const digits = phone.replace(/\D/g, '')
    return digits.length === 10
  }

  const validateZipCode = (zipCode: string) => {
    if (!zipCode) return true
    const pattern = /^\d{5}(-\d{4})?$/
    return pattern.test(zipCode)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/client/detail/${id}`)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching data', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (data) {
      console.log(data)
      const residentialAddress = data.addresses?.find(
        (addr: any) => addr.address?.addressType === 'Residential'
      )?.address;
      const formattedData = {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        pmiNumber: data.pmiNumber,
        clientCode: data.clientCode,
        primaryPhoneNumber: data.primaryPhoneNumber,
        dateOfBirth: data.dateOfBirth,
        emailId: data.emailId,
        sharedCare: data.sharedCare,
        primaryCellNumber: data.primaryCellNumber,
        emergencyContactName: data.emergencyContactName,
        emergencyContactNumber: data.emergencyContactNumber,
        emergencyEmailId: data.emergencyEmailId,
        gender: data.gender,
        address: residentialAddress?.address || "",
        city: residentialAddress?.city || "",
        state: residentialAddress?.state || "",
        zipCode: residentialAddress?.zipCode || "",
        admissionDate: data.admissionDate,
        dischargeDate: data.dischargeDate,
        'physician.name': data.clientPhysician?.name,
        'physician.phoneNumber': data.clientPhysician?.phoneNumber,
        'physician.clinicName': data.clientPhysician?.clinicName,
        'physician.faxNumber': data.clientPhysician?.faxNumber,
        'physician.address': data.clientPhysician?.address,
        'physician.city': data.clientPhysician?.city,
        'physician.state': data.clientPhysician?.state,
        'physician.zipCode': data.clientPhysician?.zipCode,
        'caseManager.name': data.clientCaseManager?.caseManagerName,
        'caseManager.extension': data.clientCaseManager?.caseManagerExtention,
        'caseManager.phoneNumber': data.clientCaseManager?.caseManagerPhoneNumber,
        'caseManager.email': data.clientCaseManager?.caseManagerEmail,
        'caseManager.faxNumber': data.clientCaseManager?.caseManagerFaxNumber,
        'responsibleParty.name': data.clientResponsibilityParty?.name,
        'responsibleParty.relationship': data.clientResponsibilityParty?.relationship,
        'responsibleParty.phoneNumber': data.clientResponsibilityParty?.phoneNumber,
        'responsibleParty.faxNumber': data.clientResponsibilityParty?.faxNumber,
        'responsibleParty.emailAddress': data.clientResponsibilityParty?.emailAddress
      }
      setFormData(formattedData)
      setOriginalFormData(formattedData)
    }
  }, [data])

  const handleCancel = () => {
    setFormData({ ...originalFormData })
    setFormErrors(initialErrorState)
    setIsEdit(true)
  }

  const handleFieldChange = (name: string, value: any) => {
    // Update form data first
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }))

    // Then validate
    let isValid = true

    // Email validation
    if (
      name === 'emailId' ||
      name === 'emergencyEmailId' ||
      name === 'caseManager.email' ||
      name === 'responsibleParty.emailAddress'
    ) {
      isValid = validateEmail(value)
      setFormErrors((prev: any) => ({
        ...prev,
        [name]: !isValid
      }))
    }

    // Phone number validation
    else if (
      name.includes('phoneNumber') ||
      name.includes('faxNumber') ||
      name === 'primaryPhoneNumber' ||
      name === 'primaryCellNumber' ||
      name === 'emergencyContactNumber'
    ) {
      isValid = validatePhoneNumber(value)
      setFormErrors((prev: any) => ({
        ...prev,
        [name]: !isValid
      }))

      // Format phone numbers
      if (isValid && value) {
        const formattedValue = formatPhoneNumber(value)
        setFormData((prev: any) => ({
          ...prev,
          [name]: formattedValue
        }))
      }
    }

    // Zip code validation
    else if (name === 'zipCode' || name === 'physician.zipCode') {
      isValid = validateZipCode(value)
      setFormErrors((prev: any) => ({
        ...prev,
        [name]: !isValid
      }))
    }
  }

  const hasErrors = () => {
    return Object.values(formErrors).some(error => error === true)
  }

  const handleSave = async () => {
    if (hasErrors()) {
      alert('Please fix all validation errors before saving.')
      return
    }

    try {
      setIsLoading(true)
      await api.put(`/client/${id}`, formData)
      const accountHistoryPayLoad = {
        actionType: 'ClientProfileInfoUpdate',
        details: `Client (ID: ${id}) profile information updated by User (ID: ${authUser?.id})`,
        userId: authUser?.id,
        clientId: id
      }
      await api.post(`/account-history/log`, accountHistoryPayLoad)
      setIsEdit(true)
      fetchData()
    } catch (error) {
      console.error('Error updating data', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Field groupings for different sections
  const personalFields = [
    { label: 'First Name', name: 'firstName', value: formData.firstName },
    { label: 'Middle Name', name: 'middleName', value: formData.middleName },
    { label: 'Last Name', name: 'lastName', value: formData.lastName },
    { label: 'PMI Number', name: 'pmiNumber', value: formData.pmiNumber },
    { label: 'Client Code', name: 'clientCode', value: formData.clientCode },
    {
      label: 'Phone Number',
      name: 'primaryPhoneNumber',
      value: formData.primaryPhoneNumber,
      error: formErrors.primaryPhoneNumber
    },
    { label: 'Date of Birth', name: 'dateOfBirth', value: formData.dateOfBirth },
    { label: 'Email', name: 'emailId', value: formData.emailId, error: formErrors.emailId },
    {
      label: 'Cell Phone Number',
      name: 'primaryCellNumber',
      value: formData.primaryCellNumber,
      error: formErrors.primaryCellNumber
    },
    { label: 'Gender', name: 'gender', value: formData.gender }
  ]

  const emergencyFields = [
    { label: 'Emergency Contact Name', name: 'emergencyContactName', value: formData.emergencyContactName },
    {
      label: 'Emergency Contact Number',
      name: 'emergencyContactNumber',
      value: formData.emergencyContactNumber,
      error: formErrors.emergencyContactNumber
    },
    {
      label: 'Emergency Email ID',
      name: 'emergencyEmailId',
      value: formData.emergencyEmailId,
      error: formErrors.emergencyEmailId
    }
  ]

  const addressFields = [
    { label: 'Address', name: 'address', value: formData.address },
    { label: 'City', name: 'city', value: formData.city },
    { label: 'State', name: 'state', value: formData.state },
    { label: 'Zip Code', name: 'zipCode', value: formData.zipCode, error: formErrors.zipCode }
  ]

  const physicianFields = [
    { label: 'Physician Name', name: 'physician.name', value: formData['physician.name'] },
    {
      label: 'Phone Number',
      name: 'physician.phoneNumber',
      value: formData['physician.phoneNumber'],
      error: formErrors['physician.phoneNumber']
    },
    { label: 'Clinic Name', name: 'physician.clinicName', value: formData['physician.clinicName'] },
    {
      label: 'Fax Number',
      name: 'physician.faxNumber',
      value: formData['physician.faxNumber'],
      error: formErrors['physician.faxNumber']
    },
    { label: 'Address', name: 'physician.address', value: formData['physician.address'] },
    { label: 'City', name: 'physician.city', value: formData['physician.city'] },
    { label: 'State', name: 'physician.state', value: formData['physician.state'] },
    {
      label: 'Zip Code',
      name: 'physician.zipCode',
      value: formData['physician.zipCode'],
      error: formErrors['physician.zipCode']
    }
  ]

  const caseManagerFields = [
    { label: 'Case Manager Name', name: 'caseManager.name', value: formData['caseManager.name'] },
    { label: 'Extension', name: 'caseManager.extension', value: formData['caseManager.extension'] },
    {
      label: 'Phone Number',
      name: 'caseManager.phoneNumber',
      value: formData['caseManager.phoneNumber'],
      error: formErrors['caseManager.phoneNumber']
    },
    {
      label: 'Email',
      name: 'caseManager.email',
      value: formData['caseManager.email'],
      error: formErrors['caseManager.email']
    },
    {
      label: 'Fax Number',
      name: 'caseManager.faxNumber',
      value: formData['caseManager.faxNumber'],
      error: formErrors['caseManager.faxNumber']
    }
  ]

  const responsiblePartyFields = [
    { label: 'Name', name: 'responsibleParty.name', value: formData['responsibleParty.name'] },
    { label: 'Relationship', name: 'responsibleParty.relationship', value: formData['responsibleParty.relationship'] },
    {
      label: 'Phone Number',
      name: 'responsibleParty.phoneNumber',
      value: formData['responsibleParty.phoneNumber'],
      error: formErrors['responsibleParty.phoneNumber']
    },
    {
      label: 'Fax Number',
      name: 'responsibleParty.faxNumber',
      value: formData['responsibleParty.faxNumber'],
      error: formErrors['responsibleParty.faxNumber']
    },
    {
      label: 'Email Address',
      name: 'responsibleParty.emailAddress',
      value: formData['responsibleParty.emailAddress'],
      error: formErrors['responsibleParty.emailAddress']
    }
  ]

  const admissionFields = [
    { label: 'Admission Date', name: 'admissionDate', value: formData.admissionDate },
    { label: 'Discharge Date', name: 'dischargeDate', value: formData.dischargeDate }
  ]

  return (
    <Card className='w-full shadow-md rounded-lg p-6'>
      <CardContent className='flex justify-between items-center mb-6'>
        <Typography className='text-2xl font-semibold'>About</Typography>
        <div className='flex items-center justify-center gap-2'>
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
            onClick={isEdit ? () => setIsEdit(false) : handleSave}
            disabled={!isEdit && hasErrors()}
          >
            {isEdit ? 'Edit' : 'Update'}
          </Button>
        </div>
      </CardContent>

      {/* Personal Details Section */}
      <CardContent className='mb-6'>
        <Typography className='text-lg font-semibold mb-4'>Personal Details</Typography>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          {personalFields.map(field => (
            <div key={field.name}>
              <EditableField
                label={field.label}
                value={field.value}
                isEdit={isEdit}
                onChange={handleFieldChange}
                name={field.name}
                disabled={field.name === 'gender'}
              />
              {field.error && (
                <Typography className='text-error mt-1' sx={{ fontSize: '0.75rem' }}>
                  {field.name.includes('emailId')
                    ? 'Please enter a valid email address'
                    : field.name.includes('primaryPhoneNumber') || field.name.includes('primaryCellNumber')
                      ? 'Please enter a valid 10 digit number'
                      : 'Invalid format'}
                </Typography>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {/* Emergency Contact Section */}
      <CardContent className='mb-6 border-t pt-6'>
        <Typography className='text-lg font-semibold mb-4'>Emergency Contact</Typography>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          {emergencyFields.map(field => (
            <div key={field.name}>
              <EditableField
                label={field.label}
                value={field.value}
                isEdit={isEdit}
                onChange={handleFieldChange}
                name={field.name}
              />
              {field.error && (
                <Typography className='text-error mt-1' sx={{ fontSize: '0.75rem' }}>
                  {field.name.includes('emergencyEmailId') ? 'Please enter a valid email address' : 'Please enter a valid 10 digit number'}
                </Typography>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {/* Address Section */}
      <CardContent className='mb-6 border-t pt-6'>
        <Typography className='text-lg font-semibold mb-4'>Address</Typography>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          {addressFields.map(field => (
            <div key={field.name}>
              <EditableField
                label={field.label}
                value={field.value}
                isEdit={isEdit}
                onChange={handleFieldChange}
                name={field.name}
              />
              {field.error && (
                <Typography className='text-error mt-1' sx={{ fontSize: '0.75rem' }}>
                  Invalid zip code format (e.g., 12345)
                </Typography>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {/* Physician Section */}
      <CardContent className='mb-6 border-t pt-6'>
        <Typography className='text-lg font-semibold mb-4'>Physician Information</Typography>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          {physicianFields.map(field => (
            <div key={field.name}>
              <EditableField
                label={field.label}
                value={field.value}
                isEdit={isEdit}
                onChange={handleFieldChange}
                name={field.name}
              />
              {field.error && (
                <Typography className='text-error mt-1' sx={{ fontSize: '0.75rem' }}>
                  {field.name.includes('physician.zipCode') ? 'Invalid zip code format' : 'Please enter a valid 10 digit number'}
                </Typography>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {/* Case Manager Section */}
      <CardContent className='mb-6 border-t pt-6'>
        <Typography className='text-lg font-semibold mb-4'>Case Manager</Typography>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          {caseManagerFields.map(field => (
            <div key={field.name}>
              <EditableField
                label={field.label}
                value={field.value}
                isEdit={isEdit}
                onChange={handleFieldChange}
                name={field.name}
              />
              {field.error && (
                <Typography className='text-error mt-1' sx={{ fontSize: '0.75rem' }}>
                  {field.name.includes('caseManager.email') ? 'Please enter a valid email address' : 'Please enter a valid 10 digit number'}
                </Typography>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {/* Responsible Party Section */}
      <CardContent className='mb-6 border-t pt-6'>
        <Typography className='text-lg font-semibold mb-4'>Responsible Party</Typography>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          {responsiblePartyFields.map(field => (
            <div key={field.name}>
              <EditableField
                label={field.label}
                value={field.value}
                isEdit={isEdit}
                onChange={handleFieldChange}
                name={field.name}
              />
              {field.error && (
                <Typography className='text-error mt-1' sx={{ fontSize: '0.75rem' }}>
                  {field.name.includes('responsibleParty.emailAddress') ? 'Please enter a valid email address' : 'Please enter a valid 10 digit number'}
                </Typography>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ClientAboutCard

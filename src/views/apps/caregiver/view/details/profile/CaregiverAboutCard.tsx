'use client'
import React, { useEffect, useState } from 'react'
import { Button, Card, styled, TextField, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import type { CircularProgressProps } from '@mui/material/CircularProgress'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { AddOutlined, EditOutlined, SaveOutlined } from '@mui/icons-material'
import { EditableField } from '@/@core/components/custom-inputs/CustomEditableTextField'
import CloseIcon from '@mui/icons-material/Close'

const CircularProgressDeterminate = styled(CircularProgress)<CircularProgressProps>({
  color: 'var(--mui-palette-customColors-trackBg)'
})

function CaregiverAboutCard() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(true)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    fetchData()
  }, [])

  // Initialize form data when data is fetched
  useEffect(() => {
    if (data) {
      setFormData({
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        primaryPhoneNumber: data.primaryPhoneNumber,
        dateOfBirth: data.dateOfBirth,
        emailAddress: data.user?.emailAddress,
        secondaryPhoneNumber: data.secondaryPhoneNumber,
        emergencyContactNumber: data.emergencyContactNumber,
        emergencyEmailId: data.emergencyEmailId,
        address: data.addresses?.[0]?.address?.address,
        city: data.addresses?.[0]?.address?.city,
        state: data.addresses?.[0]?.address?.state,
        zipCode: data.addresses?.[0]?.address?.zipCode,
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
      })
    }
  }, [data])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregivers/user/${id}`)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching data', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/caregivers/${id}`, formData)
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
    { label: 'Phone Number', name: 'primaryPhoneNumber', value: formData.primaryPhoneNumber },
    { label: 'Date of Birth', name: 'dateOfBirth', value: formData.dateOfBirth },
    { label: 'Email Address', name: 'emergencyEmailId', value: formData.emergencyEmailId },
    { label: 'Cell Phone Number', name: 'secondaryPhoneNumber', value: formData.secondaryPhoneNumber }
  ]

  const emergencyFields = [
    { label: 'Emergency Number', name: 'emergencyContactNumber', value: formData.emergencyContactNumber },
    { label: 'Emergency Email ID', name: 'emergencyEmailId', value: formData.emergencyEmailId }
  ]

  const addressFields = [
    { label: 'Address', name: 'address', value: formData.address },
    { label: 'City', name: 'city', value: formData.city },
    { label: 'State', name: 'state', value: formData.state },
    { label: 'Zip', name: 'zipCode', value: formData.zipCode },
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
              <div className='flex items-center justify-center gap-2'>
                {!isEdit && (
                  <Button
                    variant='contained'
                    startIcon={<CloseIcon />}
                    className='text-white hover:bg-indigo-800'
                    onClick={() => setIsEdit(true)}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant='contained'
                  startIcon={isEdit ? <EditOutlined /> : <SaveOutlined />}
                  className='bg-indigo-900 text-white hover:bg-indigo-800'
                  onClick={isEdit ? () => setIsEdit(false) : handleSave}
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
            <Typography className='text-lg font-semibold mb-4'>PCA UMPI Information</Typography>
            <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
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
            </div>
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
    </>
  )
}

export default CaregiverAboutCard

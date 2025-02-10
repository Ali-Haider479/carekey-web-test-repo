'use client'
import React, { useEffect, useState } from 'react'
import { Button, Card, CardContent, Divider, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { EditOutlined, SaveOutlined } from '@mui/icons-material'
import { EditableField } from '@/@core/components/custom-inputs/CustomEditableTextField'
import CloseIcon from '@mui/icons-material/Close'

function ClientAboutCard() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(true)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client/detail/${id}`)
      console.log('CLIENT RES', response.data)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching data', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (data) {
      setFormData({
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        pmiNumber: data.pmiNumber,
        clientCode: data.clientCode,
        primaryPhoneNumber: data.primaryPhoneNumber,
        dateOfBirth: data.dateOfBirth,
        email: data.email,
        sharedCare: data.sharedCare,
        primaryCellNumber: data.primaryCellNumber,
        emergencyContactName: data.emergencyContactName,
        emergencyContactNumber: data.emergencyContactNumber,
        emergencyEmailId: data.emergencyEmailId,
        gender: data.gender,
        address: data.addresses?.[0]?.address?.address,
        city: data.addresses?.[0]?.address?.city,
        state: data.addresses?.[0]?.address?.state,
        zipCode: data.addresses?.[0]?.address?.zipCode,
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
      })
    }
  }, [data])

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/client/${id}`, formData)
      console.log('FORM DATA', formData)
      setIsEdit(true)
      fetchData() // Refresh data after update
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
    { label: 'Phone Number', name: 'primaryPhoneNumber', value: formData.primaryPhoneNumber },
    { label: 'Date of Birth', name: 'dateOfBirth', value: formData.dateOfBirth },
    { label: 'Email', name: 'email', value: formData.email },
    { label: 'Cell Phone Number', name: 'primaryCellNumber', value: formData.primaryCellNumber },
    { label: 'Gender', name: 'gender', value: formData.gender }
  ]

  const emergencyFields = [
    { label: 'Emergency Contact Name', name: 'emergencyContactName', value: formData.emergencyContactName },
    { label: 'Emergency Contact Number', name: 'emergencyContactNumber', value: formData.emergencyContactNumber },
    { label: 'Emergency Email ID', name: 'emergencyEmailId', value: formData.emergencyEmailId }
  ]

  const addressFields = [
    { label: 'Address', name: 'address', value: formData.address },
    { label: 'City', name: 'city', value: formData.city },
    { label: 'State', name: 'state', value: formData.state },
    { label: 'Zip Code', name: 'zipCode', value: formData.zipCode }
  ]

  const physicianFields = [
    { label: 'Physician Name', name: 'physician.name', value: formData['physician.name'] },
    { label: 'Phone Number', name: 'physician.phoneNumber', value: formData['physician.phoneNumber'] },
    { label: 'Clinic Name', name: 'physician.clinicName', value: formData['physician.clinicName'] },
    { label: 'Fax Number', name: 'physician.faxNumber', value: formData['physician.faxNumber'] },
    { label: 'Address', name: 'physician.address', value: formData['physician.address'] },
    { label: 'City', name: 'physician.city', value: formData['physician.city'] },
    { label: 'State', name: 'physician.state', value: formData['physician.state'] },
    { label: 'Zip Code', name: 'physician.zipCode', value: formData['physician.zipCode'] }
  ]

  const caseManagerFields = [
    { label: 'Case Manager Name', name: 'caseManager.name', value: formData['caseManager.name'] },
    { label: 'Extension', name: 'caseManager.extension', value: formData['caseManager.extension'] },
    { label: 'Phone Number', name: 'caseManager.phoneNumber', value: formData['caseManager.phoneNumber'] },
    { label: 'Email', name: 'caseManager.email', value: formData['caseManager.email'] },
    { label: 'Fax Number', name: 'caseManager.faxNumber', value: formData['caseManager.faxNumber'] }
  ]

  const responsiblePartyFields = [
    { label: 'Name', name: 'responsibleParty.name', value: formData['responsibleParty.name'] },
    { label: 'Relationship', name: 'responsibleParty.relationship', value: formData['responsibleParty.relationship'] },
    { label: 'Phone Number', name: 'responsibleParty.phoneNumber', value: formData['responsibleParty.phoneNumber'] },
    { label: 'Fax Number', name: 'responsibleParty.faxNumber', value: formData['responsibleParty.faxNumber'] },
    { label: 'Email Address', name: 'responsibleParty.emailAddress', value: formData['responsibleParty.emailAddress'] }
  ]

  const admissionFields = [
    { label: 'Admission Date', name: 'admissionDate', value: formData.admissionDate },
    { label: 'Discharge Date', name: 'dischargeDate', value: formData.dischargeDate }
  ]

  // Updated CardContent section for rendering fields
  return (
    <Card className='w-full shadow-md rounded-lg p-6'>
      {/* About Header */}
      <CardContent className='flex justify-between items-center mb-6'>
        <Typography className='text-2xl font-semibold'>About</Typography>
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
      </CardContent>

      {/* Personal Details Section */}
      <CardContent className='mb-6'>
        <Typography className='text-lg font-semibold mb-4'>Personal Details</Typography>
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
      </CardContent>

      {/* Emergency Contact Section */}
      <CardContent className='mb-6 border-t pt-6'>
        <Typography className='text-lg font-semibold mb-4'>Emergency Contact</Typography>
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
      </CardContent>

      {/* Address Section */}
      <CardContent className='mb-6 border-t pt-6'>
        <Typography className='text-lg font-semibold mb-4'>Address</Typography>
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
      </CardContent>

      {/* Physician Section */}
      <CardContent className='mb-6 border-t pt-6'>
        <Typography className='text-lg font-semibold mb-4'>Physician Information</Typography>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          {physicianFields.map(field => (
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
      </CardContent>

      {/* Case Manager Section */}
      <CardContent className='mb-6 border-t pt-6'>
        <Typography className='text-lg font-semibold mb-4'>Case Manager</Typography>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          {caseManagerFields.map(field => (
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
      </CardContent>

      {/* Responsible Party Section */}
      <CardContent className='mb-6 border-t pt-6'>
        <Typography className='text-lg font-semibold mb-4'>Responsible Party</Typography>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          {responsiblePartyFields.map(field => (
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
      </CardContent>

      {/* Section: Service Information */}
      <CardContent>
        <h2 className='text-lg font-semibold  mb-4'>Service Information</h2>
        <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
          <span className='text-sm '>
            Shared Care: <Typography>{`${formData?.sharedCare ? formData?.sharedCare : ''}`}</Typography>
          </span>
          <span className='text-sm '>
            Approved Service Locations: <Typography>NA</Typography>
          </span>
        </div>
      </CardContent>

      {/* Section: Service Plan Details */}
      <CardContent>
        <h2 className='text-lg font-semibold  mb-4'>Service Plan Details</h2>
        <div className='space-y-4'>
          <div>
            <span className='text-sm '>
              <Typography>IHS (with training) (H2014 UC U3)</Typography> (Aug 1, 2023 - Nov 27, 2024) Approved Units:
              1040 - <Typography> 0.5 Hrs/Day - 3.75 Hrs/Week</Typography>
            </span>
          </div>
          <div>
            <span className='text-sm '>
              Community Integration & Socialization: Assist with Community Participation, Entertainments, Activities,
              Health, Safety & Wellness, and completing Paperwork
            </span>
          </div>
          <div>
            <span className='text-sm '>
              <Typography>Integrated Community Supports Daily (T1020 UC):</Typography> (Nov 28, 2023 - Jul 31, 2024)
              Approved Units: <Typography>248 - 0.25 Hrs/Day - 1.75 Hrs/Week </Typography>
            </span>
          </div>
          <div>
            <span className='text-sm '>
              Going to store, Home Organization, Community Activity, Budgeting, Assist with scheduling ride to attend
              medical appointments, Client will work towards improving his health by being physically active/gym.,
              Assist with reading and organizing mails
            </span>
          </div>
        </div>
        <div className='mb-6 border-t pt-6 mt-4'>
          <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
            <span className='text-sm '>
              Available Services: <Typography>---</Typography>
            </span>
            <span className='text-sm '>
              Place of Services: <Typography>---</Typography>
            </span>
            <span className='text-sm '>
              Client Location: <Typography>---</Typography>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ClientAboutCard

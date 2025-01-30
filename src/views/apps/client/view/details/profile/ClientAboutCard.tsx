'use client'
import React, { useEffect, useState } from 'react'
import { Button, Card, CardContent, Divider, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined'
import { useParams } from 'next/navigation'
import axios from 'axios'

function ClientAboutCard() {
  const { id } = useParams()
  const [clientData, setClientData] = useState<any>()
  const getClientData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client/detail/${id}`)
      console.log('Response Client from Profile Data =>>', response.data)
      setClientData(response.data)
    } catch (error) {
      console.error('Error getting Client Data: ', error)
    }
  }

  useEffect(() => {
    getClientData()
  }, [])

  return (
    <Card className='w-full shadow-md rounded-lg p-6'>
      {/* About Header */}
      <CardContent className='flex justify-between items-center mb-6'>
        <Typography className='text-2xl font-semibold'>About</Typography>
        <Button startIcon={<ModeEditOutlineOutlinedIcon />} className={'bg-[#4B0082] text-white'}>
          Edit
        </Button>
      </CardContent>

      {/* Personal Details Section */}
      <CardContent className='mb-6'>
        <Typography className='text-lg font-semibold  mb-4'>Personal Details</Typography>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          <div className='flex justify-between text-sm '>
            <Typography>First Name:</Typography>
            <Typography>{`${clientData?.firstName ? clientData?.firstName : ''}`}</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>PMI Number:</Typography>
            <Typography>{`${clientData?.pmiNumber ? clientData?.pmiNumber : ''}`}</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Middle Name:</Typography>
            <Typography>{`${clientData?.middleName ? clientData?.middleName : ''}`}</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Client Code:</Typography>
            <Typography>{`${clientData?.clientCode ? clientData?.clientCode : ''}`}</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Last Name:</Typography>
            <Typography>{`${clientData?.lastName ? clientData?.lastName : ''}`}</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Phone Number:</Typography>
            <Typography>{`${clientData?.primaryPhoneNumber ? clientData?.primaryPhoneNumber : ''}`}</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Date of Birth:</Typography>
            <Typography>{`${clientData?.dateOfBirth ? clientData?.dateOfBirth : ''}`}</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Email Address:</Typography>
            <Typography>{`${clientData?.email ? clientData?.email : ''}`}</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Cell Phone Number:</Typography>
            <Typography>{`${clientData?.primaryCellNumber ? clientData?.primaryCellNumber : ''}`}</Typography>
          </div>
        </div>
      </CardContent>

      {/* Emergency Details Section */}
      <CardContent className=' mb-6 border-t pt-6'>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          <div className='flex justify-between text-sm '>
            <Typography>EMERGENCY CONTACT NAME:</Typography>
            <Typography>{`${clientData?.emergencyContactName ? clientData?.emergencyContactName : ''}`}</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>EMERGENCY C.NUMBER:</Typography>
            <Typography>{`${clientData?.emergencyContactNumber ? clientData?.emergencyContactNumber : ''}`}</Typography>
          </div>
        </div>
        <div className='mt-6 border-t pt-6'>
          <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
            <div className='flex justify-between text-sm '>
              <Typography>Emergency Email ID:</Typography>
              <Typography>{`${clientData?.emergencyEmailId ? clientData?.emergencyEmailId : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Gender:</Typography>
              <Typography>{`${clientData?.gender ? clientData?.gender : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Address:</Typography>
              <Typography>
                {clientData?.addresses?.length ? (clientData.addresses[0]?.address?.address ?? '') : ''}
              </Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>City:</Typography>
              <Typography>{`${clientData?.addresses?.length ? (clientData?.addresses[0]?.address?.city ?? '') : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>State:</Typography>
              <Typography>{`${clientData?.addresses?.length ? (clientData?.addresses[0]?.address?.state ?? '') : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Zip:</Typography>
              <Typography>{`${clientData?.addresses?.length ? (clientData?.addresses[0]?.address?.zipCode ?? '') : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physician Name:</Typography>
              <Typography>{`${clientData?.clientPhysician?.name ? clientData?.clientPhysician?.name : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physician Phone:</Typography>
              <Typography>{`${clientData?.clientPhysician?.phoneNumber ? clientData?.clientPhysician?.phoneNumber : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physician Clinic Name:</Typography>
              <Typography>{`${clientData?.clientPhysician?.clinicName ? clientData?.clientPhysician?.clinicName : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physician FAX:</Typography>
              <Typography>{`${clientData?.clientPhysician?.faxNumber ? clientData?.clientPhysician?.faxNumber : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physician Address:</Typography>
              <Typography>{`${clientData?.clientPhysician?.address ? clientData?.clientPhysician?.address : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physician City:</Typography>
              <Typography>{`${clientData?.clientPhysician?.city ? clientData?.clientPhysician?.city : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physician State:</Typography>
              <Typography>{`${clientData?.clientPhysician?.state ? clientData?.clientPhysician?.state : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physician Zip:</Typography>
              <Typography>{`${clientData?.clientPhysician?.zipCode ? clientData?.clientPhysician?.zipCode : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Admission Date :</Typography>
              <Typography>{`${clientData?.admissionDate ? clientData?.admissionDate : ''}`}</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Discharge Date :</Typography>
              <Typography>{`${clientData?.dischargeDate ? clientData?.dischargeDate : ''}`}</Typography>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Additional Details Section */}
      <CardContent className='mb-6 border-t pt-6'>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          <div className='flex justify-between text-sm '>
            <Typography>Case Manager Name:</Typography>
            <Typography>{`${clientData?.clientCaseManager?.caseManagerName ? clientData?.clientCaseManager?.caseManagerName : ''}`}</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Case Manager's Extension:</Typography>
            <Typography>{`${clientData?.clientCaseManager?.caseManagerExtention ? clientData?.clientCaseManager?.caseManagerExtention : ''}`}</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Case Manager's Phone Number:</Typography>
            <Typography>{`${clientData?.clientCaseManager?.caseManagerPhoneNumber ? clientData?.clientCaseManager?.caseManagerPhoneNumber : ''}`}</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Case Manager's Email Details:</Typography>
            <Typography>{`${clientData?.clientCaseManager?.caseManagerEmail ? clientData?.clientCaseManager?.caseManagerEmail : ''}`}</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Case Manager's FAX Number:</Typography>
            <Typography>{`${clientData?.clientCaseManager?.caseManagerFaxNumber ? clientData?.clientCaseManager?.caseManagerFaxNumber : ''}`}</Typography>
          </div>
        </div>
      </CardContent>
      {/* Section: Responsible Party Details */}
      <CardContent>
        <h2 className='text-lg font-semibold  mb-4'>Responsible Party Details</h2>
        <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
          <span className='text-sm '>
            Name:{' '}
            <Typography>{`${clientData?.clientResponsibilityParty?.name ? clientData?.clientResponsibilityParty?.name : ''}`}</Typography>
          </span>
          <span className='text-sm '>
            Relationship:{' '}
            <Typography>{`${clientData?.clientResponsibilityParty?.relationship ? clientData?.clientResponsibilityParty?.relationship : ''}`}</Typography>
          </span>
          <span className='text-sm '>
            Phone:{' '}
            <Typography>{`${clientData?.clientResponsibilityParty?.phoneNumber ? clientData?.clientResponsibilityParty?.phoneNumber : ''}`}</Typography>
          </span>
          <span className='text-sm '>
            Fax Number:{' '}
            <Typography>{`${clientData?.clientResponsibilityParty?.faxNumber ? clientData?.clientResponsibilityParty?.faxNumber : ''}`}</Typography>
          </span>
          <span className='text-sm '>
            Email:{' '}
            <Typography>{`${clientData?.clientResponsibilityParty?.emailAddress ? clientData?.clientResponsibilityParty?.emailAddress : ''}`}</Typography>
          </span>
        </div>
      </CardContent>

      {/* Section: Service Information */}
      <CardContent>
        <h2 className='text-lg font-semibold  mb-4'>Service Information</h2>
        <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
          <span className='text-sm '>
            Shared Care: <Typography>{`${clientData?.sharedCare ? clientData?.sharedCare : ''}`}</Typography>
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
        <div className='mb-6 border-t pt-6'>
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

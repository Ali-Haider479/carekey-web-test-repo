'use client'
import React from 'react'
import { Button, Card, CardContent, Divider, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined'

function ClientAboutCard() {
  return (
    <Card className='w-full shadow-md rounded-lg p-6 ml-4'>
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
            <Typography>Sameer</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>PMI Number:</Typography>
            <Typography>094382632</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Middle Name:</Typography>
            <Typography>K</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Client Code:</Typography>
            <Typography>2714</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Last Name:</Typography>
            <Typography>Khan</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Phone Number:</Typography>
            <Typography>+123-412-4214-4</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Date of Birth:</Typography>
            <Typography>05/05/2000</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Email Address:</Typography>
            <Typography>sameer@gmail.com</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Cell Phone Number:</Typography>
            <Typography>+238146</Typography>
          </div>
        </div>
      </CardContent>

      {/* Emergency Details Section */}
      <CardContent className=' mb-6 border-t pt-6'>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          <div className='flex justify-between text-sm '>
            <Typography>EMERGENCY NUMBER:</Typography>
            <Typography>---</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>EMERGENCY C.NUMBER:</Typography>
            <Typography>---</Typography>
          </div>
        </div>
        <div className='mt-6 border-t pt-6'>
          <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
            <div className='flex justify-between text-sm '>
              <Typography>Emergency Email ID:</Typography>
              <Typography>sameerkhan@gmail</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Gender:</Typography>
              <Typography>Male</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Address:</Typography>
              <Typography>5th Street</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>City:</Typography>
              <Typography>CALIFORNIA</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>State:</Typography>
              <Typography>United States</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Zip:</Typography>
              <Typography>124512</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physical Name:</Typography>
              <Typography>Sameer Khan</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physical Phone:</Typography>
              <Typography>+2374129242</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physical Clinic Name:</Typography>
              <Typography>Al Hayat clinic</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physician FAX:</Typography>
              <Typography>53132</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physical Address:</Typography>
              <Typography>5th Road</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physician City:</Typography>
              <Typography>Newyork</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physician State:</Typography>
              <Typography>United States</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Physician Zip:</Typography>
              <Typography>126723</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Admission Date :</Typography>
              <Typography>01/01/2023</Typography>
            </div>
            <div className='flex justify-between text-sm '>
              <Typography>Discharge Date :</Typography>
              <Typography>29/01/2024</Typography>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Additional Details Section */}
      <CardContent className='mb-6 border-t pt-6'>
        <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
          <div className='flex justify-between text-sm '>
            <Typography>Case Manager Name:</Typography>
            <Typography>---</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Case Manager's Extension:</Typography>
            <Typography>---</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Case Manager's Phone Number:</Typography>
            <Typography>---</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Case Manager's Email Details:</Typography>
            <Typography>---</Typography>
          </div>
          <div className='flex justify-between text-sm '>
            <Typography>Case Manager's FAX Number:</Typography>
            <Typography>---</Typography>
          </div>
        </div>
      </CardContent>
      {/* Section: Responsible Party Details */}
      <CardContent>
        <h2 className='text-lg font-semibold  mb-4'>Responsible Party Details</h2>
        <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
          <p className='text-sm '>
            Name: <Typography>---</Typography>
          </p>
          <p className='text-sm '>
            Relationship: <Typography>---</Typography>
          </p>
          <p className='text-sm '>
            Phone: <Typography>---</Typography>
          </p>
          <p className='text-sm '>
            Address: <Typography>---</Typography>
          </p>
          <p className='text-sm '>
            Email: <Typography>---</Typography>
          </p>
        </div>
      </CardContent>

      {/* Section: Service Information */}
      <CardContent>
        <h2 className='text-lg font-semibold  mb-4'>Service Information</h2>
        <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
          <p className='text-sm '>
            Shared Care: <Typography>No</Typography>
          </p>
          <p className='text-sm '>
            Approved Service Locations: <Typography>NA</Typography>
          </p>
        </div>
      </CardContent>

      {/* Section: Service Plan Details */}
      <CardContent>
        <h2 className='text-lg font-semibold  mb-4'>Service Plan Details</h2>
        <div className='space-y-4'>
          <div>
            <p className='text-sm '>
              <Typography>IHS (with training) (H2014 UC U3)</Typography> (Aug 1, 2023 - Nov 27, 2024) Approved Units:
              1040 - <Typography> 0.5 Hrs/Day - 3.75 Hrs/Week</Typography>
            </p>
          </div>
          <div>
            <p className='text-sm '>
              Community Integration & Socialization: Assist with Community Participation, Entertainments, Activities,
              Health, Safety & Wellness, and completing Paperwork
            </p>
          </div>
          <div>
            <p className='text-sm '>
              <Typography>Integrated Community Supports Daily (T1020 UC):</Typography> (Nov 28, 2023 - Jul 31, 2024)
              Approved Units: <Typography>248 - 0.25 Hrs/Day - 1.75 Hrs/Week </Typography>
            </p>
          </div>
          <div>
            <p className='text-sm '>
              Going to store, Home Organization, Community Activity, Budgeting, Assist with scheduling ride to attend
              medical appointments, Client will work towards improving his health by being physically active/gym.,
              Assist with reading and organizing mails
            </p>
          </div>
        </div>
        <div className='mb-6 border-t pt-6'>
          <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
            <p className='text-sm '>
              Available Services: <Typography>---</Typography>
            </p>
            <p className='text-sm '>
              Place of Services: <Typography>---</Typography>
            </p>
            <p className='text-sm '>
              Client Location: <Typography>---</Typography>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ClientAboutCard

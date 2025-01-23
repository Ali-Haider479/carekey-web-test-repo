import React from 'react'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Typography } from '@mui/material'

function CaregiverAboutCard() {
  return (
    <div>
      <Card className='w-full ml-2 shadow-md rounded-lg p-6'>
        {/* About Header */}
        <div className='flex justify-between items-center mb-6'>
          <Typography variant='h2' className='text-2xl font-semibold text-gray-700'>
            About
          </Typography>
          <Button
            variant='contained'
            startIcon={<EditOutlined />}
            sx={{
              backgroundColor: '#4B0082',
              color: 'white',
              '&:hover': {
                backgroundColor: '#6A0DAD'
              }
            }}
          >
            Edit
          </Button>
        </div>

        {/* Personal Details Section */}
        <div className='mb-6'>
          <Typography variant='h3' className='text-lg font-semibold mb-4'>
            Personal Details
          </Typography>
          <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>First Name:</Typography>
              <Typography className=''>Sameer</Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>User Name:</Typography>
              <Typography className=''>094382632</Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>Middle Name:</Typography>
              <Typography className=''>K</Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>Title:</Typography>
              <Typography className=''>2714</Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>Last Name:</Typography>
              <Typography className=''>Khan</Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>Phone Number:</Typography>
              <Typography className=''>+123-412-4214-4</Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>Date of Birth:</Typography>
              <Typography className=''>05/05/2000</Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>Email Address:</Typography>
              <Typography className=''>sameer@gmail.com</Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>Cell Phone Number:</Typography>
              <Typography className=''>+238146</Typography>
            </div>
          </div>
        </div>

        {/* Emergency Details Section */}
        <div className=' mb-6 border-t pt-6'>
          <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>EMERGENCY NUMBER:</Typography>
              <Typography className=''>---</Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>EMERGENCY C.NUMBER:</Typography>
              <Typography className=''>---</Typography>
            </div>
          </div>
          <div className='mt-6 border-t pt-6'>
            <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>Emergency Email ID:</Typography>
                <Typography className=''>sameerkhan@gmail</Typography>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>Employee Number:</Typography>
                <Typography className=''>---</Typography>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>Address:</Typography>
                <Typography className=''>5th Street</Typography>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>City:</Typography>
                <Typography className=''>CALIFORNIA</Typography>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>State:</Typography>
                <Typography className=''>United States</Typography>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>Zip:</Typography>
                <Typography className=''>124512</Typography>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>Date of Hire:</Typography>
                <Typography className=''>---</Typography>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>Caregiver Level:</Typography>
                <Typography className=''>---</Typography>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>NPI/UMPI Number:</Typography>
                <Typography className=''>---</Typography>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>Training Completed:</Typography>
                <Typography className=''>Aug 22,2022</Typography>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>Is 245D licensed:</Typography>
                <Typography className=''>Yes</Typography>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>DL Expiration Date:</Typography>
                <Typography className=''>---</Typography>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>Driver Liscensed:</Typography>
                <Typography className=''>---</Typography>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <Typography>Addional Pay Rate:</Typography>
                <Typography className=''>---</Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details Section */}
        <div className='mb-6 border-t pt-6'>
          <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>Case Manager Name:</Typography>
              <Typography className=''>---</Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>Case Manager's Extension:</Typography>
              <Typography className=''>---</Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>Case Manager's Phone Number:</Typography>
              <Typography className=''>---</Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>Case Manager's Email Details:</Typography>
              <Typography className=''>---</Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <Typography>Case Manager's FAX Number:</Typography>
              <Typography className=''>---</Typography>
            </div>
          </div>
        </div>
        {/* Section: Responsible Party Details */}
        <div>
          <h2 className='text-lg font-semibold text-gray-600 mb-4'>Mailing Address</h2>
          <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
            <Typography className='text-sm text-gray-500'>
              Address: <br />
              3132 5th Ave
            </Typography>
            <Typography className='text-sm text-gray-500'>
              City: <br />
              ABC
            </Typography>
            <Typography className='text-sm text-gray-500'>
              State: <br />
              MN
            </Typography>
            <Typography className='text-sm text-gray-500'>
              Zip: <br />
              55408
            </Typography>
            <Typography className='text-base text-gray-500'>Pay Rate</Typography>
          </div>
          <Button
            variant='contained'
            startIcon={<PlusOutlined />}
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
        <h2 className='text-lg font-semibold text-gray-600 mb-4'>PCA UMPI Information</h2>
        <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
          <Typography className='text-sm text-gray-500'>
            Payor: <br />
            No
          </Typography>
          <Typography className='text-sm text-gray-500'>
            UMPI: <br />
            NA
          </Typography>
        </div>
        <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
          <Typography className='text-sm text-gray-500'>
            Activation Date: <br />
            No
          </Typography>
          <Typography className='text-sm text-gray-500'>
            Expiry Date: <br />
            NA
          </Typography>
        </div>
        <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
          <Typography className='text-sm text-gray-500'>
            Fax Date: <br />
            No
          </Typography>
          <Typography className='text-sm text-gray-500'>
            Recieved Date: <br />
            NA
          </Typography>
        </div>
      </Card>

      {/* Section: Service Plan Details */}
      <Card className='mt-5 w-full ml-2 shadow-md rounded-lg p-6'>
        <h2 className='text-xl font-semibold text-gray-600 mb-4'>Caregiver Notes</h2>
        <label className='text-lg text-gray-500'>Allergies</label>
        <div className='space-y-4'>
          <div>
            <div className='text-sm text-gray-500'>
              <Typography className=''>IHS (with training) (H2014 UC U3)</Typography>
              <Typography> (Aug 1, 2023 - Nov 27, 2024) Approved Units: 1040 - </Typography>
              <Typography className=''> 0.5 Hrs/Day - 3.75 Hrs/Week</Typography>
            </div>
          </div>
          <div>
            <Typography className='text-sm text-gray-500'>
              Community Integration & Socialization: Assist with Community Participation, Entertainments, Activities,
              Health, Safety & Wellness, and completing Paperwork
            </Typography>
          </div>
          <div>
            <div className='text-sm text-gray-500'>
              <Typography className=''>Integrated Community Supports Daily (T1020 UC):</Typography>
              <Typography>(Nov 28, 2023 - Jul 31, 2024) Approved Units: </Typography>
              <Typography className=''>248 - 0.25 Hrs/Day - 1.75 Hrs/Week </Typography>
            </div>
          </div>
          <div>
            <Typography className='text-sm text-gray-500'>
              Going to store, Home Organization, Community Activity, Budgeting, Assist with scheduling ride to attend
              medical appointments, Client will work towards improving his health by being physically active/gym.,
              Assist with reading and organizing mails
            </Typography>
          </div>
        </div>
        <div className='mb-6 border-t pt-6'>
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
  )
}

export default CaregiverAboutCard

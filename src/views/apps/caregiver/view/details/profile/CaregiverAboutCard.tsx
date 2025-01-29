'use client'
import React, { useEffect, useState } from 'react'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, styled, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import type { CircularProgressProps } from '@mui/material/CircularProgress'
import { useParams } from 'next/navigation'
import axios from 'axios'

const CircularProgressDeterminate = styled(CircularProgress)<CircularProgressProps>({
  color: 'var(--mui-palette-customColors-trackBg)'
})

const CircularProgressIndeterminate = styled(CircularProgress)<CircularProgressProps>(({ theme }) => ({
  left: 0,
  position: 'absolute',
  animationDuration: '550ms',
  color: '#1a90ff',
  ...theme.applyStyles('dark', {
    color: '#308fe8'
  })
}))

function CaregiverAboutCard() {
  const { id } = useParams()

  console.log('user id ---> ', id)
  const [data, setData] = useState<any>()
  const [notesData, setNotesData] = useState<any>()
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    // Fetch data from the backend API
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregivers/user/${id}`)
        const fetchedData = response.data
        console.log('Caregiver Profile Data ----> ', fetchedData)
        setData(fetchedData)
      } catch (error) {
        console.error('Error fetching data', error)
      }
      setIsLoading(false)
    }

    fetchData()

    const fetchNotesData = async () => {
      try {
        setIsLoading(true)
        const notesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregivers/${id}/notes`)
        const fetchedNotesData = notesResponse.data
        console.log('Caregiver Notes Data ----> ', fetchedNotesData)
        setNotesData(fetchedNotesData)
      } catch (error) {
        console.error('Error fetching data', error)
      }
      setIsLoading(false)
    }

    fetchNotesData()
  }, [])

  return (
    <>
      {isLoading ? (
        <CircularProgressDeterminate variant='determinate' size={50} thickness={5} value={100} />
      ) : (
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
                  <Typography className=''>{data?.firstName ? data.firstName : '---'}</Typography>
                </div>
                <div className='flex justify-between text-sm text-gray-500'>
                  <Typography>User Name:</Typography>
                  <Typography className=''>{data?.user?.userName ? data.user.userName : '---'}</Typography>
                </div>
                <div className='flex justify-between text-sm text-gray-500'>
                  <Typography>Middle Name:</Typography>
                  <Typography className=''>{data?.middleName ? data.middleName : '---'}</Typography>
                </div>
                <div className='flex justify-between text-sm text-gray-500'>
                  <Typography>Title:</Typography>
                  <Typography className=''>{data?.schedules?.title ? data?.schedules.title : '---'}</Typography>
                </div>
                <div className='flex justify-between text-sm text-gray-500'>
                  <Typography>Last Name:</Typography>
                  <Typography className=''>{data?.lastName ? data.lastName : '---'}</Typography>
                </div>
                <div className='flex justify-between text-sm text-gray-500'>
                  <Typography>Phone Number:</Typography>
                  <Typography className=''>{data?.primaryPhoneNumber ? data.primaryPhoneNumber : '---'}</Typography>
                </div>
                <div className='flex justify-between text-sm text-gray-500'>
                  <Typography>Date of Birth:</Typography>
                  <Typography className=''>{data?.dateOfBirth ? data.dateOfBirth : '---'}</Typography>
                </div>
                <div className='flex justify-between text-sm text-gray-500'>
                  <Typography>Email Address:</Typography>
                  <Typography className=''>{data?.user?.emailAddress ? data.user.emailAddress : '---'}</Typography>
                </div>
                <div className='flex justify-between text-sm text-gray-500'>
                  <Typography>Cell Phone Number:</Typography>
                  <Typography className=''>{data?.secondryPhoneNumber ? data.secondryPhoneNumber : ''}</Typography>
                </div>
              </div>
            </div>

            {/* Emergency Details Section */}
            <div className=' mb-6 border-t pt-6'>
              <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
                <div className='flex justify-between text-sm text-gray-500'>
                  <Typography>EMERGENCY NUMBER:</Typography>
                  <Typography className=''>
                    {data?.emergencyContactNumber ? data.emergencyContactNumber : '---'}
                  </Typography>
                </div>
                <div className='flex justify-between text-sm text-gray-500'>
                  <Typography>EMERGENCY EMAIL ID: </Typography>
                  <Typography className=''>{data?.emergencyEmailId ? data.emergencyEmailId : '---'}</Typography>
                </div>
              </div>
              <div className='mt-6 border-t pt-6'>
                <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <Typography>Employee Number:</Typography>
                    <Typography className=''>---</Typography>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <Typography>Address:</Typography>
                    <Typography className=''>
                      {data?.addresses[0].address.address ? data?.addresses[0].address.address : '---'}
                    </Typography>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <Typography>City:</Typography>
                    <Typography className=''>
                      {data?.addresses[0].address.city ? data?.addresses[0].address.city : '---'}
                    </Typography>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <Typography>State:</Typography>
                    <Typography className=''>
                      {data?.addresses[0].address.state ? data?.addresses[0].address.state : '---'}
                    </Typography>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <Typography>Zip:</Typography>
                    <Typography className=''>
                      {data?.addresses[0].address.zipCode ? data?.addresses[0].address.zipCode : '---'}
                    </Typography>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <Typography>Date of Hire:</Typography>
                    <Typography className=''>{data?.dateOfHire ? data?.dateOfHire : '---'}</Typography>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <Typography>Caregiver Level:</Typography>
                    <Typography className=''>{data?.caregiverLevel ? data?.caregiverLevel : '---'}</Typography>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <Typography>NPI/UMPI Number:</Typography>
                    <Typography className=''>{data?.caregiverUMPI ? data?.caregiverUMPI : '---'}</Typography>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <Typography>Training Completed:</Typography>
                    <Typography className=''>---</Typography>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <Typography>Is 245D licensed:</Typography>
                    <Typography className=''>{data?.isLicensed245d === true ? 'Yes' : 'No'}</Typography>
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
                    <Typography className=''>{data?.additionalPayRate ? data?.additionalPayRate : '---'}</Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div className='mb-6 border-t pt-0'></div>
            {/* Section: Responsible Party Details */}
            <div>
              <h2 className='text-lg font-semibold text-gray-600 mb-4'>Mailing Address</h2>
              <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
                <Typography className='text-sm text-gray-500'>
                  Address: <br />
                  {data?.addresses[1]?.address?.address ? data?.addresses[1].address.address : '---'}
                </Typography>
                <Typography className='text-sm text-gray-500'>
                  City: <br />
                  {data?.addresses[1]?.address?.city ? data?.addresses[1].address.city : '---'}
                </Typography>
                <Typography className='text-sm text-gray-500'>
                  State: <br />
                  {data?.addresses[1]?.address?.city ? data?.addresses[1].address.city : '---'}
                </Typography>
                <Typography className='text-sm text-gray-500'>
                  Zip: <br />
                  {data?.addresses[1]?.address?.zipCode ? data?.addresses[1].address.zipCode : '---'}
                </Typography>
                <Typography className='text-base text-gray-500'>
                  Pay Rate: <br />
                  {data?.payRate ? data?.payRate : '---'}
                </Typography>
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
            <Typography className='text-xl font-semibold text-gray-600 mb-4'>Caregiver Notes</Typography>
            <Typography className='text-lg text-gray-500'>
              Allergies: <br />
            </Typography>
            <Typography className='text-sm text-gray-500'>
              {notesData?.allergies ? notesData?.allergies : '---'}
            </Typography>
            <Typography className='text-lg text-gray-500 mt-3'>
              Special Requests: <br />
            </Typography>
            <Typography className='text-sm text-gray-500'>
              {notesData?.specialRequests ? notesData?.specialRequests : '---'}
            </Typography>

            <Typography className='text-lg text-gray-500 mt-3'>
              Comments: <br />
            </Typography>
            <Typography className='text-sm text-gray-500'>
              {notesData?.comments ? notesData?.comments : '---'}
            </Typography>

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

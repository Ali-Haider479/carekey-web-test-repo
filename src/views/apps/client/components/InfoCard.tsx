'use client'
import ProfileAvatar from '@/@core/components/mui/ProfileAvatar'
import { Avatar, Card, CardContent, Typography } from '@mui/material'
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const InfoCard = () => {
  const [assignedCaregiver, setAssignedCaregiver] = useState<any>()
  const { id } = useParams()

  const fetchAssignCaregivers = async () => {
    try {
      const clientResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client/assigned-caregivers/${id}`)
      const fetchedClient = clientResponse.data
      console.log('Assigned Caregivers --> ', fetchedClient)

      // Fetch profile images directly inside
      const caregiversWithPhotos = await Promise.all(
        fetchedClient.map(async (item: any) => {
          const profileImageUrl =
            item?.user?.profileImageUrl !== null
              ? await getProfileImage(item?.user?.profileImageUrl)
              : item?.user?.profileImageUrl
          return { ...item, profileImageUrl }
        })
      )

      setAssignedCaregiver(caregiversWithPhotos)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  useEffect(() => {
    fetchAssignCaregivers()
  }, [])

  const getProfileImage = async (key: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client/getProfileUrl/${key}`)
      return res.data
    } catch (err) {
      console.error(`Error fetching profile image: ${err}`)
      return '/default-avatar.png' // Fallback image
    }
  }

  return (
    <Card className='max-w-md mr-4 shadow-md rounded-lg'>
      {/* Insurance and Diagnostic Code */}
      <CardContent className='mb-4'>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <Typography>Insurance:</Typography>
          <Typography className='text-gray-400'>MA</Typography>
        </div>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <Typography>Diagnostic code:</Typography>
          <Typography className='text-gray-400'>F84.0</Typography>
        </div>
      </CardContent>

      {/* Eligibility Test */}
      <CardContent>
        <h3 className='text-xl font-semibold text-gray-500 mb-2'>Eligibility Test</h3>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <Typography>Eligibility:</Typography>
          <Typography className='text-gray-400'>MA</Typography>
        </div>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <Typography>Eligibility 2:</Typography>
          <Typography className='text-gray-400'>QM</Typography>
        </div>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <Typography>Payor:</Typography>
          <Typography className='text-gray-400'>MA</Typography>
        </div>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <Typography>MA Code:</Typography>
          <Typography className='text-gray-400'>MA87</Typography>
        </div>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <Typography>PMap:</Typography>
          <Typography className='text-gray-400'>MEDICA</Typography>
        </div>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <Typography>Waiver:</Typography>
          <Typography className='text-gray-400'>DDWaiver</Typography>
        </div>
        <div className='flex justify-between text-sm text-gray mb-2'>
          <Typography>Updated On:</Typography>
          <Typography className='text-gray-400'>April 24, 2024</Typography>
        </div>
      </CardContent>

      {/* Assigned Caregivers */}
      <CardContent className='pl-0'>
        <h3 className='ml-6 text-xl font-semibold text-gray-500 mb-2'>
          Assigned Caregivers ({assignedCaregiver?.length})
        </h3>
        <ul>
          {assignedCaregiver?.map((item: any, index: number) => (
            <li key={index} className='flex justify-between mb-4 last:mb-0'>
              <div className='flex items-center space-x-3'>
                <Avatar
                  alt={item?.user?.userName}
                  src={item?.profileImageUrl || item?.user?.userName}
                  className='w-10 h-10'
                />
                <div>
                  <Typography className='text-sm font-medium text-gray-400'>{item?.user?.userName}</Typography>
                  <Typography className='text-sm text-[#71DD37]'>{item?.user?.emailAddress}</Typography>
                </div>
              </div>
              {/* < className="text- bg-[#666CFF]"> #4B0082*/}
              <img
                className='bg-[#666CFF] bg-opacity-20 h-8 border-4 border-transparent rounded-full mt-1'
                src='/assets/svg-icons/openLink.svg'
                alt=''
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default InfoCard

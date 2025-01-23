'use client'
import { Card, CardContent, Typography } from '@mui/material'
import React from 'react'

const InfoCard = () => {
  const caregivers = [
    {
      name: 'Shamso Abshir',
      phone: '(952)726-1234',
      image: '/images/avatars/1.png'
    },
    { name: 'Alia Khan', phone: '(952)726-1234', image: '/images/avatars/2.png' },
    {
      name: 'Alonso James',
      phone: '(952)726-1234',
      image: '/images/avatars/3.png'
    },
    {
      name: 'Alisha Lehman',
      phone: '(952)726-1234',
      image: '/images/avatars/4.png'
    }
  ]

  return (
    <Card className='max-w-md ml-4 mr-4 shadow-md rounded-lg'>
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
        <h3 className='ml-6 text-xl font-semibold text-gray-500 mb-2'>Assigned Caregivers ({caregivers.length})</h3>
        <ul>
          {caregivers.map((caregiver, index) => (
            <li key={index} className='flex justify-between mb-4 last:mb-0'>
              <div className='flex items-center space-x-3'>
                <img src={caregiver.image} alt={caregiver.name} className='w-10 h-10 rounded-full' />
                <div>
                  <Typography className='text-sm font-medium text-gray-400'>{caregiver.name}</Typography>
                  <Typography className='text-sm text-[#71DD37]'>{caregiver.phone}</Typography>
                </div>
              </div>
              {/* < className="text- bg-[#666CFF]"> #4B0082*/}
              <img
                className='bg-[#666CFF] bg-opacity-20 h-6 w-6  rounded-full'
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

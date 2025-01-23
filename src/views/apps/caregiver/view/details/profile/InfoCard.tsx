import React from 'react'
import { Card, Typography } from '@mui/material'

const InfoCard = () => {
  const clients = [
    {
      name: 'Shamso Abshir',
      service: 'IHS (with training',
      image: '/images/avatars/17.png'
    },
    { name: 'Alia Khan', service: 'IHS (with training', image: '/images/avatars/13.png' },
    {
      name: 'Alonso James',
      service: 'EMPL Development',
      image: '/images/avatars/16.png'
    },
    {
      name: 'Alisha Lehman',
      service: 'IHS (with training',
      image: '/images/avatars/8.png'
    }
  ]

  return (
    <Card className='max-w-md ml-0 mr-4 shadow-md rounded-lg p-6'>
      <div className='mb-4'>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <Typography>Role:</Typography>
          <Typography className='text-gray-400'>Caregiver, Office Admin</Typography>
        </div>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <Typography>Caregiver ID:</Typography>
          <Typography className='text-gray-400'>190860</Typography>
        </div>
      </div>

      {/* Assigned Caregivers */}
      <div className='border-t pt-4'>
        <Typography variant='h3' className='text-xl font-semibold text-gray-500 mb-2'>
          Assigned Clients ({clients.length})
        </Typography>
        <ul className=''>
          {clients.map((client, index) => (
            <li key={index} className='flex items-center justify-between mb-4 last:mb-0'>
              <div className='flex items-center space-x-3'>
                <img src={client.image} alt={client.name} className='w-10 h-10 rounded-full' />
                <div>
                  <Typography className='text-sm font-medium text-gray-400'>{client.name}</Typography>
                  <Typography className='text-sm text-green-600'>{client.service}</Typography>
                </div>
              </div>
              <img
                className='bg-[#666CFF] bg-opacity-20 border-4 rounded-full'
                src='/assets/svg-icons/openLink.svg'
                alt=''
              />
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

export default InfoCard

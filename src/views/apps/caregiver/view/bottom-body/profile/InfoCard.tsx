import React from 'react'

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
    <div className='max-w-md ml-0 mr-4 bg-white shadow-md rounded-lg p-6'>
      <div className='mb-4'>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <span>Role:</span>
          <span className='text-gray-400'>Caregiver, Office Admin</span>
        </div>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <span>Caregiver ID:</span>
          <span className='text-gray-400'>190860</span>
        </div>
      </div>

      {/* Assigned Caregivers */}
      <div className='border-t pt-4'>
        <h3 className='text-xl font-semibold text-gray-500 mb-2'>Assigned Clients ({clients.length})</h3>
        <ul className=''>
          {clients.map((client, index) => (
            <li key={index} className='flex items-center justify-between mb-4 last:mb-0'>
              <div className='flex items-center space-x-3'>
                <img src={client.image} alt={client.name} className='w-10 h-10 rounded-full' />
                <div>
                  <p className='text-sm font-medium text-gray-400'>{client.name}</p>
                  <p className='text-sm text-green-600'>{client.service}</p>
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
    </div>
  )
}

export default InfoCard

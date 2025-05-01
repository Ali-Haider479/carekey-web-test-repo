'use client'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Brightness1Icon from '@mui/icons-material/Brightness1'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
import { dark } from '@mui/material/styles/createPalette'
import Dropdown from '@/@core/components/mui/DropDown'
import { useState } from 'react'
import { start } from 'repl'

type DataTypeOld = {
  imgSrc: string
  title: string
  email: string
  role: string
}

const data: DataTypeOld[] = [
  {
    imgSrc: '/images/avatars/1.png',
    title: 'John Hale',
    email: 'john@example.com',
    role: 'caregiver'
  },
  {
    imgSrc: '/images/avatars/7.png',
    title: 'Roy Sparks',
    email: 'roy@example.com',
    role: 'client'
  },
  {
    imgSrc: '/images/avatars/20.png',
    title: 'Lizzie Payne',
    email: 'lizzie@example.com',
    role: 'caregiver'
  }
]

interface DataType {
  name: string;
  email: string | null;
}

interface PopularInstructorsProps {
  clientsWithoutServiceAuth: DataType[];
}

const PopularInstructors = ({ clientsWithoutServiceAuth }: PopularInstructorsProps) => {
  const [value, setValue] = useState<string>('')
  return (
    <Card>
      <CardContent className='flex flex-row justify-between items-center p-[25px]'>
        <Typography className='text-xl font-semibold'>Waiting for SA</Typography>
        <div className='flex flex-row justify-between mt-1'>
          <Typography className={`text-sm ${dark ? 'text-[#7112B7]' : 'text-[#4B0082]'} items-center`}>
            <Brightness1Icon
              sx={{ fontSize: '0.75rem' }}
              className={`mr-1 ${dark ? 'text-[#7112B7]' : 'text-[#4B0082]'}`}
            />{' '}
            Current
          </Typography>

          <Typography className='text-sm ml-8 items-center'>
            <Brightness1Icon sx={{ fontSize: '0.75rem' }} className='mr-1' /> Expiring soon
          </Typography>
        </div>
      </CardContent>
      <Divider />
      {/* <CardContent className='flex items-center justify-between gap-4 plb-4'>
        <Dropdown
          className={`${dark ? 'bg-[#7112B7]' : 'bg-[#4B0082]'} w-full rounded`}
          value={value}
          setValue={setValue}
          options={[
            {
              key: 1,
              value: 'today',
              displayValue: `TODAY'S`
            }
          ]}
          size='medium'
        />
      </CardContent> */}
      <CardContent className='flex flex-col gap-5 md:max-lg:gap-4 md:max-lg:plb-4'>
        {/* {data.map((item, index) => (
          <div key={`${item.title}`}>
            <div className='flex items-center gap-4'>
              <CustomAvatar src={item.imgSrc} alt={item.title} size={34} />
              <div className='flex items-center justify-between gap-4 is-full'>
                <div className='flex flex-col'>
                  <Typography variant='h6'>{item.title}</Typography>
                  <Typography variant='body2'>{item.email}</Typography>
                </div>
                <Typography>
                  {item.role === 'caregiver' ? (
                    <Brightness1Icon
                      sx={{ fontSize: '0.75rem' }}
                      className={`mr-1 ${dark ? 'text-[#7112B7]' : 'text-[#4B0082]'}`}
                    />
                  ) : (
                    <Brightness1Icon sx={{ fontSize: '0.75rem' }} className='mr-1' />
                  )}
                </Typography>
              </div>
            </div>
            {index !== data.length - 1 && <Divider className='mt-3' />}
          </div>
        ))} */}
        {clientsWithoutServiceAuth.length === 0 ? (
          <Typography>No clients waiting for service authorization</Typography>
        ) : (
          clientsWithoutServiceAuth.map((item, index) => (
            <div key={`${item.name}-${index}`}>
              <div className='flex items-center gap-4'>
                <CustomAvatar size={34}>
                  {item.name.charAt(0).toUpperCase()}
                </CustomAvatar>
                <div className='flex items-center justify-between gap-4 is-full'>
                  <div className='flex flex-col'>
                    <Typography variant='h6'>{item.name}</Typography>
                    <Typography variant='body2'>{item.email || 'N/A'}</Typography>
                  </div>
                  <Typography>
                    <Brightness1Icon sx={{ fontSize: '0.75rem' }} className='mr-1' />
                  </Typography>
                </div>
              </div>
              {index !== clientsWithoutServiceAuth.length - 1 && <Divider className='mt-3' />}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default PopularInstructors

import { Card, CardContent, CardMedia, Typography } from '@mui/material'
import React from 'react'
import type { ProfileHeaderType } from '@/types/pages/profileTypes'

const ProfileBanner = ({ props }: { props: ProfileHeaderType }) => {
  return (
    <Card className='mb-5'>
      <CardMedia image={props.coverImg} className='bs-[250px]' />
      <CardContent className='flex gap-6 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0  border-backgroundPaper bg-backgroundPaper'>
          <img height={120} width={120} src={props.profileImg} className='rounded' alt='Profile Background' />
        </div>
        <div className='flex is-full justify-start self-end flex-col items-center gap-6 sm-gap-0 sm:flex-row sm:justify-between sm:items-end '>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <div className='flex flex-row gap-4'>
              <div>
                <Typography variant='h4'>{props.fullName}</Typography>
              </div>
              <div className='py-2 px-4 bg-[#4B0082] rounded-4xl'>
                <Typography className='text-white'>{props.status}</Typography>
              </div>
            </div>
            <div className='flex flex-wrap gap-0 justify-center sm:justify-normal'>
              <div className='flex items-center gap-2'>
                <i className='bx-map' />
                <Typography className='font-medium'>{props.location}</Typography>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileBanner

'use client'
import { Card, CardContent, CardMedia, Typography } from '@mui/material'
import React from 'react'
import type { ProfileHeaderType } from '@/types/pages/profileTypes'
import CustomAvatar from '@/@core/components/mui/Avatar'

const ProfileBanner = ({ props }: { props: ProfileHeaderType }) => {
  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ').filter(Boolean) // Split and remove extra spaces

    if (names.length === 1) {
      return names[0][0].toUpperCase() // Only one name, return its initial
    }

    if (names.length >= 2) {
      return `${names[0][0].toUpperCase()}${names[names.length - 1][0].toUpperCase()}` // First and last name initials
    }

    return '' // Return empty string if no valid names
  }

  const handleImageChange = async (file: File) => {
    // try {
    //   setLoading(true)
    //   const formData = new FormData()
    //   formData.append('image', file)
    //   const response = await axios.post(
    //     `${process.env.NEXT_PUBLIC_API_URL}/user/${tenantData?.users[0]?.id}/profile-image`,
    //     formData,
    //     {
    //       headers: {
    //         'Content-Type': 'multipart/form-data'
    //       }
    //     }
    //   )
    //   console.log('UPDATE RESPONSE', response.data)
    //   // Update the fileUrl state with the new image URL after successful upload
    //   if (response.data?.profileImageUrl) {
    //     setFileUrl(response.data.profileImageUrl)
    //   }
    //   setLoading(false)
    // } catch (error) {
    //   console.error('Update image error:', error)
    //   setLoading(false)
    // }
    console.log('Button is pressed')
  }
  return (
    <Card className='mb-5'>
      <CardMedia image={props.coverImg} className='bs-[250px]' />
      <CardContent className='flex gap-6 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex items-center justify-center rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-b-0 border-backgroundPaper bg-backgroundPaper'>
          {/* <CustomAvatar
            alt='user-profile'
            src={props.profileImg ? props?.profileImg : getInitials(props.fullName)}
            variant='rounded'
            size={120}
            onImageChange={handleImageChange}
          /> */}
          {props?.profileImg ? (
            // <img height={120} width={120} src={props.profileImg} className='rounded' alt='Profile Img' />
            <CustomAvatar
              alt='user-profile'
              src={props.profileImg}
              variant='rounded'
              size={120}
              onImageChange={handleImageChange}
            />
          ) : (
            <div className='flex items-center justify-center w-[120px] h-[120px] rounded bg-gray-400 text-5xl font-bold text-white'>
              {getInitials(props.fullName)}
            </div>
          )}
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
                {props?.location !== '' && (
                  <>
                    <i className='bx-map' />
                    <Typography className='font-medium'>{props.location}</Typography>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileBanner

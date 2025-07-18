'use client'
import React, { useEffect, useState } from 'react'
import { Box, Card, CardContent, CardMedia, styled, Typography } from '@mui/material'
import type { ProfileHeaderType } from '@/types/pages/profileTypes'
import { useParams } from 'next/navigation'
import ProfileAvatar from '@/@core/components/mui/ProfileAvatar'
import api from '@/utils/api'

const UploadOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '50%',
  opacity: 0,
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.shorter
  }),
  cursor: 'pointer'
}))

const ProfileBanner = ({ props }: { props: ProfileHeaderType }) => {
  const { id } = useParams()
  const [fileUrl, setFileUrl] = useState<string | undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  useEffect(() => {
    if (props?.profileImg) {
      getProfileImage(props?.profileImg)
    }
  }, [props?.profileImg])

  console.log('PROFILE IMAGE URL', props?.profileImg)

  const getProfileImage = async (key: string) => {
    setLoading(true)
    try {
      const res = await api.get(`/${props.isClient ? 'client' : 'caregivers'}/getProfileUrl/${key}`)
      setFileUrl(res.data)
    } catch (err) {
      throw Error(`Error in fetching profile image url, ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = async (file: File) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await api.post(
        `/${props.isClient ? 'client' : 'user'}/${props.isClient ? id : props.userId}/profile-image`, // Only the path, since baseURL is already set
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data' // Override the default Content-Type
          }
        }
      )
      console.log('UPDATE RESPONSE', response.data)
      // Update the fileUrl state with the new image URL after successful upload
      if (response.data?.profileImageUrl) {
        setFileUrl(response.data.profileImageUrl)
      }
      const payLoad = {
        actionType: props.isClient ? 'ClientProfileImageUpdate' : 'CaregiverProfileImageUpdate',
        details: `Profile image updated by User (ID: ${authUser?.id}) for ${props.isClient ? `Client (ID: ${id})` : `Caregiver (ID: ${id})`}`,
        userId: authUser?.id,
        caregiverId: props.isClient ? null : id,
        clientId: props.isClient ? id : null
      }
      console.log('ONE PROFILE PAYLOAD', payLoad)
      await api.post(`/account-history/log`, payLoad)
    } catch (error) {
      console.error('Update image error:', error)
    } finally {
      setLoading(false)
    }
    console.log('Button is pressed')
  }
  return (
    <Card className='mb-5'>
      <CardMedia image={props.coverImg} className='bs-[100px]' />
      <CardContent className='flex gap-6 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex items-center justify-center rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-b-0 border-backgroundPaper bg-backgroundPaper'>
          <ProfileAvatar
            alt={props.fullName}
            src={fileUrl}
            variant='rounded'
            size={120}
            onImageChange={handleImageChange}
            allowupdate={'true'}
            loading={loading}
          />
        </div>

        <div className='flex is-full justify-start self-end flex-col items-center gap-6 sm-gap-0 sm:flex-row sm:justify-between sm:items-end '>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <div className='flex flex-row gap-3'>
              <Typography variant='h4'>{props.fullName}</Typography>
              <Box
                component={'div'}
                className={`py-2 px-4 rounded-4xl`}
                sx={theme => ({
                  backgroundColor: `${props.status === 'CAREGIVER' ? (theme.palette.mode === 'light' ? '#02c3eb' : '#02c3eb9F') : theme.palette.mode === 'light' ? 'primary.main' : 'primary.dark'}`
                })}
              >
                <Typography className='text-white font-bold'>{props.status}</Typography>
              </Box>
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

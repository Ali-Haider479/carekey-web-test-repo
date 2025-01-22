'use client'
// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import type { ButtonProps } from '@mui/material/Button'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import EditUserInfo from '@components/dialogs/edit-user-info'
import EditTenantInfo from '@/components/dialogs/edit-tenant-info'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import CustomAvatar from '@core/components/mui/Avatar'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { CircularProgress } from '@mui/material'

const TenantDetails = () => {
  const { id } = useParams()
  const [tenantData, setTenantData] = useState<any>([])
  const [fileUrl, setFileUrl] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  // Vars
  const buttonProps = (
    children: string,
    color: ThemeColor,
    variant: ButtonProps['variant'],
    overRideColor?: string
  ): ButtonProps => ({
    children,
    color,
    variant,
    sx: { backgroundColor: overRideColor }
  })

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tenant/${id}`)
        const data = response.data

        // Update both states at once
        setTenantData(data)
        if (data?.users?.[3]?.profileImageUrl) {
          const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.amazonaws.com/${data.users[3].profileImageUrl}`
          setFileUrl(imageUrl)
        }
      } catch (error) {
        console.error('Error fetching tenant data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenantData()
  }, [id])

  const handleImageChange = async (file: File) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', file)

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${tenantData?.users[0]?.id}/profile-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      console.log('UPDATE RESPONSE', response.data)
      // Update the fileUrl state with the new image URL after successful upload
      if (response.data?.profileImageUrl) {
        setFileUrl(response.data.profileImageUrl)
      }
      setLoading(false)
    } catch (error) {
      console.error('Update image error:', error)
      setLoading(false)
    }
  }

  console.log('FILE KA URL', fileUrl)

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center min-h-[200px]'>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className='flex flex-col pbs-12 gap-6'>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-center flex-col gap-4'>
              <div className='flex flex-col items-center gap-4'>
                <CustomAvatar
                  alt='user-profile'
                  src={fileUrl || '/images/avatars/1.png'}
                  variant='rounded'
                  size={120}
                  onImageChange={handleImageChange}
                />
                <Typography variant='h5'>{tenantData.users && tenantData?.users[0]?.userName}</Typography>
              </div>
              <Chip label='Admin' color='error' size='small' variant='tonal' />
            </div>
            <div className='flex items-center justify-around flex-wrap gap-4'>
              <div className='flex items-center gap-4'>
                <CustomAvatar variant='rounded' color='primary' skin='light' sx={{ color: '#4B0082' }}>
                  <i className='bx-check' />
                </CustomAvatar>
                <div>
                  <Typography variant='h5'>1.23k</Typography>
                  <Typography>Task Done</Typography>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <CustomAvatar variant='rounded' color='primary' skin='light' sx={{ color: '#4B0082' }}>
                  <i className='bx-customize' />
                </CustomAvatar>
                <div>
                  <Typography variant='h5'>568</Typography>
                  <Typography>Project Done</Typography>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Typography variant='h5'>Details</Typography>
            <Divider className='mlb-4' />
            <div className='flex flex-col gap-2'>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>Tenant Name:</Typography>
                <Typography>{tenantData.companyName}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>Billing Email:</Typography>
                <Typography>{tenantData.billingEmail}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>Status</Typography>
                <Typography color='text.primary'>{tenantData.status}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>Tax ID:</Typography>
                <Typography color='text.primary'>{tenantData.taxonomyNumber}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>Contact:</Typography>
                <Typography color='text.primary'>{tenantData.contactNumber}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>FAX:</Typography>
                <Typography color='text.primary'>{tenantData.faxNumber}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>Address:</Typography>
                <Typography color='text.primary'>{tenantData.address}</Typography>
              </div>
            </div>
          </div>
          <div className='flex gap-4 justify-center'>
            <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps('Edit', 'secondary', 'contained', '#4B0082')}
              dialog={EditTenantInfo}
              dialogProps={{ data: tenantData }}
            />
            <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps('Suspend', 'error', 'tonal')}
              dialog={ConfirmationDialog}
              dialogProps={{ type: 'suspend-account' }}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default TenantDetails

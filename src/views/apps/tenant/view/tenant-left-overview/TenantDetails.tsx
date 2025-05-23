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
import EditTenantInfo from '@/components/dialogs/edit-tenant-info'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import CustomAvatar from '@core/components/mui/Avatar'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { CircularProgress } from '@mui/material'
import ProfileAvatar from '@/@core/components/mui/ProfileAvatar'
import CustomAlert from '@/@core/components/mui/Alter'
import api from '@/utils/api'
import { set } from 'date-fns'

const TenantDetails = ({ tenantData }: any) => {
  const { id } = useParams()
  const [adminUserName, setAdminUserName] = useState<string>('')
  const [fileUrl, setFileUrl] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const [localTenantData, setLocalTenantData] = useState<any>(tenantData)
  const [editCompleted, setEditCompleted] = useState<boolean>(false)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const token = authUser?.backendAccessToken
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState({ message: '', severity: 'info' })
  const router = useRouter()

  console.log('Tenant Data', tenantData)

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

  const updateImageUrl = (profileImageUrl: string) => {
    if (profileImageUrl) {
      const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_PROFILE_BUCKET}.s3.amazonaws.com/${profileImageUrl}`
      setFileUrl(imageUrl)
    }
  }

  console.log('IMG URL', fileUrl)

  // Fetch tenant data
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true)
        console.log('TENANT ID', 1)
        const response = await api.get(`/tenant/${id}`)
        console.log('RESPONSE ONE-----', response)
        const data = response.data
        console.log('DATATATATATAT', data)
        // setTenantData(data)
        setLocalTenantData(data)

        const admin = data?.users?.find((user: any) => user.role.title === 'Tenant Admin')
        console.log('ADMIN', admin)

        if (admin?.userName) {
          setAdminUserName(admin.userName)
        }

        console.log('TENANT ADMIN IMG URL: ', admin?.profileImageUrl)
        // Update image URL if available
        if (admin?.profileImageUrl) {
          updateImageUrl(admin.profileImageUrl) // Assuming updateImageUrl is defined elsewhere
        }
      } catch (error: any) {
        console.error('Error fetching tenant data:', error)

        // RLS return us 404 instead of 403 Forbidden error
        if (error.response?.status === 403) {
          setAlertOpen(true)
          setAlertProps({
            message: 'You do not have access to this tenant.',
            severity: 'warning'
          })
          // Redirect to homepage after a delay (e.g., 3 seconds)
          // setTimeout(() => {
          router.push('/')
          // }, 3000)
        } else {
          // Handle other errors
          setAlertOpen(true)
          setAlertProps({
            message: 'An error occurred while fetching tenant data.',
            severity: 'error'
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTenantData()
  }, [id, token, router, refreshTrigger]) // Add router to dependencies

  const handleEditSuccess = async (updatedData: any) => {
    // try {
    //   const response = await api.get(`/tenant/${id}`)
    //   setLocalTenantData(response.data)
    // } catch (error) {
    //   console.error('Error updating tenant data:', error)
    // }
    setLocalTenantData((prev: any) => ({ ...prev, ...updatedData }))
    setEditCompleted(true)
  }

  useEffect(() => {
    if (editCompleted) {
      setEditCompleted(false) // Reset the flag after updating
    }
  }, [editCompleted])

  const handleImageChange = async (file: File) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', file)

      console.log('Before finding admin')

      const admin = tenantData?.users?.find((user: any) => user.role.title === 'Tenant Admin')

      console.log('Tenant Admin', admin)

      const response = await api.post(`/user/${admin.id}/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data?.profileImageUrl) {
        // Update the image URL immediately
        updateImageUrl(response.data.profileImageUrl)

        console.log('Image data updated successfully')

        // Trigger a refresh of tenant data
        setRefreshTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.error('Update image error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center min-h-[200px]'>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }
  console.log('Tenant Data', tenantData)

  return (
    <>
      <CustomAlert
        AlertProps={alertProps}
        openAlert={alertOpen}
        setOpenAlert={setAlertOpen}
        style={{
          padding: 0 // Only these styles will be applied
        }}
      />
      <Card>
        <CardContent className='flex flex-col pbs-12 gap-6'>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-center flex-col gap-4'>
              <div className='flex flex-col items-center gap-4'>
                <ProfileAvatar
                  alt={adminUserName}
                  src={fileUrl}
                  variant='rounded'
                  size={120}
                  onImageChange={handleImageChange}
                  allowupdate={'true'}
                />
                <Typography variant='h5'>{adminUserName}</Typography>
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
                <Typography>{localTenantData.companyName}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>Billing Email:</Typography>
                <Typography>{localTenantData.billingEmail}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>Status</Typography>
                <Typography color='text.primary'>{localTenantData.status}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>Tax ID:</Typography>
                <Typography color='text.primary'>{localTenantData.taxonomyNumber}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>Contact:</Typography>
                <Typography color='text.primary'>{localTenantData.contactNumber}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>FAX:</Typography>
                <Typography color='text.primary'>{localTenantData.faxNumber}</Typography>
              </div>
              <div className='flex items-center flex-wrap gap-x-1.5'>
                <Typography variant='h6'>Address:</Typography>
                <Typography color='text.primary'>{localTenantData.address}</Typography>
              </div>
            </div>
          </div>
          <div className='flex gap-4 justify-center'>
            <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps('Edit', 'secondary', 'contained', '#4B0082')}
              dialog={EditTenantInfo}
              dialogProps={{ data: localTenantData, onSuccess: handleEditSuccess }}
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

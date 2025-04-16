'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import axios from 'axios'
import { useParams } from 'next/navigation'
import api from '@/utils/api'

const ChangePassword = () => {
  // States
  // RLS DUMMY ID
  const { id } = useParams()
  const [isCurrentPasswordShown, setIsCurrentPasswordShown] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tenantData, setTenantData] = useState()
  const [adminId, setAdminId] = useState()
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const token = authUser?.backendAccessToken

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: string) => (event: any) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    })
    // Clear messages when user starts typing
    setError('')
    setSuccess('')
  }

  const validateForm = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required')
      return false
    }

    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long')
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return false
    }

    // Check for uppercase & symbol
    const hasUpperCase = /[A-Z]/.test(formData.newPassword)
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)

    // if (!hasUpperCase || !hasSymbol) {
    //   setError('Password must contain at least one uppercase letter and one symbol')
    //   return false
    // }

    return true
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payLoad = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }
      const response = await api.patch(`/user/${adminId}/password`, payLoad)

      setSuccess('Password updated successfully')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err: any) {
      setError(err.response.data.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true)
        if (token) {
          const response = await api.get(`/tenant/${id}`)
          const data = response.data
          console.log('DATATATATATAT in change password', data)
          setTenantData(data)
          const admin = data?.users?.find((user: any) => user.role.title === 'Tenant Admin')
          console.log('ADMIN in change password', admin)
          console.log('Admin Id in change password', admin.id)
          setAdminId(admin.id)
        }
      } catch (error) {
        console.error('Error fetching tenant data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenantData()
  }, [id])

  console.log('tenant data in change password', tenantData)

  console.log('admin id in state', adminId)

  return (
    <Card>
      <CardHeader title='Change Password' />
      <CardContent className='flex flex-col gap-4'>
        <Alert icon={false} severity='warning' onClose={() => {}}>
          <AlertTitle>Ensure that these requirements are met</AlertTitle>
          Minimum 8 characters long, uppercase & symbol
        </Alert>

        {error && (
          <Alert severity='error' onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity='success' onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Current Password'
                type={isCurrentPasswordShown ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleInputChange('currentPassword')}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => setIsCurrentPasswordShown(!isCurrentPasswordShown)}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isCurrentPasswordShown ? 'bx-hide' : 'bx-show'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='New Password'
                type={isPasswordShown ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange('newPassword')}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => setIsPasswordShown(!isPasswordShown)}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isPasswordShown ? 'bx-hide' : 'bx-show'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Confirm New Password'
                type={isConfirmPasswordShown ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isConfirmPasswordShown ? 'bx-hide' : 'bx-show'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }} className='flex gap-4'>
              <Button variant='contained' type='submit' disabled={loading} sx={{ backgroundColor: '#4B0082' }}>
                {loading ? <CircularProgress size={24} /> : 'Change Password'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePassword

'use client'

import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'
import axios from 'axios'
import api from '@/utils/api'

type EditUserInfoData = {
  companyName?: string
  billingEmail?: string
  status?: string
  contactNumber?: string
  faxNumber?: string
  address?: string
  taxonomyNumber?: string
  id?: number
}

type EditUserInfoProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: EditUserInfoData
  onSuccess?: (payload: any) => void
}

const status = ['Active', 'Canceled', 'Suspended']

const EditTenantInfo = ({ open, setOpen, data, onSuccess }: EditUserInfoProps) => {
  const [userData, setUserData] = useState<EditUserInfoData>(data || {})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (data) {
      setUserData(data)
    }
  }, [data])

  const getInitialData = () => {
    const data = localStorage.getItem('view-tenant')
    return data ? JSON.parse(data) : {}
  }

  const handleClose = () => {
    setOpen(false)
    setUserData(userData || {})
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        companyName: userData.companyName,
        billingEmail: userData.billingEmail,
        status: userData.status,
        contactNumber: userData.contactNumber,
        faxNumber: userData.faxNumber,
        address: userData.address,
        taxonomyNumber: userData.taxonomyNumber
      }
      const response = await api.patch(`/tenant/${data?.id}`, payload)

      // if (!response.ok) {
      //   const errorData = await response.json()
      //   throw new Error(errorData.message || 'Failed to update tenant')
      // }

      setSuccess('Tenant information updated successfully')
      onSuccess?.(response.data)

      setUserData(response.data)

      const tenantData = getInitialData()

      localStorage.setItem(
        'view-tenant',
        JSON.stringify({
          ...tenantData,
          companyName: userData.companyName,
          billingEmail: userData.billingEmail,
          status: userData.status,
          contactNumber: userData.contactNumber,
          faxNumber: userData.faxNumber,
          address: userData.address,
          taxonomyNumber: userData.taxonomyNumber
        })
      )

      // Close dialog after short delay
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating tenant')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    return (
      userData.companyName && userData.billingEmail && userData.status && userData.contactNumber && userData.address
    )
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='body'
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='bx-x' />
      </DialogCloseButton>
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Edit Tenant Information
        <Typography component='span' className='flex flex-col text-center'>
          Updating tenant details will receive a privacy audit.
        </Typography>
      </DialogTitle>

      {error && (
        <Alert severity='error' className='mbe-4 mli-6 mri-6' onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity='success' className='mbe-4 mli-6 mri-6' onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                required
                label='Company Name'
                placeholder='TechCorp'
                value={userData?.companyName}
                onChange={e => setUserData({ ...userData, companyName: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                required
                label='Billing Email'
                placeholder='johnDoe@email.com'
                value={userData?.billingEmail}
                onChange={e => setUserData({ ...userData, billingEmail: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
                required
                label='Status'
                value={userData?.status}
                onChange={e => setUserData({ ...userData, status: e.target.value })}
              >
                {status.map(status => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Tax ID'
                placeholder='Tax-7490'
                value={userData?.taxonomyNumber}
                onChange={e => setUserData({ ...userData, taxonomyNumber: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                required
                label='Contact Number'
                placeholder='+ 123 456 7890'
                value={userData?.contactNumber}
                onChange={e => setUserData({ ...userData, contactNumber: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                required
                label='Address'
                placeholder='123 Business Street'
                value={userData?.address}
                onChange={e => setUserData({ ...userData, address: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Fax'
                placeholder='+ 123 456 7890'
                value={userData?.faxNumber}
                onChange={e => setUserData({ ...userData, faxNumber: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' type='submit' disabled={loading || !validateForm()}>
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
          <Button variant='tonal' color='secondary' onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditTenantInfo

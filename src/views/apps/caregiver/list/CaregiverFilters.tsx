'use client'
// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { CaregiverTypes } from '@/types/apps/caregiverTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import Card from '@mui/material/Card'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Button, Typography } from '@mui/material'
import { USStates } from '@/utils/constants'
import api from '@/utils/api'

interface DefaultStateType {
  accountStatus: string
  caregiverUmpi: string
  state: string
}

const defaultState: DefaultStateType = {
  accountStatus: '',
  caregiverUmpi: '',
  state: ''
}

interface CaregiverFiltersProps {
  onFilterApplied: (data: any) => void
}

const CaregiverFilters = ({
  setData,
  tableData,
  onFilterApplied
}: {
  setData: (data: CaregiverTypes[]) => void
  tableData?: CaregiverTypes[]
  onFilterApplied: (data: any) => void
}) => {
  // States
  const [item, setItem] = useState<CaregiverTypes['item']>('')
  const [accountStatus, setAccountStatus] = useState<DefaultStateType>(defaultState)
  const [caregiverUmpi, setCaregiverUmpi] = useState<DefaultStateType>(defaultState)
  const [caregiverState, setCaregiverState] = useState<DefaultStateType>(defaultState)

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  console.log('Auth User', authUser)

  // Hooks
  const {
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const onSubmit = async () => {
    try {
      const queryParams = new URLSearchParams()

      // Add accountStatus filter if provided
      if (accountStatus.accountStatus) {
        queryParams.append('accountStatus', accountStatus.accountStatus)
      }

      // Add caregiverUMPI filter if provided
      if (caregiverUmpi.caregiverUmpi) {
        queryParams.append('caregiverUMPI', caregiverUmpi.caregiverUmpi)
      }

      // Add state filter if provided
      if (caregiverState.state) {
        queryParams.append('state', caregiverState.state)
      }
      queryParams.append('page', '1')
      queryParams.append('limit', '10')

      // If no filters are applied, fetch all data
      if (queryParams.toString() === 'page=1&limit=10') {
        const response = await api.get(`/caregivers/${authUser?.tenant?.id}/tenant`)
        onFilterApplied(response.data)
        return
      }
      // Fetch filtered data
      const filterResponse = await api.get(`/caregivers/filtered/?${queryParams.toString()}`)
      onFilterApplied(filterResponse.data.data)
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  const handleReset = async () => {
    try {
      // Reset all filter states to default empty values
      setAccountStatus(defaultState)
      setCaregiverUmpi(defaultState)
      setCaregiverState(defaultState)
      setItem('')

      // Fetch all data without filters
      const response = await api.get(`/caregivers/${authUser?.tenant?.id}/tenant`)
      onFilterApplied(response.data)
    } catch (error) {
      console.error('Error resetting filters:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0, padding: 5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <span className='text-[20px]'>
            <strong>Filters</strong>
          </span>
        </Grid>
        <Grid container spacing={6} marginTop={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant='h6' className='mb-2'>
              Account Status
            </Typography>
            <CustomTextField
              select
              fullWidth
              placeholder='Account Status'
              id='select-status'
              value={accountStatus.accountStatus}
              onChange={e => setAccountStatus({ ...accountStatus, accountStatus: e.target.value })}
              slotProps={{
                select: { displayEmpty: true }
              }}
            >
              <MenuItem value='Active'>Active</MenuItem>
              <MenuItem value='Inactive'>Inactive</MenuItem>
            </CustomTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant='h6' className='mb-2'>
              Caregiver UMPI
            </Typography>
            <CustomTextField
              fullWidth
              id='caregiver-Umpi'
              placeholder='Caregiver Umpi'
              value={caregiverUmpi.caregiverUmpi}
              onChange={e => setCaregiverUmpi({ ...caregiverUmpi, caregiverUmpi: e.target.value })}
              slotProps={{
                select: { displayEmpty: true }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant='h6' className='mb-2'>
              State
            </Typography>
            <CustomTextField
              select
              fullWidth
              id='caregiver-state'
              placeholder='Caregiver State'
              value={caregiverState.state}
              onChange={e => setCaregiverState({ ...caregiverState, state: e.target.value })}
              slotProps={{
                select: { displayEmpty: true }
              }}
            >
              {USStates.map((state: any) => (
                <MenuItem key={state.key} value={state.value}>
                  {state.optionString}
                </MenuItem>
              ))}
            </CustomTextField>
          </Grid>
          <Grid container spacing={12}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button type='submit' variant='outlined' className='p-1'>
                Apply
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button onClick={handleReset} color='error' variant='outlined' className='p-1'>
                Reset
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </form>
  )
}

export default CaregiverFilters

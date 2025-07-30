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
import Card from '@mui/material/Card'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Button, TextField, Typography } from '@mui/material'
import { USStates } from '@/utils/constants'
import api from '@/utils/api'
import { useTheme } from '@emotion/react'

interface DefaultStateType {
  accountStatus: string
  caregiverUmpi: string
  primaryPhoneNumber: string
  caregiverName: string
  state: string
}

const defaultState: DefaultStateType = {
  accountStatus: 'Active',
  caregiverUmpi: '',
  state: '',
  primaryPhoneNumber: '',
  caregiverName: ''
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
  const [filters, setFilters] = useState<DefaultStateType>(defaultState)

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const theme: any = useTheme()

  const lightTheme = theme.palette.mode === 'light'
  const darkTheme = theme.palette.mode === 'dark'

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
      if (filters.accountStatus && filters.accountStatus !== 'All') {
        queryParams.append('accountStatus', filters.accountStatus)
      }

      // Add caregiverUMPI filter if provided
      if (filters.caregiverUmpi) {
        queryParams.append('caregiverUMPI', filters.caregiverUmpi)
      }

      if (filters.primaryPhoneNumber) {
        queryParams.append('primaryPhoneNumber', filters.primaryPhoneNumber)
      }

      if (filters.caregiverName) {
        queryParams.append('caregiverName', filters.caregiverName)
      }

      if (
        filters.accountStatus === 'All' &&
        !filters.caregiverName &&
        !filters.caregiverUmpi &&
        !filters.primaryPhoneNumber
      ) {
        const response = await api.get(`/caregivers/${authUser?.tenant?.id}/tenant`)
        onFilterApplied(response.data)
        return
      }

      queryParams.append('page', '1')
      queryParams.append('limit', '10')

      // If no filters are applied, fetch all data
      if (queryParams.toString() === 'page=1&limit=10') {
        const response = await api.get(`/caregivers/active`)
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
      setFilters(defaultState)
      setItem('')

      // Fetch all data without filters
      const response = await api.get(`/caregivers/active`)
      onFilterApplied(response.data)
    } catch (error) {
      console.error('Error resetting filters:', error)
    }
  }

  console.log('Filtering with params: ', filters)

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0, padding: 5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <span className='text-[20px]'>
            <strong>Filters</strong>
          </span>
        </Grid>
        <Grid container spacing={6} marginTop={4}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant='h6' className='mb-2'>
              Caregiver Name
            </Typography>
            <TextField
              fullWidth
              size='small'
              id='caregiver-name'
              placeholder='Caregiver Name'
              value={filters.caregiverName}
              onChange={e => setFilters({ ...filters, caregiverName: e.target.value })}
              // slotProps={{
              //   select: { displayEmpty: true }
              // }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant='h6' className='mb-2'>
              Account Status
            </Typography>
            <TextField
              select
              size='small'
              fullWidth
              placeholder='Account Status'
              id='select-status'
              value={filters.accountStatus}
              onChange={e => setFilters({ ...filters, accountStatus: e.target.value })}
              slotProps={{
                select: { displayEmpty: true }
              }}
            >
              <MenuItem value='All' className=''>
                All
              </MenuItem>
              <MenuItem value='Active' className=''>
                Active
              </MenuItem>
              <MenuItem value='Inactive' className=''>
                Inactive
              </MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant='h6' className='mb-2'>
              Caregiver UMPI
            </Typography>
            <TextField
              fullWidth
              size='small'
              id='caregiver-Umpi'
              placeholder='Caregiver UMPI'
              value={filters.caregiverUmpi}
              onChange={e => setFilters({ ...filters, caregiverUmpi: e.target.value })}
              slotProps={{
                select: { displayEmpty: true }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant='h6' className='mb-2'>
              Caregiver Phone Number
            </Typography>
            <TextField
              fullWidth
              size='small'
              id='primary-phone-number'
              placeholder='Caregiver Phone Number'
              value={filters.primaryPhoneNumber}
              onChange={e => setFilters({ ...filters, primaryPhoneNumber: e.target.value })}
              slotProps={{
                select: { displayEmpty: true }
              }}
            />
          </Grid>
          {/* <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant='h6' className='mb-2'>
              State
            </Typography>
            <TextField
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
            </TextField>
          </Grid> */}
          <Grid container spacing={12}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button type='submit' variant='contained' className={`p-1`}>
                Apply
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button onClick={handleReset} variant='contained' color='error' className={`p-1`}>
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

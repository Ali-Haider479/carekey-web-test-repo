import React, { useState } from 'react'
import { Card, CardHeader, CardContent, MenuItem, Button, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import api from '@/utils/api'

interface DefaultStateType {
  caregiverName: string
  status: string
}

const defaultState: DefaultStateType = {
  caregiverName: '',
  status: ''
}

interface EVVFiltersProps {
  onFilterApplied: (data: any) => void
}

// const EvvFilters = ({ onFilterApplied }: SignatureStatusFiltersProps) => {
const EvvFilters = ({ onFilterApplied }: EVVFiltersProps) => {
  const [filterData, setFilterData] = useState<DefaultStateType>(defaultState)

  // Hooks
  const {
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const onSubmit = async () => {
    try {
      // Only add parameters that have values
      const queryParams = new URLSearchParams()
      if (filterData.caregiverName) queryParams.append('caregiverName', filterData.caregiverName)
      if (filterData.status) queryParams.append('caregiverStatus', filterData.status)
      // if (filterData.tsApprovalStatus) queryParams.append('tsApprovalStatus', filterData.tsApprovalStatus)
      queryParams.append('screenType', 'completed')
      queryParams.append('page', '1')
      queryParams.append('limit', '10')
      // If no filters are applied, fetch all data
      if (queryParams.toString() === 'page=1&limit=10') {
        const response = await api.get(`/time-log/completed-timelogs`)
        onFilterApplied(response.data)
        return
      }
      // Fetch filtered data
      const filterResponse = await api.get(`/time-log/filtered/?${queryParams.toString()}`)
      onFilterApplied(filterResponse.data.data)
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  const handleReset = async () => {
    setFilterData(defaultState)
    const response = await api.get(`/time-log/completed-timelogs`)
    onFilterApplied(response.data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Grid container spacing={4}>
        {/* Search Caregiver Name */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ pb: 2 }}>
          <TextField
            value={filterData?.caregiverName}
            onChange={e => setFilterData({ ...filterData, caregiverName: e.target.value })}
            fullWidth
            placeholder='Caregiver Name'
            label='Caregiver Name'
            size='small'
            // className='mbe-6'
            id='event-title'
            {...(errors.title && { error: true, helperText: 'This field is required' })}
          />
        </Grid>

        {/* Billing Period Dropdown */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ pb: 2 }}>
          <TextField
            select
            fullWidth
            // className='mbe-6'
            placeholder='Status'
            label='Status'
            size='small'
            value={filterData.status}
            id='event-calendar'
            onChange={e => setFilterData({ ...filterData, status: e.target.value })}
          >
            <MenuItem value='Active'>Active</MenuItem>
            <MenuItem value='Inactive'>Inactive</MenuItem>
          </TextField>
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
    </form>
  )
}

export default EvvFilters

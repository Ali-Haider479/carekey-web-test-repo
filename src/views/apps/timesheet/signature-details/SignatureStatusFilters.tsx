import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, MenuItem, Button, TextField } from '@mui/material'

import Grid from '@mui/material/Grid2'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import SearchIcon from '@mui/icons-material/Search'
import api from '@/utils/api'

interface DefaultStateType {
  clientName: string
  caregiverName: string
  tsApprovalStatus: string
  timesheetApprovalStatus: string
  week: string
}

const defaultState: DefaultStateType = {
  clientName: '',
  caregiverName: '',
  tsApprovalStatus: '',
  timesheetApprovalStatus: '',
  week: ''
}

interface SignatureStatusFiltersProps {
  onFilterApplied: (data: any) => void
}

const SignatureStatusFilters = ({ onFilterApplied }: SignatureStatusFiltersProps) => {
  const [filterData, setFilterData] = useState<DefaultStateType>(defaultState)
  const [payPeriod, setPayPeriod] = useState<any[]>([])

  // Hooks
  const {
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const onSubmit = async () => {
    try {
      // Only add parameters that have values
      const queryParams = new URLSearchParams()

      if (filterData.clientName) queryParams.append('clientName', filterData.clientName)
      if (filterData.caregiverName) queryParams.append('caregiverName', filterData.caregiverName)
      if (filterData.tsApprovalStatus) queryParams.append('tsApprovalStatus', filterData.tsApprovalStatus)
      queryParams.append('page', '1')
      queryParams.append('limit', '10')

      // If no filters are applied, fetch all data
      if (queryParams.toString() === 'page=1&limit=10') {
        const response = await api.get(`/time-log`)
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

  const fetchPayPeriod = async () => {
    try {
      const response = await api.get(`/pay-period/end-date/tenant/1`)
      setPayPeriod(response.data)
    } catch (error) {
      console.error('Error fetching pay period data: ', error)
    }
  }

  useEffect(() => {
    fetchPayPeriod()
  }, [])

  const handleReset = async () => {
    try {
      setFilterData(defaultState)
      const response = await api.get(`/time-log`)
      onFilterApplied(response.data)
    } catch (error) {
      console.error('error resetting filters: ', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Card className='w-full mb-5' sx={{ p: 2, borderRadius: 1, boxShadow: 2 }}>
        {/* Card Header */}
        <CardHeader title='Filters' titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 500 } }} />

        {/* Card Content */}
        <CardContent>
          <Grid container spacing={4}>
            {/* Search Client Name */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ pb: 2 }}>
              <TextField
                value={filterData?.clientName}
                onChange={e => setFilterData({ ...filterData, clientName: e.target.value })}
                fullWidth
                placeholder='Client Name'
                label='Client Name'
                size='small'
                id='event-title'
                {...(errors.title && { error: true, helperText: 'This field is required' })}
              />
            </Grid>

            {/* Search Caregiver Name */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ pb: 2 }}>
              <TextField
                value={filterData?.caregiverName}
                onChange={e => setFilterData({ ...filterData, caregiverName: e.target.value })}
                fullWidth
                placeholder='Caregiver Name'
                label='Caregiver Name'
                size='small'
                id='event-title'
                {...(errors.title && { error: true, helperText: 'This field is required' })}
              />
            </Grid>
            {/* Week Dropdown */}
            {/* <Grid size={{ xs: 12, md: 4 }} sx={{ pb: 2 }}>
              <TextField
                select
                fullWidth
                // className='mbe-6'
                placeholder='Week'
                value={filterData.week}
                id='event-calendar'
                onChange={e => setFilterData({ ...filterData, week: e.target.value })}
              >
                <MenuItem value='Week 1'>Week 1</MenuItem>
                <MenuItem value='Week 2'>Week 2</MenuItem>
              </TextField>
            </Grid> */}
            {/*Signature status*/}
            <Grid size={{ xs: 12, md: 4 }} sx={{ pb: 2 }}>
              <TextField
                select
                fullWidth
                // className='mbe-6'
                placeholder='Week'
                label='Week'
                size='small'
                value={filterData.week}
                id='event-calendar'
                onChange={e => setFilterData({ ...filterData, week: e.target.value })}
              >
                {payPeriod.map((item: any) => (
                  <MenuItem value={item.id} key={item.id}>
                    {item.startDate} - {item.endDate === null ? 'ongoing' : item.endDate}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/*Timesheet status*/}
            <Grid size={{ xs: 12, md: 4 }} sx={{ pb: 2 }}>
              <TextField
                select
                fullWidth
                // className='mbe-6'
                placeholder='Timesheet Approved'
                label='Timesheet Approved'
                size='small'
                value={filterData.tsApprovalStatus}
                id='event-calendar'
                onChange={e => setFilterData({ ...filterData, tsApprovalStatus: e.target.value })}
              >
                <MenuItem value='Pending'>Pending</MenuItem>
                <MenuItem value='Approved'>Approved</MenuItem>
                <MenuItem value='Rejected'>Rejected</MenuItem>
              </TextField>
            </Grid>
            {/* <Button type='submit' variant='contained'> */}
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
        </CardContent>
      </Card>
    </form>
  )
}

export default SignatureStatusFilters

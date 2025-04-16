'use client'
import React, { forwardRef, useState } from 'react'
import { Card, CardHeader, CardContent, MenuItem, Button, TextField } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/mui/TextField'
import axios from 'axios'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import SearchIcon from '@mui/icons-material/Search'
import api from '@/utils/api'

interface DefaultStateType {
  clientName: string
  caregiverName: string
  startDate: Date | null
  endDate: Date | null
}

const defaultState: DefaultStateType = {
  clientName: '',
  caregiverName: '',
  startDate: null,
  endDate: null
}

interface PickerProps {
  label?: string
  error?: boolean
  className?: string
  id?: string
  registername?: string
  placeholder?: string
}

interface SignatureStatusFiltersProps {
  onFilterApplied: (data: any) => void
}

const LogsApprovalFilters = ({ onFilterApplied }: SignatureStatusFiltersProps) => {
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

      if (filterData.clientName) queryParams.append('clientName', filterData.clientName)
      if (filterData.caregiverName) queryParams.append('caregiverName', filterData.caregiverName)
      if (filterData.startDate) queryParams.append('clockIn', filterData.startDate.toISOString().split('T')[0])
      if (filterData.endDate) queryParams.append('clockOut', filterData.endDate.toISOString().split('T')[0])
      // if (filterData.tsApprovalStatus) queryParams.append('tsApprovalStatus', filterData.tsApprovalStatus)
      queryParams.append('page', '1')
      queryParams.append('limit', '10')

      // If no filters are applied, fetch all data
      if (queryParams.toString() === 'page=1&limit=10') {
        const response = await api.get(`/time-log`)
        onFilterApplied(response.data)
        return
      }

      console.log('QUERY PARAMS', queryParams.toString())

      // Fetch filtered data
      const filterResponse = await api.get(`/time-log/filtered/?${queryParams.toString()}`)
      onFilterApplied(filterResponse.data.data)
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  const handleReset = async () => {
    try {
      setFilterData(defaultState)
      const response = await api.get(`/time-log`)
      onFilterApplied(response.data)
    } catch (error) {
      console.error('error resetting filters: ', error)
    }
  }

  const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
    return (
      <TextField
        inputRef={ref}
        fullWidth
        size='small'
        {...props}
        label={props.label || ''}
        placeholder={props.placeholder || ''}
        className={props.className}
        id={props.id}
        error={props.error}
      />
    )
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Card className='w-full mb-5' sx={{ p: 2, borderRadius: 1, boxShadow: 2 }}>
        {/* Card Header */}
        <CardHeader title='Filters' titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 500 } }} />

        {/* Card Content */}
        <CardContent>
          {/* <Grid size={{ xs: 12, md:6 }} sx={{ pb: 2 }}> */}

          <Grid container spacing={4}>
            {/* Week Dropdown */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ pb: 2 }}>
              <AppReactDatepicker
                selectsStart
                id='start-date'
                endDate={filterData.endDate}
                selected={filterData.startDate}
                startDate={filterData.startDate}
                customInput={
                  <PickersComponent
                    placeholder='Start Date'
                    label='Start Date'
                    registername='startDate'
                    id='start-date'
                  />
                }
                onChange={(date: Date | null) =>
                  date !== null && setFilterData({ ...filterData, startDate: new Date(date) })
                }
              />
            </Grid>

            {/* Billing Period Dropdown */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ pb: 2 }}>
              <AppReactDatepicker
                selectsStart
                id='end-date'
                endDate={filterData.startDate}
                selected={filterData.endDate}
                startDate={filterData.endDate}
                customInput={
                  <PickersComponent placeholder='End Date' label='End Date' registername='endDate' id='end-date' />
                }
                onChange={(date: Date | null) =>
                  date !== null && setFilterData({ ...filterData, endDate: new Date(date) })
                }
              />
            </Grid>
            {/* Search Client Name */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ pb: 2 }}>
              <TextField
                value={filterData?.clientName}
                onChange={e => setFilterData({ ...filterData, clientName: e.target.value })}
                fullWidth
                size='small'
                placeholder='Client Name'
                label='Client name'
                // className='mbe-6'
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
                size='small'
                placeholder='Caregiver Name'
                label='Caregiver Name'
                id='event-title'
                {...(errors.title && { error: true, helperText: 'This field is required' })}
              />
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
        </CardContent>
      </Card>
    </form>
  )
}

export default LogsApprovalFilters

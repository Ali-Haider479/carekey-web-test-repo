'use client'
import React, { forwardRef, useState } from 'react'
import { Card, CardHeader, CardContent, Grid2 as Grid, TextField, Button } from '@mui/material'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import api from '@/utils/api'

interface defaultStateType {
  clientName: string
  caregiverName: string
  startDate: Date | null
  endDate: Date | null
}

const defaultState: defaultStateType = {
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

interface scheduleFilterProps {
  onFilterApplied: (data: any) => void
}

const ScheduleTableFiltersCard = ({ onFilterApplied }: scheduleFilterProps) => {
  const {
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<defaultStateType>({
    defaultValues: {
      clientName: '',
      caregiverName: '',
      startDate: null,
      endDate: null
    }
  })

  const [filterData, setFilterData] = useState<defaultStateType>(defaultState)

  console.log('Filter Data log', filterData)

  const onSubmit = async () => {
    try {
      const queryParams = new URLSearchParams()

      if (filterData.clientName) queryParams.append('clientName', filterData.clientName)
      if (filterData.caregiverName) queryParams.append('caregiverName', filterData.caregiverName)
      if (filterData.startDate) queryParams.append('startDate', filterData.startDate.toISOString().split('T')[0])
      if (filterData.endDate) queryParams.append('endDate', filterData.endDate.toISOString().split('T')[0])

      let filterResponse
      if (queryParams.toString()) {
        // Fetch filtered data
        filterResponse = await api.get(`/schedule/filtered/?${queryParams.toString()}`)
        onFilterApplied(filterResponse.data) // Pass the filtered data
      } else {
        // If no filters, pass all events (or reset to null to use Redux events)
        const response = await api.get(`/schedule`)
        onFilterApplied(response.data)
      }
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  const handleReset = async () => {
    try {
      setFilterData(defaultState)
      const response = await api.get(`/schedule`)
      onFilterApplied(response.data)
    } catch (error) {
      console.error('Error resetting filters:', error)
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className='w-full' sx={{ p: 2, borderRadius: 1, boxShadow: 2 }}>
        {/* Card Header */}
        <CardHeader title='Filters' titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 500 } }} />

        {/* Card Content */}
        <CardContent>
          <Grid container spacing={4}>
            {/* Search Client Name */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: 2 }}>
              <TextField
                fullWidth
                label='Search Client Name'
                placeholder='Enter client name'
                variant='outlined'
                size='small'
                value={filterData.clientName}
                onChange={e => setFilterData({ ...filterData, clientName: e.target.value })}
              />
            </Grid>

            {/* Search Caregiver Name */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: 2 }}>
              <TextField
                fullWidth
                label='Search Caregiver Name'
                placeholder='Enter caregiver name'
                variant='outlined'
                size='small'
                value={filterData.caregiverName}
                onChange={e => setFilterData({ ...filterData, caregiverName: e.target.value })}
              />
            </Grid>

            {/* SA Start Date */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: 2 }}>
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

            {/* SA End Date */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: 2 }}>
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
          </Grid>
          <Grid container spacing={12}>
            <Grid size={{ xs: 12, sm: 1 }}>
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
        </CardContent>
      </Card>
    </form>
  )
}

export default ScheduleTableFiltersCard

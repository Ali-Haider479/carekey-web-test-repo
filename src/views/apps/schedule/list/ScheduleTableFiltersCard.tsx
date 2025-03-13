'use client'
import React, { useState } from 'react'
import { Card, CardHeader, CardContent, Grid2 as Grid, TextField, Button } from '@mui/material'
import { useForm } from 'react-hook-form'
import axios from 'axios'

interface defaultStateType {
  clientName: string
  caregiverName: string
  startDate: string
  endDate: string
}

const defaultState: defaultStateType = {
  clientName: '',
  caregiverName: '',
  startDate: '',
  endDate: ''
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
      startDate: '',
      endDate: ''
    }
  })

  const [filterData, setFilterData] = useState<defaultStateType>(defaultState)

  console.log('Filter Data log', filterData)

  const onSubmit = async () => {
    try {
      const queryParams = new URLSearchParams()

      if (filterData.clientName) queryParams.append('clientName', filterData.clientName)
      if (filterData.caregiverName) queryParams.append('caregiverName', filterData.caregiverName)
      if (filterData.startDate) queryParams.append('startDate', filterData.startDate)
      if (filterData.endDate) queryParams.append('endDate', filterData.endDate)

      let filterResponse
      if (queryParams.toString()) {
        // Fetch filtered data
        filterResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/schedule/filtered/?${queryParams.toString()}`
        )
        onFilterApplied(filterResponse.data) // Pass the filtered data
      } else {
        // If no filters, pass all events (or reset to null to use Redux events)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/schedule`)
        onFilterApplied(response.data)
      }
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

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
              <TextField
                fullWidth
                label='SA Start Date'
                placeholder='Select start date'
                type='date'
                InputLabelProps={{ shrink: true }}
                variant='outlined'
                size='small'
                value={filterData.startDate}
                onChange={e => setFilterData({ ...filterData, startDate: e.target.value })}
              />
            </Grid>

            {/* SA End Date */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: 2 }}>
              <TextField
                fullWidth
                label='SA End Date'
                placeholder='Select end date'
                type='date'
                InputLabelProps={{ shrink: true }}
                variant='outlined'
                size='small'
                value={filterData.endDate}
                onChange={e => setFilterData({ ...filterData, endDate: e.target.value })}
              />
            </Grid>
          </Grid>
          <Button variant='outlined' type='submit'>
            Apply
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

export default ScheduleTableFiltersCard

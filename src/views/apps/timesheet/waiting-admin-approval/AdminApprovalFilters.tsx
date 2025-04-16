'use client'
import React, { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Grid2 as Grid,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button
} from '@mui/material'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import api from '@/utils/api'

interface DefaultStateType {
  week: string
}

const defaultState: DefaultStateType = {
  week: ''
}

interface AdminApprovalFiltersProps {
  onFilterApplied: (data: any) => void
}

const AdminApprovalFilters = ({ onFilterApplied }: AdminApprovalFiltersProps) => {
  const [payPeriod, setPayPeriod] = useState<any[]>([])
  const [filterData, setFilterData] = useState<DefaultStateType>(defaultState)

  const {
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

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

  const onSubmit = async () => {
    try {
      // Only add parameters that have values
      const queryParams = new URLSearchParams()

      if (filterData.week) queryParams.append('payPeriodHistoryId', filterData.week)
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className='w-full' sx={{ p: 2, borderRadius: 1, boxShadow: 2 }}>
        {/* Card Header */}
        <CardHeader title='Filters' titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 500 } }} />

        {/* Card Content */}
        <CardContent>
          <Grid container spacing={4}>
            {/* Week Dropdown */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ pb: 2 }}>
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

export default AdminApprovalFilters

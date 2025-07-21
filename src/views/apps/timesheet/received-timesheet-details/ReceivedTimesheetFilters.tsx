import React, { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  MenuItem,
  Button,
  TextField,
  IconButton,
  Grid2 as Grid,
  Box
} from '@mui/material'
import { useForm } from 'react-hook-form'
import api from '@/utils/api'

interface DefaultStateType {
  clientName: string
  caregiverName: string
  billingPeriod: string
  week: string
}

const defaultState: DefaultStateType = {
  clientName: '',
  caregiverName: '',
  billingPeriod: '',
  week: ''
}

interface SignatureStatusFiltersProps {
  onFilterApplied: (data: any) => void
  selectedRows: any[] // Add prop for selected rows
  onBulkStatusUpdate: (status: 'Approved' | 'Rejected') => void // Add prop for status update
}

const ReceivedTimesheetFilters = ({
  onFilterApplied,
  selectedRows,
  onBulkStatusUpdate
}: SignatureStatusFiltersProps) => {
  const [filterData, setFilterData] = useState<DefaultStateType>(defaultState)
  const [payPeriod, setPayPeriod] = useState<any[]>([])

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
      const queryParams = new URLSearchParams()
      if (filterData.clientName) queryParams.append('clientName', filterData.clientName)
      if (filterData.caregiverName) queryParams.append('caregiverName', filterData.caregiverName)
      if (filterData.week) queryParams.append('payPeriodHistoryId', filterData.week)
      queryParams.append('page', '1')
      queryParams.append('limit', '10')

      if (queryParams.toString() === 'page=1&limit=10') {
        const response = await api.get(`/time-log`)
        onFilterApplied(response.data)
        return
      }

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

  const handleApprove = () => {
    onBulkStatusUpdate('Approved')
  }

  const handleReject = () => {
    onBulkStatusUpdate('Rejected')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Card className='w-full' sx={{ p: 2, borderRadius: 1, boxShadow: 2 }}>
        <CardHeader title='Filters' titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 500 } }} />
        <CardContent>
          <Grid container spacing={4}>
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
            <Grid size={{ xs: 12, md: 4 }} sx={{ pb: 2 }}>
              <TextField
                select
                fullWidth
                placeholder='Week'
                label='Week'
                size='small'
                value={filterData.week}
                id='event-calendar'
                onChange={e => setFilterData({ ...filterData, week: e.target.value })}
              >
                {payPeriod.map(item => (
                  <MenuItem value={item.id} key={item.id}>
                    {item.startDate} - {item.endDate === null ? 'ongoing' : item.endDate}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
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
              <Grid container spacing={12} sx={{ ml: 'auto' }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button
                    variant='outlined'
                    className='p-1'
                    onClick={handleApprove}
                    disabled={selectedRows.length === 0}
                  >
                    Approve
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button
                    color='error'
                    variant='outlined'
                    className='p-1'
                    onClick={handleReject}
                    disabled={selectedRows.length === 0}
                  >
                    Reject
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </CardContent>
      </Card>
    </form>
  )
}

export default ReceivedTimesheetFilters

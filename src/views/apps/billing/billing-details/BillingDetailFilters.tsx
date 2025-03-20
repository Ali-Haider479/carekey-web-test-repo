'use client'

import { forwardRef, useState } from 'react'
import { Card, CardHeader, TextField, IconButton, Select, Button, MenuItem } from '@mui/material'
import Grid from '@mui/material/Grid2'
import SearchIcon from '@mui/icons-material/Search'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { useForm } from 'react-hook-form'
import axios from 'axios'

interface DefaultStatyeType {
  clientName: string
  caregiverName: string
  claimNumber: string
  payer: string
  procedureCode: string
  DOS: Date | null
  billedAmount: string
  receivedAmount: string
  claimDate: Date | null
  claimStatus: string
}

const defaultState: DefaultStatyeType = {
  clientName: '',
  caregiverName: '',
  claimNumber: '',
  payer: '',
  procedureCode: '',
  DOS: null,
  billedAmount: '',
  receivedAmount: '',
  claimDate: null,
  claimStatus: ''
}

interface PickerProps {
  label?: string
  error?: boolean
  className?: string
  id?: string
  registername?: string
  placeholder?: string
}

interface BillingDetailFiltersProps {
  onFilterApplied: (data: any) => void
}

// Filter Component
const BillingDetailFilters = ({ onFilterApplied }: BillingDetailFiltersProps) => {
  const [filterData, setFilterData] = useState<DefaultStatyeType>(defaultState)

  const { handleSubmit } = useForm()

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

  const onSubmit = async () => {
    try {
      // Only add parameters that have values
      const queryParams = new URLSearchParams()
      if (filterData.caregiverName) queryParams.append('caregiverName', filterData.caregiverName)
      if (filterData.clientName) queryParams.append('clientName', filterData.clientName)
      if (filterData.claimNumber) queryParams.append('claimNumber', filterData.claimNumber)
      if (filterData.payer) queryParams.append('payer', filterData.payer)
      if (filterData.procedureCode) queryParams.append('procedureCode', filterData.procedureCode)
      if (filterData.DOS) queryParams.append('dos', filterData.DOS.toISOString())
      if (filterData.billedAmount) queryParams.append('billedAmount', filterData.billedAmount)
      if (filterData.receivedAmount) queryParams.append('receivedAmount', filterData.receivedAmount)
      if (filterData.claimDate) queryParams.append('claimDate', filterData.claimDate.toISOString())
      if (filterData.claimStatus) queryParams.append('claimStatus', filterData.claimStatus)
      // if (filterData.tsApprovalStatus) queryParams.append('tsApprovalStatus', filterData.tsApprovalStatus)
      queryParams.append('page', '1')
      queryParams.append('limit', '10')
      // If no filters are applied, fetch all data
      if (queryParams.toString() === 'page=1&limit=10') {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log/billing`)
        onFilterApplied(response.data)
        return
      }
      // Fetch filtered data
      const filterResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/time-log/billing/filtered/?${queryParams.toString()}`
      )
      onFilterApplied(filterResponse.data.data)
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  const handleReset = async () => {
    setFilterData(defaultState)
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log/billing`)
    onFilterApplied(response.data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ p: 4, mb: 4, borderRadius: 1, boxShadow: 2 }}>
        <CardHeader title='Filters' className='px-0 pt-0' />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField
              value={filterData?.clientName}
              onChange={e => setFilterData({ ...filterData, clientName: e.target.value })}
              fullWidth
              placeholder='Client Name'
              label='Client Name'
              size='small'
              // className='mbe-6'
              id='event-title'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField
              value={filterData?.caregiverName}
              onChange={e => setFilterData({ ...filterData, caregiverName: e.target.value })}
              fullWidth
              placeholder='Caregiver Name'
              label='Caregiver Name'
              size='small'
              // className='mbe-6'
              id='event-title'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField
              value={filterData?.claimNumber}
              onChange={e => setFilterData({ ...filterData, claimNumber: e.target.value })}
              fullWidth
              placeholder='Claim Number'
              label='Claim Number'
              size='small'
              // className='mbe-6'
              id='event-title'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField
              value={filterData?.payer}
              onChange={e => setFilterData({ ...filterData, payer: e.target.value })}
              fullWidth
              placeholder='Payer'
              label='Payer'
              InputProps={{
                endAdornment: (
                  <IconButton size='small'>
                    <SearchIcon style={{ scale: 1.25 }} />
                  </IconButton>
                )
              }}
              size='small'
              // className='mbe-6'
              id='event-title'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField
              value={filterData?.procedureCode}
              onChange={e => setFilterData({ ...filterData, procedureCode: e.target.value })}
              fullWidth
              placeholder='Procedure Code'
              label='Procedure Code'
              size='small'
              // className='mbe-6'
              id='event-title'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            {/* <AppReactDatepicker
              selected={DOS}
              id='DOS'
              onChange={(date: Date | null) => date !== null && setDOS(date)}
              placeholderText='MM/DD/YYYY'
              customInput={
                <TextField
                  fullWidth
                  size='small'
                  label={'DOS'}
                  placeholder='MM/DD/YYYY'
                  InputProps={{
                    endAdornment: (
                      <IconButton size='small'>
                        <CalendarTodayIcon style={{ scale: 1 }} />
                      </IconButton>
                    )
                  }}
                />
              }
            /> */}
            <AppReactDatepicker
              selectsStart
              id='date-of-service'
              selected={filterData.DOS}
              customInput={
                <PickersComponent placeholder='Date of Service' label='Date of Service' id='date-of-service' />
              }
              onChange={(date: Date | null) => date !== null && setFilterData({ ...filterData, DOS: new Date(date) })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
            <TextField
              value={filterData?.billedAmount}
              onChange={e => setFilterData({ ...filterData, billedAmount: e.target.value })}
              fullWidth
              placeholder='Billed Amount'
              label='Billed Amount'
              size='small'
              // className='mbe-6'
              id='event-title'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
            <TextField
              value={filterData?.receivedAmount}
              onChange={e => setFilterData({ ...filterData, receivedAmount: e.target.value })}
              fullWidth
              placeholder='Recieved Amount'
              label='Recieved Amount'
              size='small'
              // className='mbe-6'
              id='event-title'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
            {/* <AppReactDatepicker
              selected={claimDate}
              id='Claim date'
              onChange={(date: Date | null) => date !== null && setClaimDate(date)}
              placeholderText='MM/DD/YYYY'
              customInput={
                <TextField
                  fullWidth
                  size='small'
                  label={'Claim date'}
                  placeholder='MM/DD/YYYY'
                  InputProps={{
                    endAdornment: (
                      <IconButton size='small'>
                        <CalendarTodayIcon style={{ scale: 1 }} />
                      </IconButton>
                    )
                  }}
                />
              }
            /> */}
            <AppReactDatepicker
              selectsStart
              id='date-of-service'
              selected={filterData.claimDate}
              customInput={<PickersComponent placeholder='Claim Date' label='Claim Date' id='date-of-service' />}
              onChange={(date: Date | null) =>
                date !== null && setFilterData({ ...filterData, claimDate: new Date(date) })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
            <TextField
              select
              fullWidth
              // className='mbe-6'
              placeholder='Status'
              label='Status'
              size='small'
              value={filterData.claimStatus}
              id='event-calendar'
              onChange={e => setFilterData({ ...filterData, claimStatus: e.target.value })}
            >
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Approved'>Approved</MenuItem>
              <MenuItem value='Scheduled'>Scheduled</MenuItem>
              <MenuItem value='Rejected'>Rejected</MenuItem>
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
      </Card>
    </form>
  )
}

export default BillingDetailFilters

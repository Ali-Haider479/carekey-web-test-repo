'use client'

import { useState } from 'react'
import { Card, CardHeader, TextField, IconButton } from '@mui/material'
import Grid from '@mui/material/Grid2'
import SearchIcon from '@mui/icons-material/Search'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Filter Component
const BillingDetailFilters = () => {
  const [DOS, setDOS] = useState<Date | null>(null)
  const [claimDate, setClaimDate] = useState<Date | null>(null)
  return (
    <Card sx={{ p: 4, mb: 4, borderRadius: 1, boxShadow: 2 }}>
      <CardHeader title='Filters' className='px-0 pt-0' />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
          <TextField fullWidth size='small' label='Client name' placeholder='Enter client name' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
          <TextField fullWidth size='small' label='Caregiver name' placeholder='Enter caregiver name' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
          <TextField fullWidth size='small' label='Claim number' placeholder='Enter claim number' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
          <TextField
            fullWidth
            size='small'
            label='Payer'
            placeholder='Enter payer'
            InputProps={{
              endAdornment: (
                <IconButton size='small'>
                  <SearchIcon style={{ scale: 1.25 }} />
                </IconButton>
              )
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
          <TextField fullWidth size='small' label='Procedure code' placeholder='Enter procedure code' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
          <AppReactDatepicker
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
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
          <TextField fullWidth size='small' label='Billed amount' placeholder='Enter billed amount' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
          <TextField fullWidth size='small' label='Received amount' placeholder='Enter received amount' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
          <AppReactDatepicker
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
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
          <TextField select fullWidth size='small' label='Claim status' defaultValue=''>
            <option value=''>Select status</option>
            <option value='pending'>Pending</option>
            <option value='approved'>Approved</option>
            <option value='rejected'>Rejected</option>
          </TextField>
        </Grid>
      </Grid>
    </Card>
  )
}

export default BillingDetailFilters

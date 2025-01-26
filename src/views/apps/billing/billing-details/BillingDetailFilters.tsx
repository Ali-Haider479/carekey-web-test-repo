'use client'

import { useState } from 'react'
import { Card, CardHeader, TextField, Grid, IconButton } from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { GridColDef } from '@mui/x-data-grid'
import { Calendar, Search } from 'lucide-react'

// Filter Component
const BillingDetailFilters = () => {
  return (
    <Card sx={{ p: 4, mb: 4, borderRadius: 1, boxShadow: 2 }}>
      <CardHeader title='Filters' className='px-0 pt-0' />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <TextField fullWidth size='small' label='Client name' placeholder='Enter client name' />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <TextField fullWidth size='small' label='Caregiver name' placeholder='Enter caregiver name' />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <TextField fullWidth size='small' label='Claim number' placeholder='Enter claim number' />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <TextField
            fullWidth
            size='small'
            label='Payer'
            placeholder='Enter payer'
            InputProps={{
              endAdornment: (
                <IconButton size='small'>
                  <Search size={20} />
                </IconButton>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <TextField fullWidth size='small' label='Procedure code' placeholder='Enter procedure code' />
        </Grid>
        {/* <Grid item xs={12} sm={6} md={4} lg={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label='DOS'
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true
                }
              }}
            />
          </LocalizationProvider>
        </Grid> */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <TextField fullWidth size='small' label='Billed amount' placeholder='Enter billed amount' />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <TextField fullWidth size='small' label='Received amount' placeholder='Enter received amount' />
        </Grid>
        {/* <Grid item xs={12} sm={6} md={4} lg={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label='Claim date'
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true
                }
              }}
            />
          </LocalizationProvider>
        </Grid> */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
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

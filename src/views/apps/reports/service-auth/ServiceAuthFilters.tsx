'use client'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { Card, CardHeader, CardContent, Grid2 as Grid, TextField, IconButton } from '@mui/material'
import { useState } from 'react'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

const ServiceAuthFilters = () => {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  return (
    <Card>
      <CardHeader title='Filters' />
      <CardContent>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField fullWidth label='Payor' placeholder='Payor' variant='outlined' size='small' />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField fullWidth label='Client' placeholder='Client' variant='outlined' size='small' />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField fullWidth label='Diagnosis Code' placeholder='Diagnosis Code' variant='outlined' size='small' />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <AppReactDatepicker
              selected={startDate}
              id='claim-date'
              onChange={(date: Date | null) => date !== null && setStartDate(date)}
              placeholderText='MM/DD/YYYY'
              customInput={
                <TextField
                  fullWidth
                  size='small'
                  label={'Claim Date'}
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

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <AppReactDatepicker
              selected={endDate}
              id='claim-date'
              onChange={(date: Date | null) => date !== null && setEndDate(date)}
              placeholderText='MM/DD/YYYY'
              customInput={
                <TextField
                  fullWidth
                  size='small'
                  label={'Claim Date'}
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
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ServiceAuthFilters

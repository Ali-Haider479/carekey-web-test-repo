import React from 'react'
import { Card, CardHeader, CardContent, Grid, TextField } from '@mui/material'

const LogsApprovalFilters = () => {
  return (
    <Card className='w-full' sx={{ p: 2, borderRadius: 1, boxShadow: 2 }}>
      {/* Card Header */}
      <CardHeader title='Filters' titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 500 } }} />

      {/* Card Content */}
      <CardContent>
        <Grid container spacing={4}>
          {/* Search Client Name */}
          <Grid item xs={12} md={6} sx={{ pb: 2 }}>
            <TextField
              fullWidth
              label='Search Client Name'
              placeholder='Enter client name'
              variant='outlined'
              size='small'
            />
          </Grid>

          {/* Search Caregiver Name */}
          <Grid item xs={12} md={6} sx={{ pb: 2 }}>
            <TextField
              fullWidth
              label='Search Caregiver Name'
              placeholder='Enter caregiver name'
              variant='outlined'
              size='small'
            />
          </Grid>

          {/* SA Start Date */}
          <Grid item xs={12} md={6} sx={{ pb: 2 }}>
            <TextField
              fullWidth
              label='Start Date'
              placeholder='Select start date'
              type='date'
              InputLabelProps={{ shrink: true }}
              variant='outlined'
              size='small'
            />
          </Grid>

          {/* SA End Date */}
          <Grid item xs={12} md={6} sx={{ pb: 2 }}>
            <TextField
              fullWidth
              label='End Date'
              placeholder='Select end date'
              type='date'
              InputLabelProps={{ shrink: true }}
              variant='outlined'
              size='small'
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default LogsApprovalFilters

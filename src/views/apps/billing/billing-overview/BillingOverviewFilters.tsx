import React from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material'

const BillingOverviewFilters = () => {
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

          {/* Week Dropdown */}
          <Grid item xs={12} md={6} sx={{ pb: 2 }}>
            <FormControl fullWidth size='small' variant='outlined'>
              <InputLabel id='week-select-label'>Week</InputLabel>
              <Select labelId='week-select-label' value={''} label='Week'>
                <MenuItem value='Week 1'>Week 1</MenuItem>
                <MenuItem value='Week 2'>Week 2</MenuItem>
                <MenuItem value='Week 3'>Week 3</MenuItem>
                <MenuItem value='Week 4'>Week 4</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Signature Status Dropdown */}
          <Grid item xs={12} md={6} sx={{ pb: 2 }}>
            <FormControl fullWidth size='small' variant='outlined'>
              <InputLabel id='signature-status-select-label'>Signature Status</InputLabel>
              <Select
                labelId='signature-status-select-label'
                value={''} // Use a state variable for controlled component
                label='Signature Status' // Correct label reference
              >
                <MenuItem value='Signed'>Signed</MenuItem>
                <MenuItem value='Unsigned'>Unsigned</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Timesheet Approval Dropdown */}
          <Grid item xs={12} md={6} sx={{ pb: 2 }}>
            <FormControl fullWidth size='small' variant='outlined'>
              <InputLabel id='timesheet-approval-select-label'>Timesheet Approval</InputLabel>
              <Select
                labelId='timesheet-approval-select-label'
                value={''} // Use a state variable for controlled component
                label='Timesheet Approval' // Correct label reference
              >
                <MenuItem value='Approved'>Approved</MenuItem>
                <MenuItem value='Pending'>Pending</MenuItem>
                <MenuItem value='Rejected'>Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default BillingOverviewFilters

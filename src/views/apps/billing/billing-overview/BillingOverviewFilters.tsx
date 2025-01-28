import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  RadioGroup,
  Radio,
  FormLabel,
  FormControlLabel,
  IconButton
} from '@mui/material'

import Grid from '@mui/material/Grid2'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

const BillingOverviewFilters = () => {
  const [selectedValue, setSelectedValue] = useState('Service')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value)
  }
  return (
    <Card className='w-full' sx={{ p: 2, borderRadius: 1, boxShadow: 2 }}>
      {/* Card Header */}
      <CardHeader title='Filters' titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 500 } }} />

      {/* Card Content */}
      <CardContent>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <FormControl>
              <RadioGroup
                row
                aria-labelledby='radio-buttons-group-label'
                name='radio-buttons'
                value={selectedValue}
                onChange={handleChange}
              >
                <FormControlLabel value='Service' control={<Radio />} label='Service' />
                <FormControlLabel value='Billed Date' control={<Radio />} label='Billed Date' />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <AppReactDatepicker
              selected={startDate}
              id='start-date'
              onChange={(date: Date | null) => date !== null && setStartDate(date)}
              placeholderText='MM/DD/YYYY'
              customInput={
                <TextField
                  fullWidth
                  size='small'
                  label={'Start Date'}
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
              id='end-date'
              onChange={(date: Date | null) => date !== null && setEndDate(date)}
              placeholderText='MM/DD/YYYY'
              customInput={
                <TextField
                  fullWidth
                  size='small'
                  label={'End Date'}
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

          {/* Search Client Name */}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField fullWidth label='Client Name' placeholder='Enter client name' variant='outlined' size='small' />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <FormControl fullWidth size='small' variant='outlined'>
              <InputLabel id='log-status-select-label'>Log Status</InputLabel>
              <Select labelId='log-status-select-label' value={''} label='Log Status'>
                <MenuItem value='Option-1'>Option-1</MenuItem>
                <MenuItem value='Option-2'>Option-2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <FormControl fullWidth size='small' variant='outlined'>
              <InputLabel id='billing-status-label'>Billing Status</InputLabel>
              <Select labelId='billing-status-label' value={''} label='Billing Status'>
                <MenuItem value='Option-1'>Option-1</MenuItem>
                <MenuItem value='Option-2'>Option-2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <FormControl fullWidth size='small' variant='outlined'>
              <InputLabel id='pro-code-status-label'>Pro Code</InputLabel>
              <Select labelId='pro-code-status-label' value={''} label='Pro Code'>
                <MenuItem value='Option-1'>Option-1</MenuItem>
                <MenuItem value='Option-2'>Option-2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <FormControl fullWidth size='small' variant='outlined'>
              <InputLabel id='payor-select-label'>Payor</InputLabel>
              <Select labelId='payor-select-label' value={''} label='Payor'>
                <MenuItem value='Option-1'>Option-1</MenuItem>
                <MenuItem value='Option-2'>Option-2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Search Caregiver Name */}
          {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField
              fullWidth
              label='Search Caregiver Name'
              placeholder='Enter caregiver name'
              variant='outlined'
              size='small'
            />
          </Grid> */}

          {/* Week Dropdown */}
          {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <FormControl fullWidth size='small' variant='outlined'>
              <InputLabel id='week-select-label'>Week</InputLabel>
              <Select labelId='week-select-label' value={''} label='Week'>
                <MenuItem value='Week 1'>Week 1</MenuItem>
                <MenuItem value='Week 2'>Week 2</MenuItem>
                <MenuItem value='Week 3'>Week 3</MenuItem>
                <MenuItem value='Week 4'>Week 4</MenuItem>
              </Select>
            </FormControl>
          </Grid> */}

          {/* Signature Status Dropdown */}
          {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
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
          </Grid> */}

          {/* Timesheet Approval Dropdown */}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
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

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
  IconButton
} from '@mui/material'

import Grid from '@mui/material/Grid2'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

const SubmittedBatchFilters = () => {
  const [dateOfSubmission, setDateOfSubmission] = useState<Date | null>(null)
  return (
    <Card className='w-full' sx={{ p: 2, borderRadius: 1, boxShadow: 2 }}>
      {/* Card Header */}
      <CardHeader title='Filters' titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 500 } }} />

      {/* Card Content */}
      <CardContent>
        <Grid container spacing={4}>
          {/* Week Dropdown */}
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
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
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <AppReactDatepicker
              selected={dateOfSubmission}
              id='submission-date'
              onChange={(date: Date | null) => date !== null && setDateOfSubmission(date)}
              placeholderText='MM/DD/YYYY'
              customInput={
                <TextField
                  fullWidth
                  size='small'
                  label={'Date of Submission'}
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

export default SubmittedBatchFilters

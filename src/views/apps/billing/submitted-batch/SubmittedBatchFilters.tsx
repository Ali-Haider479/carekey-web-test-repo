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

const SubmittedBatchFilters = () => {
  return (
    <Card className='w-full' sx={{ p: 2, borderRadius: 1, boxShadow: 2 }}>
      {/* Card Header */}
      <CardHeader title='Filters' titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 500 } }} />

      {/* Card Content */}
      <CardContent>
        <Grid container spacing={4}>
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
        </Grid>
      </CardContent>
    </Card>
  )
}

export default SubmittedBatchFilters

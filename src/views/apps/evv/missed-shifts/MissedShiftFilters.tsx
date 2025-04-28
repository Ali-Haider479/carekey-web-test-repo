import React, { useState } from 'react'
import { Card, CardHeader, CardContent, MenuItem, Button, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useForm } from 'react-hook-form'

interface DefaultStateType {
  caregiverName: string
  status: string
}

const defaultState: DefaultStateType = {
  caregiverName: '',
  status: ''
}

interface EVVFiltersProps {
  missedShifts: any[] // The full dataset of missed shifts
  onFilterApplied: (data: any[]) => void // Callback to pass filtered data
}

const MissedShiftFilters = ({ missedShifts, onFilterApplied }: EVVFiltersProps) => {
  const [filterData, setFilterData] = useState<DefaultStateType>(defaultState)

  // Hooks
  const {
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const onSubmit = () => {
    // Apply filters on the frontend
    let filteredData = [...missedShifts] // Create a copy of the original data

    // Filter by caregiverName (case-insensitive partial match)
    if (filterData.caregiverName) {
      filteredData = filteredData.filter(shift =>
        shift.caregiverName?.toLowerCase().includes(filterData.caregiverName.toLowerCase())
      )
    }

    // Filter by status
    if (filterData.status) {
      filteredData = filteredData.filter(shift => shift.status === filterData.status)
    }

    // Pass the filtered data to the parent component
    onFilterApplied(filteredData)
  }

  const handleReset = () => {
    // Reset filters and pass the original data back
    setFilterData(defaultState)
    onFilterApplied(missedShifts)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Grid container spacing={4}>
        {/* Search Caregiver Name */}
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

        {/* Status Dropdown */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ pb: 2 }}>
          <TextField
            select
            fullWidth
            placeholder='Status'
            label='Status'
            size='small'
            value={filterData.status}
            id='event-calendar'
            onChange={e => setFilterData({ ...filterData, status: e.target.value })}
          >
            <MenuItem value='Active'>Active</MenuItem>
            <MenuItem value='Inactive'>Inactive</MenuItem>
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
    </form>
  )
}

export default MissedShiftFilters

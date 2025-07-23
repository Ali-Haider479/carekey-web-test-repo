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
    let filteredData = [...missedShifts]

    // Filter by caregiverName (first + last name match)
    if (filterData.caregiverName) {
      const search = filterData.caregiverName.toLowerCase()
      filteredData = filteredData.filter(shift =>
        `${shift.caregiver?.firstName ?? ''} ${shift.caregiver?.lastName ?? ''}`.toLowerCase().includes(search)
      )
    }

    // Filter by status - assuming this exists (add null check or remove if not applicable)
    if (filterData.status) {
      filteredData = filteredData.filter(shift => shift.caregiver?.user?.accountStatus === filterData.status)
    }

    // If no filters are applied, return all
    if (filterData.caregiverName === '' && filterData.status === '') {
      filteredData = missedShifts
    }

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
            <Button type='submit' variant='contained' className='p-1'>
              Apply
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button onClick={handleReset} color='error' variant='contained' className='p-1'>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </form>
  )
}

export default MissedShiftFilters

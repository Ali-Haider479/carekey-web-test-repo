import React, { useState } from 'react'
import { Card, CardHeader, CardContent, MenuItem, Button, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useForm } from 'react-hook-form'
import axios from 'axios'

interface DefaultStateType {
  caregiverName: string
  status: string
}

const defaultState: DefaultStateType = {
  caregiverName: '',
  status: ''
}

interface SignatureStatusFiltersProps {
  onFilterApplied: (data: any) => void
}

// const EvvFilters = ({ onFilterApplied }: SignatureStatusFiltersProps) => {
const EvvFilters = () => {
  const [filterData, setFilterData] = useState<DefaultStateType>(defaultState)

  // Hooks
  const {
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const onSubmit = async () => {
    // try {
    //   // Only add parameters that have values
    //   const queryParams = new URLSearchParams()
    //   if (filterData.CaregiverName) queryParams.append('CaregiverName', filterData.CaregiverName)
    //   if (filterData.caregiverName) queryParams.append('caregiverName', filterData.caregiverName)
    //   // if (filterData.tsApprovalStatus) queryParams.append('tsApprovalStatus', filterData.tsApprovalStatus)
    //   queryParams.append('page', '1')
    //   queryParams.append('limit', '10')
    //   // If no filters are applied, fetch all data
    //   if (queryParams.toString() === 'page=1&limit=10') {
    //     const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log`)
    //     onFilterApplied(response.data)
    //     return
    //   }
    //   // Fetch filtered data
    //   const filterResponse = await axios.get(
    //     `${process.env.NEXT_PUBLIC_API_URL}/time-log/filtered/?${queryParams.toString()}`
    //   )
    //   onFilterApplied(filterResponse.data.data)
    // } catch (error) {
    //   console.error('Error applying filters:', error)
    // }
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
            // className='mbe-6'
            id='event-title'
            {...(errors.title && { error: true, helperText: 'This field is required' })}
          />
        </Grid>

        {/* Billing Period Dropdown */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ pb: 2 }}>
          <TextField
            select
            fullWidth
            // className='mbe-6'
            placeholder='Status'
            label='Status'
            size='small'
            value={filterData.status}
            id='event-calendar'
            onChange={e => setFilterData({ ...filterData, status: e.target.value })}
          >
            <MenuItem value='Active'>Active</MenuItem>
            <MenuItem value='InActive'>InActive</MenuItem>
          </TextField>
        </Grid>
        {/* variant='contained' */}
        <Button type='submit'>Filter</Button>
      </Grid>
    </form>
  )
}

export default EvvFilters

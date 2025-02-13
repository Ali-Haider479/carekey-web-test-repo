'use client'
// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { CaregiverTypes } from '@/types/apps/caregiverTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import Card from '@mui/material/Card'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Button, Typography } from '@mui/material'

interface DefaultStateType {
  accountStatus: string
}

const defaultState: DefaultStateType = {
  accountStatus: ''
}

interface CaregiverFiltersProps {
  onFilterApplied: (data: any) => void
}

const CaregiverFilters = ({
  setData,
  tableData,
  onFilterApplied
}: {
  setData: (data: CaregiverTypes[]) => void
  tableData?: CaregiverTypes[]
  onFilterApplied: (data: any) => void
}) => {
  // States
  const [item, setItem] = useState<CaregiverTypes['item']>('')
  const [accountStatus, setAccountStatus] = useState<DefaultStateType>(defaultState)

  // Hooks
  const {
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const onSubmit = async () => {
    try {
      const queryParams = new URLSearchParams()

      if (accountStatus.accountStatus) queryParams.append('accountStatus', accountStatus.accountStatus)
      queryParams.append('page', '1')
      queryParams.append('limit', '10')

      // If no filters are applied, fetch all data
      if (queryParams.toString() === 'page=1&limit=10') {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregivers/1/tenant`)
        onFilterApplied(response.data)
        return
      }
      // Fetch filtered data
      const filterResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/caregivers/filtered/?${queryParams.toString()}`
      )
      onFilterApplied(filterResponse.data.data)
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  useEffect(() => {
    const filteredData = tableData?.filter(user => {
      if (status && user.status !== status) return false
      if (item && user.item !== item) return false
      return true
    })

    setData(filteredData || [])
  }, [status, item, tableData, setData])

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0, padding: 5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <span className='text-[20px]'>
            <strong>Filters</strong>
          </span>
        </Grid>
        <Grid container spacing={6} marginTop={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant='h6' className='mb-2'>
              Account Status
            </Typography>
            <CustomTextField
              select
              fullWidth
              id='select-status'
              value={accountStatus.accountStatus}
              onChange={e => setAccountStatus({ ...accountStatus, accountStatus: e.target.value })}
              slotProps={{
                select: { displayEmpty: true }
              }}
            >
              <MenuItem value='Active'>Active</MenuItem>
              <MenuItem value='Inactive'>Inactive</MenuItem>
            </CustomTextField>
            <Button type='submit' variant='outlined' className='mt-2 p-1'>
              Apply
            </Button>
          </Grid>
          {/* <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-item'
            value={item}
            onChange={e => setItem(e.target.value)}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''> Item</MenuItem>
            <MenuItem value='pending'>Pending</MenuItem>
            <MenuItem value='active'>Active</MenuItem>
            <MenuItem value='inactive'>Inactive</MenuItem>
          </CustomTextField>
        </Grid> */}
        </Grid>
      </Card>
    </form>
  )
}

export default CaregiverFilters

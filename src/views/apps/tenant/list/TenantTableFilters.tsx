// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Button } from '@mui/material'
import api from '@/utils/api'

interface DefaultStateType {
  role: string
  plan: string
  status: string
}

const defaultState: DefaultStateType = {
  role: '',
  plan: '',
  status: ''
}

interface TenantFiltersProps {
  onFilterApplied: (data: any) => void
}

const TenantTableFilters = ({
  setData,
  tableData,
  onFilterApplied
}: {
  setData: (data: UsersType[]) => void
  tableData?: UsersType[]
  onFilterApplied: (data: any) => void
}) => {
  // States
  const [role, setRole] = useState<any>(defaultState.role)
  const [plan, setPlan] = useState<any>(defaultState.plan)
  const [status, setStatus] = useState<any>(defaultState.status)
  const [filterData, setFilterData] = useState<DefaultStateType>(defaultState)

  const {
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const onSubmit = async () => {
    try {
      const queryParams = new URLSearchParams()

      if (filterData.role) queryParams.append('role', filterData.role)
      if (filterData.plan) queryParams.append('plan', filterData.plan)
      if (filterData.status) queryParams.append('status', filterData.status)
      queryParams.append('page', '1')
      queryParams.append('limit', '10')

      // If no filters are applied, fetch all data
      if (queryParams.toString() === 'page=1&limit=10') {
        onFilterApplied(tableData)
        return
      }

      // Fetch filtered data
      const filterResponse = await api.get(`/tenant/filtered/?${queryParams.toString()}`)
      onFilterApplied(filterResponse.data.data)
      console.log('filterResponse', filterResponse)
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  useEffect(() => {
    const filteredData = tableData?.filter(user => {
      if (role && user.role !== role) return false
      if (plan && user.currentPlan !== plan) return false
      if (status && user.status !== status) return false

      return true
    })

    setData(filteredData || [])
  }, [role, plan, status, tableData, setData])

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <CardContent>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <CustomTextField
              select
              fullWidth
              id='select-role'
              value={filterData.role}
              onChange={e => setFilterData({ ...filterData, role: e.target.value })}
              slotProps={{
                select: { displayEmpty: true }
              }}
            >
              <MenuItem value=''>Select Role</MenuItem>
              <MenuItem value='Super Admin'>Super Admin</MenuItem>
              <MenuItem value='Tenant Admin'>Tenant Admin</MenuItem>
              <MenuItem value='Caregiver'>Caregiver</MenuItem>
              <MenuItem value='Case Manager'>Case Manager</MenuItem>
              <MenuItem value='Qualified Professional'>Qualified Professional</MenuItem>
            </CustomTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <CustomTextField
              select
              fullWidth
              id='select-plan'
              value={filterData.plan}
              onChange={e => setFilterData({ ...filterData, plan: e.target.value })}
              slotProps={{
                select: { displayEmpty: true }
              }}
            >
              <MenuItem value=''>Select Plan</MenuItem>
              <MenuItem value='basic'>Basic</MenuItem>
              <MenuItem value='company'>Company</MenuItem>
              <MenuItem value='enterprise'>Enterprise</MenuItem>
              <MenuItem value='team'>Team</MenuItem>
            </CustomTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <CustomTextField
              select
              fullWidth
              id='select-status'
              value={filterData.status}
              onChange={e => setFilterData({ ...filterData, status: e.target.value })}
              slotProps={{
                select: { displayEmpty: true }
              }}
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value='Active'>Active</MenuItem>
              <MenuItem value='Suspended'>Suspended</MenuItem>
              <MenuItem value='Canceled'>Canceled</MenuItem>
            </CustomTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Button type='submit' variant='outlined' className='mt-1 p-1'>
              Apply
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </form>
  )
}

export default TenantTableFilters

'use client'
import React, { useEffect, useState } from 'react'
import { Card, Typography, Grid2 as Grid, MenuItem, Button } from '@mui/material'
import CustomTextField from '@core/components/mui/TextField'
import { useForm } from 'react-hook-form'
import api from '@/utils/api'

interface DefaultStateType {
  accountStatus: string
  role: string
}

const defaultState: DefaultStateType = {
  role: '',
  accountStatus: ''
}

interface UserManagementFiltersProps {
  onFilterApplied: (filteredData: any) => void
  rolesData: any[]
}

const UserManagementFilters = ({ onFilterApplied, rolesData }: UserManagementFiltersProps) => {
  const [filterData, setFilterData] = useState<DefaultStateType>(defaultState)

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const tenantId = authUser?.tenant?.id

  // const getRolesData = async () => {
  //   try {
  //     const response = await api.get(`/role/${tenantId}`)

  //     // Filter roles based on tenant ID
  //     const filteredRoles = response.data.filter((role: any) => {
  //       // Check if role has any users from the current tenant
  //       return role.id !== 1
  //     })

  //     setRolesData(filteredRoles)
  //   } catch (error) {
  //     console.error('Error fetching roles data:', error)
  //   }
  // }

  // useEffect(() => {
  //   getRolesData()
  // }, [])

  const {
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const onSubmit = async () => {
    try {
      const queryParams = new URLSearchParams()

      queryParams.append('tenantId', tenantId)

      // Add accountStatus filter if provided
      if (filterData.accountStatus) {
        queryParams.append('accountStatus', filterData.accountStatus)
      }

      // Add caregiverUMPI filter if provided
      if (filterData.role) {
        queryParams.append('role', filterData.role)
      }

      queryParams.append('page', '1')
      queryParams.append('limit', '10')

      // If no filters are applied, fetch all data
      if (queryParams.toString() === `page=1&limit=10&tenantId=${tenantId}`) {
        const response = await api.get(`/user/tenant/${tenantId}`)
        console.log('All Data Response:', response.data)
        onFilterApplied(response.data.data)
        return
      }
      // Fetch filtered data
      const filterResponse = await api.get(`/user/filtered/?${queryParams.toString()}`)
      onFilterApplied(filterResponse.data.data)
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  const handleReset = async () => {
    try {
      setFilterData(defaultState)
      // Fetch all data
      const response = await api.get(`/user/tenant/${tenantId}`)
      // onFilterApplied(response.data)
      const normalizedData = Array.isArray(response.data) ? response.data : []
      onFilterApplied(normalizedData)
    } catch (error) {
      console.error('Error resetting filters:', error)
    }
  }

  console.log('Roles Data: ', rolesData)

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <Card className='p-4'>
        <Typography variant='h5' className='mb-3'>
          Filters
        </Typography>
        <Grid container spacing={4}>
          <Grid size={{ sm: 12, md: 4 }}>
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
              {/* <MenuItem value='Tenant Admin'>Tenant Admin</MenuItem>
              <MenuItem value='Caregiver'>Caregiver</MenuItem>
              <MenuItem value='Case Manager'>Case Manager</MenuItem>
              <MenuItem value='Qualified Professional'>Qualified Professional</MenuItem> */}
              {rolesData?.map((role: any) => (
                <MenuItem key={role.id} value={role.title}>
                  {role.title}
                </MenuItem>
              ))}
            </CustomTextField>
          </Grid>
          <Grid size={{ sm: 12, md: 4 }}>
            <CustomTextField
              select
              fullWidth
              id='select-status'
              value={filterData.accountStatus}
              onChange={e => setFilterData({ ...filterData, accountStatus: e.target.value })}
              slotProps={{
                select: { displayEmpty: true }
              }}
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value='Active'>Active</MenuItem>
              <MenuItem value='Inactive'>Inactive</MenuItem>
            </CustomTextField>
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
      </Card>
    </form>
  )
}

export default UserManagementFilters

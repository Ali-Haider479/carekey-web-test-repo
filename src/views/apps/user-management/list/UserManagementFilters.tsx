'use client'
import React, { useState } from 'react'
import { Card, Typography, Grid2 as Grid, MenuItem, Button } from '@mui/material'
import CustomTextField from '@core/components/mui/TextField'

interface DefaultStateType {
  accountStatus: string
  role: string
}

const defaultState: DefaultStateType = {
  role: '',
  accountStatus: ''
}

const UserManagementFilters = () => {
  const [filterData, setFilterData] = useState<any>(defaultState)

  return (
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
            <MenuItem value='Super Admin'>Super Admin</MenuItem>
            <MenuItem value='Billing Admin'>Billing Admin</MenuItem>
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
        <Grid size={{ sm: 12, md: 4 }}>
          <Button variant='outlined' className='mt-1 p-1'>
            Apply Filter
          </Button>
        </Grid>
      </Grid>
    </Card>
  )
}

export default UserManagementFilters

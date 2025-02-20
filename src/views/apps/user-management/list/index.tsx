'use client'
import React from 'react'
import UserManagementList from './UserManagementTable'
import UserManagementFilters from './UserManagementFilters'
import { Typography } from '@mui/material'

const UserManagementView = () => {
  return (
    <div>
      <div>
        <Typography variant='h3' className='mb-5'>
          Admin User Management
        </Typography>
      </div>
      <div>
        <UserManagementFilters />
      </div>
      <div className='mt-5'>
        <UserManagementList />
      </div>
    </div>
  )
}

export default UserManagementView

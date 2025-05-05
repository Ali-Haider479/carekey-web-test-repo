'use client'
import React, { useEffect, useState } from 'react'
import UserManagementList from './UserManagementTable'
import UserManagementFilters from './UserManagementFilters'
import { Typography } from '@mui/material'
import api from '@/utils/api'

const UserManagementView = () => {
  const [usersData, setUsersData] = useState<any[]>([])
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const tenantId = authUser?.tenant?.id

  const fetchInitialData = async () => {
    try {
      const response = await api.get(`/user/tenant/${tenantId}`)
      const users = response.data.filter((user: any) => user.role?.title !== 'Super Admin')
      setUsersData(users)
    } catch (error) {
      console.error('Error fetching initial data:', error)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const handleFilterApplied = (filteredData: any) => {
    setUsersData(filteredData)
  }

  return (
    <div>
      <div>
        <Typography variant='h3' className='mb-5'>
          Admin User Management
        </Typography>
      </div>
      <div>
        <UserManagementFilters onFilterApplied={handleFilterApplied} />
      </div>
      <div className='mt-5'>
        <UserManagementList usersData={usersData} />
      </div>
    </div>
  )
}

export default UserManagementView

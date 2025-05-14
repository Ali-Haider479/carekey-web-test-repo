'use client'
import React, { useEffect, useState } from 'react'
import UserManagementList from './UserManagementTable'
import UserManagementFilters from './UserManagementFilters'
import api from '@/utils/api'

const UserManagementPage = () => {
  const [usersData, setUsersData] = useState<any[]>([])
  const [rolesData, setRolesData] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [refreshRoles, setRefreshRoles] = useState(false)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const tenantId = authUser?.tenant?.id

  const fetchInitialData = async () => {
    try {
      const response = await api.get(`/user/tenant/${tenantId}`)
      setUsersData(Array.isArray(response.data) ? response.data : response.data.data || [])
    } catch (error) {
      console.error('Error fetching initial users data:', error)
    }
  }

  const fetchRolesData = async () => {
    try {
      const response = await api.get(`/role/${tenantId}`)
      const filteredRoles = response.data.filter((role: any) => role.id !== 1)
      setRolesData(filteredRoles)
    } catch (error) {
      console.error('Error fetching roles data:', error)
    }
  }

  useEffect(() => {
    fetchInitialData()
    fetchRolesData()
  }, [])

  useEffect(() => {
    if (refreshRoles) {
      fetchRolesData()
      setRefreshRoles(false)
    }
  }, [refreshRoles])

  const handleFilterApplied = (filteredData: any[]) => {
    setUsersData(filteredData)
    setCurrentPage(0)
  }

  return (
    <div>
      <UserManagementFilters onFilterApplied={handleFilterApplied} rolesData={rolesData} />
      <UserManagementList
        usersData={usersData}
        fetchInitialData={fetchInitialData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        rolesData={rolesData}
        setRolesData={setRolesData}
        setRefreshRoles={setRefreshRoles}
      />
    </div>
  )
}

export default UserManagementPage

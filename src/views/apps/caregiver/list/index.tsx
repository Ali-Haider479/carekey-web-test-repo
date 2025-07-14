'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import CaregiverTable from './CaregiversTable'
import CaregiverFilters from './CaregiverFilters'
import { use, useEffect, useState } from 'react'
import axios from 'axios'
import api from '@/utils/api'

// Component Imports

const CaregiverList = () => {
  const [caregiverData, setCaregiverData] = useState<any>([])
  const [totalCaregivers, setTotalCaregivers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isUserDeleted, setIsUserDeleted] = useState(false)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const fetchInitialData = async () => {
    try {
      const response = await api.get(`/caregivers/active`)
      console.log('CARGIVER RESPONSE ONE', response)
      setCaregiverData(response.data)
      // setTotalCaregivers(response.data.length)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setIsLoading(false)
    }
  }

  const fetchAllCaregivers = async () => {
    const response = await api.get(`/caregivers`)
    setTotalCaregivers(response.data.length)
  }

  useEffect(() => {
    console.log('useEffect triggered with isUserDeleted:', isUserDeleted)
    fetchInitialData()
    fetchAllCaregivers()
  }, [isUserDeleted])

  const handleFilteredData = (accountStatus: any) => {
    setCaregiverData(accountStatus)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CaregiverFilters setData={() => {}} onFilterApplied={handleFilteredData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CaregiverTable
          isLoading={isLoading}
          data={caregiverData}
          setIsUserDeleted={setIsUserDeleted}
          isUserDeleted={isUserDeleted}
          totalCaregivers={totalCaregivers}
        />
      </Grid>
    </Grid>
  )
}

export default CaregiverList

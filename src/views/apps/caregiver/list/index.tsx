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
  const [isLoading, setIsLoading] = useState(true)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const token = authUser?.backendAccessToken

  const fetchInitialData = async () => {
    try {
      const response = await api.get(`/caregivers`)
      console.log('CARGIVER RESPONSE ONE', response)
      setCaregiverData(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const handleFilteredData = (accountStatus: any) => {
    setCaregiverData(accountStatus)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CaregiverFilters setData={() => {}} onFilterApplied={handleFilteredData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CaregiverTable isLoading={isLoading} data={caregiverData} />
      </Grid>
    </Grid>
  )
}

export default CaregiverList

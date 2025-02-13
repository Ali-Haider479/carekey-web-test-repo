'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import CaregiverTable from './CaregiversTable'
import CaregiverFilters from './CaregiverFilters'
import { use, useEffect, useState } from 'react'
import axios from 'axios'

// Component Imports

const CaregiverList = () => {
  const [caregiverData, setCaregiverData] = useState<any>([])

  const fetchInitialData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregivers`)
      setCaregiverData(response.data)
    } catch (error) {
      console.error('Error fetching initial data:', error)
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
        <CaregiverTable data={caregiverData} />
      </Grid>
    </Grid>
  )
}

export default CaregiverList

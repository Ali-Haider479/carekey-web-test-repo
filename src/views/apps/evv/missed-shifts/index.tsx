'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import { useEffect, useState } from 'react'
import api from '@/utils/api'

// Component Imports
import EvvMissedShiftsTable from './EvvMissedShiftsTable'

const EvvMissedShifts = () => {
  const [timeLogData, setTimeLogData] = useState<any[]>([]) // Full dataset of missed shifts
  const [filteredTimeLogData, setFilteredTimeLogData] = useState<any[]>([]) // Filtered dataset
  const [isLoading, setIsLoading] = useState(true)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  // Fetch initial data on component mount
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const response = await api.get(`/time-log/dashboard/missed-shifts/${authUser?.tenant?.id}`)
      console.log('MISSED SHIFTS', response.data.data)
      setTimeLogData(response.data.data)
      setFilteredTimeLogData(response.data.data) // Initialize filtered data with full dataset
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setIsLoading(false)
    }
  }

  // Handle filtered data from EvvMissedShiftsTable
  const handleFilteredData = (filteredData: any[]) => {
    setFilteredTimeLogData(filteredData)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <EvvMissedShiftsTable
          timeLogData={filteredTimeLogData} // Pass filtered data
          isLoading={isLoading}
          onFilterApplied={handleFilteredData} // Pass callback to receive filtered data
        />
      </Grid>
    </Grid>
  )
}

export default EvvMissedShifts

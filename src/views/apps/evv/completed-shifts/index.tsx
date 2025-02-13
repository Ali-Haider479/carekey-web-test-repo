'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import EvvCompletedShiftsTable from './EvvCompletedShiftsTable'
import { useEffect, useState } from 'react'
import axios from 'axios'
import EvvFilters from './EvvFilter'

// Component Imports

const EvvCompletedShifts = () => {
  // Shared state for the filtered data
  // const [timeLogData, setTimeLogData] = useState<any>([])
  // const [isLoading, setIsLoading] = useState(true)

  const [timeLogData, setTimeLogData] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)

  // // Initial data fetch
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log/completed-timelogs`)
      setTimeLogData(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setIsLoading(false)
    }
  }

  // // Handler for filter updates
  // const handleFilteredData = (filteredData: any) => {
  //   setTimeLogData(filteredData)
  // }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <EvvCompletedShiftsTable timeLogData={timeLogData} isLoading={isLoading} />
      </Grid>
    </Grid>
  )
}

export default EvvCompletedShifts

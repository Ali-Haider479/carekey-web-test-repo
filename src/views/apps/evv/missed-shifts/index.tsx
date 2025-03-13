'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import { useEffect, useState } from 'react'
import axios from 'axios'
import EvvMissedShiftsTable from './EvvMissedShiftsTable'
import EvvFilters from '../completed-shifts/EvvFilter'

// Component Imports

const EvvMissedShifts = () => {
  // Shared state for the filtered data
  // const [timeLogData, setTimeLogData] = useState<any>([])
  // const [isLoading, setIsLoading] = useState(true)

  const [timeLogData, setTimeLogData] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  // // Initial data fetch
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/time-log/dashboard/missed-shifts/${authUser?.tenant?.id}`
      )
      console.log('MISSED SHIFTS', response.data.data)
      setTimeLogData(response.data.data)
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
        <EvvMissedShiftsTable timeLogData={timeLogData} isLoading={isLoading} />
      </Grid>
    </Grid>
  )
}

export default EvvMissedShifts

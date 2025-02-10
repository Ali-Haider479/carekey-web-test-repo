'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import SignatureStatusTable from './SignatureStatusTable'
import SignatureStatusFilters from './SignatureStatusFilters'
import { useState, useEffect } from 'react'
import axios from 'axios'

// Component Imports

const SignatureDetails = () => {
  // Shared state for the filtered data
  const [timeLogData, setTimeLogData] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)

  // Initial data fetch
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log`)
      setTimeLogData(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setIsLoading(false)
    }
  }

  // Handler for filter updates
  const handleFilteredData = (filteredData: any) => {
    setTimeLogData(filteredData)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SignatureStatusFilters onFilterApplied={handleFilteredData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <SignatureStatusTable data={timeLogData} isLoading={isLoading} />
      </Grid>
    </Grid>
  )
}

export default SignatureDetails

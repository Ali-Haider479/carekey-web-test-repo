'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import SignatureStatusTable from './SignatureStatusTable'
import SignatureStatusFilters from './SignatureStatusFilters'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { transformTimesheetDataTwo } from '@/utils/transform'
import CustomAlert from '@/@core/components/mui/Alter'

// Component Imports

const SignatureDetails = () => {
  // Shared state for the filtered data
  const [timeLogData, setTimeLogData] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()

  // Initial data fetch
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log`)
      console.log('timeLogData', response.data)

      // setTimeLogData(response.data.filter((item: any) => item.clockOut != null))
      setTimeLogData(transformTimesheetDataTwo(response.data.filter((item: any) => item.clockOut != null)))

      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setIsLoading(false)
    }
  }

  // Handler for filter updates
  const handleFilteredData = (filteredData: any) => {
    // setTimeLogData(filteredData)
    if (filteredData.length === 0) {
      setAlertOpen(true)
      setAlertProps({
        message: 'User not found in the data.',
        severity: 'error'
      })
      return
    }
    setTimeLogData(transformTimesheetDataTwo(filteredData))
  }

  return (
    <Grid container spacing={6}>
      <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
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

'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import EvvActiveUserTable from './EvvActiveUserTable'
import ActiveUserMapView from './ActiveUserMapView'
import axios from 'axios'
import { useEffect, useState } from 'react'
import api from '@/utils/api'

// Component Imports

const EvvActiveUser = () => {
  // Shared state for the filtered data
  const [timeLogData, setTimeLogData] = useState<any>([])
  const [payPeriod, setPayperiod] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)

  // // Initial data fetch
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const response = await api.get(`/time-log/active-timelogs`)
      setTimeLogData(response.data)
      setPayperiod(response?.data[0]?.payPeriodHistory)
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
      {timeLogData.length ? (
        <Grid size={{ xs: 12 }}>
          <ActiveUserMapView
            timeLogData={timeLogData?.filter(
              (data: any) =>
                !data.isCommunityVisit && // Existing condition
                data.startLocation != null // New condition to filter out null or undefined startLocation
            )}
          />
        </Grid>
      ) : (
        ''
      )}
      <Grid size={{ xs: 12 }}>
        <EvvActiveUserTable
          timeLogData={timeLogData}
          isLoading={isLoading}
          payPeriod={payPeriod}
          fetchInitialData={fetchInitialData}
        />
      </Grid>
    </Grid>
  )
}

export default EvvActiveUser

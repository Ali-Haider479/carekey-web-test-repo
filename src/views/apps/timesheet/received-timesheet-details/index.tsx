'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import ReceivedTimesheetTable from './ReceivedTimesheetTable'
import ReceivedTimesheetFilters from './ReceivedTimesheetFilters'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { transformTimesheetData } from '@/utils/transformExpandableData'
import { transformTimesheetDataTwo } from '@/utils/transform'
import CustomAlert from '@/@core/components/mui/Alter'
import api from '@/utils/api'

// Component Imports

const ReceivedTimsesheetDetails = () => {
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
      const response = await api.get(`/time-log`)
      console.log('timeLogData', response.data)

      setTimeLogData(
        response?.data?.length > 0
          ? transformTimesheetDataTwo(response.data.filter((item: any) => item.clockOut != null))
          : []
      )
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
    <Grid>
      <CustomAlert
        AlertProps={alertProps}
        openAlert={alertOpen}
        setOpenAlert={setAlertOpen}
        style={{
          padding: 0 // Only these styles will be applied
        }}
      />
      <Grid size={{ xs: 12 }}>
        <ReceivedTimesheetFilters onFilterApplied={handleFilteredData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ReceivedTimesheetTable data={timeLogData} isLoading={isLoading} fetchInitialData={fetchInitialData} />
      </Grid>
    </Grid>
  )
}

export default ReceivedTimsesheetDetails

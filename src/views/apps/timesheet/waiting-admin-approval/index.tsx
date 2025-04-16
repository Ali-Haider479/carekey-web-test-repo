'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import WaitingAdminApprovalTable from './WaitingAdminApprovalTable'
import AdminApprovalFilters from './AdminApprovalFilters'
import CustomAlert from '@/@core/components/mui/Alter'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { transformTimesheetDataTwo } from '@/utils/transform'
import api from '@/utils/api'

// Component Imports

const AdminApprovalDetails = () => {
  const [timeLogData, setTimeLogData] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const response = await api.get(`/time-log`)
      console.log('timeLogData', response.data)

      // setTimeLogData(response.data.filter((item: any) => item.clockOut != null))
      // setTimeLogData(transformTimesheetDataTwo(response.data.filter((item: any) => item.clockOut != null)))
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
      <CustomAlert
        AlertProps={alertProps}
        openAlert={alertOpen}
        setOpenAlert={setAlertOpen}
        style={{
          padding: 0 // Only these styles will be applied
        }}
      />
      <Grid size={{ xs: 12 }}>
        <AdminApprovalFilters onFilterApplied={handleFilteredData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <WaitingAdminApprovalTable data={timeLogData} isLoading={isLoading} />
      </Grid>
    </Grid>
  )
}

export default AdminApprovalDetails

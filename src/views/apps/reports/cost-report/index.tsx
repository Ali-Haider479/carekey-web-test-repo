'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import CostReportFilters from './CostReportFilters'
import CostReportTable from './CostReportTable'
import api from '@/utils/api'
import { useEffect, useState } from 'react'

// Component Imports

const CostReport = () => {
  const [serviceData, setServiceData] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(false)

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const handleFilteredData = (accountStatus: any) => {
    setServiceData(accountStatus)
  }

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/reports/${authUser?.tenant?.id}/service-cost`)
      console.log('Initial Cost Data:', response.data)
      setServiceData(response.data)
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CostReportFilters onFilterApplied={handleFilteredData} />
        <CostReportTable serviceData={serviceData} loading={loading} />
      </Grid>
    </Grid>
  )
}

export default CostReport

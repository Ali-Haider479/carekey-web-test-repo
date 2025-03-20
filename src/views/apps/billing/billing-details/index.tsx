'use client'
// MUI Imports
import Grid from '@mui/material/Grid2'
import BillingDetailTable from './BillingDetailTable'
import BillingDetailFilters from './BillingDetailFilters'
import { transformBillingData } from '@/utils/transformBillingData'
import axios from 'axios'
import { useEffect, useState } from 'react'

// Component Imports

const BillingDetails = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [billingData, setBillingData] = useState<any[]>([])

  useEffect(() => {
    getBillingDetails()
  }, [])

  const getBillingDetails = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log/billing`)
      setBillingData(transformBillingData(response.data))
      // setFilteredData(transformTimesheetDataTwo(response.data))
    } catch (error) {
      console.error('Error fetching data', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilteredData = (filterData: any) => {
    setBillingData(filterData)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <BillingDetailFilters onFilterApplied={handleFilteredData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <BillingDetailTable data={billingData} />
      </Grid>
    </Grid>
  )
}

export default BillingDetails

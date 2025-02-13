'use client'
// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import TenantListTable from './TenantListTable'
import TenantListCards from './TenantListCards'
import { useEffect, useState } from 'react'
import axios from 'axios'

const TenantList = () => {
  const [tenantFilteredList, setTenantFilteredList] = useState<any>([])

  //   const fetchInitialData = async () => {
  //     try {
  //       const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tenant`)
  //       setTenantFilteredList(response.data)
  //     } catch (error) {
  //       console.error('Error fetching initial data:', error)
  //     }
  //   }

  //   useEffect(() => {
  //       fetchInitialData()
  //     }, [])

  //     const handleFilteredData = (filteredData: any) => {
  //         setTenantFilteredList(filteredData)
  //     }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <TenantListCards />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TenantListTable />
      </Grid>
    </Grid>
  )
}

export default TenantList

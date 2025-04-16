'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import TenantDetails from './TenantDetails'
import TenantPlan from './TenantPlan'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation'
import api from '@/utils/api'

const TenantLeftOverview = () => {
  const { id } = useParams()
  const [tenantData, setTenantData] = useState<any>([])

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const response = await api.get(`/tenant/${id}`)
        const data = response.data
        setTenantData(data)
      } catch (error) {
        console.error('Error fetching tenant data:', error)
      }
    }
    fetchTenantData()
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <TenantDetails tenantData={tenantData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TenantPlan tenantData={tenantData} />
      </Grid>
    </Grid>
  )
}

export default TenantLeftOverview

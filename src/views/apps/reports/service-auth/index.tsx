'use client'
import { Grid2 as Grid } from '@mui/material'
import ServiceAuthTable from './ServiceAuthTable'
import ServiceAuthFilters from './ServiceAuthFilters'
import api from '@/utils/api'
import { useEffect, useState } from 'react'

const ServiceAuth = () => {
  const [serviceAuthData, setServiceAuthData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const fetchServiceAuthData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/reports/service-auth/${authUser?.tenant?.id}`)
      setServiceAuthData(response.data)
    } catch (error) {
      console.error('Error fetching service auth data:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchServiceAuthData()
  }, [])

  const handleFilteredData = (accountStatus: any) => {
    setServiceAuthData(accountStatus)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ServiceAuthFilters onFilterApplied={handleFilteredData} />
        <ServiceAuthTable serviceAuthData={serviceAuthData} loading={loading} />
      </Grid>
    </Grid>
  )
}

export default ServiceAuth

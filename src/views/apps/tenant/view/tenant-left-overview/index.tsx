'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import TenantDetails from './TenantDetails'
import TenantPlan from './TenantPlan'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import api from '@/utils/api'
import { useSession } from 'next-auth/react'
import { useDispatch, useSelector } from 'react-redux'
import { selectPlan, setPlan } from '@/redux-store/slices/plan'

const TenantLeftOverview = () => {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const { data: session, update } = useSession()
  const [tenantData, setTenantData] = useState<any>([])
  const dispatch = useDispatch()

  const plan = useSelector(selectPlan)

  const fetchTenantData = async () => {
    try {
      const response = await api.get(`/tenant/${id}`)
      const data = response.data
      console.log('Tenant Data fetched---', data)
      setTenantData(data)
      return data // Return for use in session update
    } catch (error) {
      console.error('Error fetching tenant data:', error)
    }
  }

  useEffect(() => {
    fetchTenantData()
  }, [id, session]) // Initial fetch on mount or id change

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      const handlePostSubscription = async () => {
        console.log('Handling post-subscription session update')
        const updatedTenant = await fetchTenantData() // Refetch tenant data
        if (updatedTenant) {
          const newPlan = updatedTenant.subscribedPlan // Adjust based on your data structure, e.g., updatedTenant.stripePayments[0]?.planType or similar
          await update({ subscribedPlan: newPlan?.planName }) // Update session with new plan
          dispatch(setPlan(newPlan))
        }
      }
      handlePostSubscription()
    }
  }, [searchParams, id]) // Rerun when search params or id change

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

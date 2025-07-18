// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { PricingPlanType } from '@/types/pages/pricingTypes'

// Component Imports
import UserLeftOverview from '@/views/apps/user/view/user-left-overview'
import UserRight from '@/views/apps/user/view/user-right'
import TenantLeftOverview from '@/views/apps/tenant/view/tenant-left-overview'
import TenantRight from '@/views/apps/tenant/view/tenant-right'

// Data Imports
import { getPricingData } from '@/app/server/actions'

// const OverViewTab = dynamic(() => import('@/views/apps/user/view/user-right/overview'))
// const SecurityTab = dynamic(() => import('@/views/apps/user/view/user-right/security'))
// const BillingPlans = dynamic(() => import('@/views/apps/user/view/user-right/billing-plans'))
// const NotificationsTab = dynamic(() => import('@/views/apps/user/view/user-right/notifications'))
// const ConnectionsTab = dynamic(() => import('@/views/apps/user/view/user-right/connections'))
const TenantOverViewTab = dynamic(() => import('@/views/apps/tenant/view/tenant-right/overview'))
const TenantSecurityTab = dynamic(() => import('@/views/apps/tenant/view/tenant-right/security'))
const TenantBillingPlans = dynamic(() => import('@/views/apps/tenant/view/tenant-right/billing-plans'))
const TenantNotificationsTab = dynamic(() => import('@/views/apps/tenant/view/tenant-right/notifications'))
const TenantConfigurationsTab = dynamic(() => import('@/views/apps/tenant/view/tenant-right/configurations'))

// Vars
const tabContentList = (data?: PricingPlanType[]): { [key: string]: ReactElement } => ({
  overview: <TenantOverViewTab />,
  security: <TenantSecurityTab />,
  'billing-plans': <TenantBillingPlans data={data} />,
  notifications: <TenantNotificationsTab />,
  configurations: <TenantConfigurationsTab />
})

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/pages/pricing` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getPricingData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/pages/pricing`)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
} */

const TenantViewTab = async () => {
  // Vars
  const data = await getPricingData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <TenantLeftOverview />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <TenantRight tabContentList={tabContentList(data)} />
      </Grid>
    </Grid>
  )
}

export default TenantViewTab

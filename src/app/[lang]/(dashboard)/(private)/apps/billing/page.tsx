// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import TimesheetView from '@views/apps/timesheet'
import BillingTabsView from '@/views/apps/billing'

const BillingDetails = dynamic(() => import('@/views/apps/billing/billing-details'))
const BillingOverview = dynamic(() => import('@/views/apps/billing/billing-overview'))
const SubmittedBatch = dynamic(() => import('@/views/apps/billing/saved-batch'))
const SavedBatch = dynamic(() => import('@/views/apps/billing/saved-batch'))

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  'billing-details': <BillingDetails />,
  'billing-overview': <BillingOverview />,
  'submitted-batch': <SubmittedBatch />,
  'saved-batch': <SavedBatch />
})

const BillingView = () => {
  return <BillingTabsView tabContentList={tabContentList()} />
}

export default BillingView

// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import ReportsView from '@views/apps/reports'

const CostReport = dynamic(() => import('@/views/apps/reports/cost-report'))
const RemittanceReport = dynamic(() => import('@/views/apps/reports/remittance-report'))
const ServiceAuthReport = dynamic(() => import('@/views/apps/reports/service-auth'))
const FinancialSummary = dynamic(() => import('@/views/apps/reports/financial-summary'))
const CustomReport = dynamic(() => import('@/views/apps/reports/custom-report'))
const Schedule = dynamic(() => import('@/views/apps/reports/schedule-report'))

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  'cost-report': <CostReport />,
  'remittance-report': <RemittanceReport />,
  'service-auth-report': <ServiceAuthReport />,
  'financial-summary': <FinancialSummary />,
  'custom-report': <CustomReport />,
  'schedule-report': <Schedule />
})

const ReportsViewApp = () => {
  return <ReportsView tabContentList={tabContentList()} />
}

export default ReportsViewApp

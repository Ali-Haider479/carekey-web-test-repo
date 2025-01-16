// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import ReportsView from '@views/apps/reports'

const CaregiverList = dynamic(() => import('@/views/apps/reports/caregiver-list'))
const ClientList = dynamic(() => import('@/views/apps/reports/client-list'))

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
    'caregiver-list': <CaregiverList />,
    'client-list': <ClientList />,
})

const ReportsViewApp = () => {
    return <ReportsView tabContentList={tabContentList()} />
}

export default ReportsViewApp

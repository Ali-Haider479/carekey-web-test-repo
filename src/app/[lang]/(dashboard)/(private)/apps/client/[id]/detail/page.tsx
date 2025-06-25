// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import ClientDetails from '@/views/apps/client/view/details'

const ProfileTab = dynamic(() => import('@/views/apps/client/view/details/profile'))
const E_DocTab = dynamic(() => import('@/views/apps/client/view/details/e-doc'))
const ServicesTab = dynamic(() => import('@/views/apps/client/view/details/services'))
const FormsTab = dynamic(() => import('@/views/apps/client/view/details/forms'))
const AccHistoryTab = dynamic(() => import('@/views/apps/client/view/details/account-history'))
const TimeSheetsTab = dynamic(() => import('@/views/apps/client/view/details/time-sheets'))
const ServiceAuthorizationTab = dynamic(() => import('@/views/apps/client/view/details/service-authorization'))
const IncidentsTab = dynamic(() => import('@/views/apps/client/view/details/incidents'))
const CarePlanTab = dynamic(() => import('@/views/apps/client/view/details/care-plan'))

// Vars
const tabContentList = () => ({
  profile: <ProfileTab />,
  'e-doc': <E_DocTab />,
  services: <ServicesTab />,
  forms: <FormsTab />,
  'account-history': <AccHistoryTab />,
  'time-sheets': <TimeSheetsTab />,
  'service-authorization': <ServiceAuthorizationTab />,
  incidents: <IncidentsTab />,
  'care-plan': <CarePlanTab />
})

const ClientViewTab = () => {
  return (
    <div>
      <ClientDetails tabContentList={tabContentList()} />
    </div>
  )
}

export default ClientViewTab

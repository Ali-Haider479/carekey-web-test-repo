// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Data Imports
import BottomBody from '@/views/apps/caregiver/view/bottom-body'
import TopHeader from '@/views/apps/caregiver/view/top-header'

const CaregiverProfileTab = dynamic(() => import('@/views/apps/caregiver/view/bottom-body/profile'))
const CaregiverEDocTab = dynamic(() => import('@/views/apps/caregiver/view/bottom-body/e-doc'))
const CaregiverFormsTab = dynamic(() => import('@/views/apps/caregiver/view/bottom-body/forms'))
const CaregiverAccHistoryTab = dynamic(() => import('@/views/apps/caregiver/view/bottom-body/account-history'))
const CaregiverAssignedServiceTab = dynamic(() => import('@/views/apps/caregiver/view/bottom-body/assigned-service'))
const CaregiverTimeLogTab = dynamic(() => import('@/views/apps/caregiver/view/bottom-body/time-log'))
const CaregiverScheduleTab = dynamic(() => import('@/views/apps/caregiver/view/bottom-body/schedule'))

// Vars
const tabContentList = () => ({
  profile: <CaregiverProfileTab />,
  'e-doc': <CaregiverEDocTab />,
  forms: <CaregiverFormsTab />,
  'account-history': <CaregiverAccHistoryTab />,
  'assigned-service': <CaregiverAssignedServiceTab />,
  'time-log': <CaregiverTimeLogTab />,
  schedule: <CaregiverScheduleTab />
})

const CareGiverViewTab = async () => {
  return (
    <div>
      <div>
        <TopHeader />
      </div>
      <div className='mt-5'>
        <BottomBody tabContentList={tabContentList()} />
      </div>
    </div>
  )
}

export default CareGiverViewTab

// React Imports
'use client'
import { useState, type ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Data Imports
import BottomBody from '@/views/apps/caregiver/view/bottom-body'
import TopHeader from '@/views/apps/caregiver/view/top-header'
import { Typography } from '@mui/material'

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
  const [parentTab, setParentTab] = useState('profile')

  // Optional: Create a function to convert your tab key into a heading
  const getTabHeading = (tabKey: string) => {
    switch (tabKey) {
      case 'profile':
        return 'Caregiver - Profile'
      case 'e-doc':
        return 'Caregiver - Electronic Documents'
      case 'forms':
        return 'Caregiver - Submitted Form'
      case 'account-history':
        return 'Caregiver - Account History'
      case 'assigned-service':
        return 'Caregiver - Assigned Services'
      case 'time-log':
        return 'Caregiver - Time Log'
      case 'schedule':
        return 'Caregiver - Schedule'
      default:
        return 'Caregiver'
    }
  }

  return (
    <div>
      <div>
        <Typography variant='h4' gutterBottom>
          {getTabHeading(parentTab)}
        </Typography>
      </div>
      <div>
        <TopHeader />
      </div>
      <div className='mt-5'>
        <BottomBody tabContentList={tabContentList()} onTabChange={activeTab => setParentTab(activeTab)} />
      </div>
    </div>
  )
}

export default CareGiverViewTab

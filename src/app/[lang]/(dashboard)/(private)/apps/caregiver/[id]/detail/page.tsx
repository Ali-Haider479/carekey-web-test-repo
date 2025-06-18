'use client'
// Next Imports
import dynamic from 'next/dynamic'

// Data Imports
import CaregiverDetails from '@/views/apps/caregiver/view/details'
import CG_Documents from '@/views/apps/caregiver/view/details/documents'

const CaregiverProfileTab = dynamic(() => import('@/views/apps/caregiver/view/details/profile'))
const CaregiverAccHistoryTab = dynamic(() => import('@/views/apps/caregiver/view/details/account-history'))
const CaregiverAssignedServiceTab = dynamic(() => import('@/views/apps/caregiver/view/details/assigned-service'))
const CaregiverTimeLogTab = dynamic(() => import('@/views/apps/caregiver/view/details/time-log'))
const CaregiverScheduleTab = dynamic(() => import('@/views/apps/caregiver/view/details/schedule'))

// Vars
const tabContentList = () => ({
  profile: (props: any) => <CaregiverProfileTab {...props} />,
  'account-history': (props: any) => <CaregiverAccHistoryTab {...props} />,
  'assigned-service': (props: any) => <CaregiverAssignedServiceTab {...props} />,
  'time-log': (props: any) => <CaregiverTimeLogTab {...props} />,
  schedule: (props: any) => <CaregiverScheduleTab {...props} />,
  documents: (props: any) => <CG_Documents {...props} />
})

const CareGiverViewTab = () => {
  // Optional: Create a function to convert your tab key into a heading

  return (
    <div>
      <CaregiverDetails tabContentList={tabContentList()} />
    </div>
  )
}

export default CareGiverViewTab

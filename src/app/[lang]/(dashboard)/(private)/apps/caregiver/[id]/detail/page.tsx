// Next Imports
import dynamic from 'next/dynamic'

// Data Imports
import CaregiverDetails from '@/views/apps/caregiver/view/details'

const CaregiverProfileTab = dynamic(() => import('@/views/apps/caregiver/view/details/profile'))
const CaregiverAccHistoryTab = dynamic(() => import('@/views/apps/caregiver/view/details/account-history'))
const CaregiverAssignedServiceTab = dynamic(() => import('@/views/apps/caregiver/view/details/assigned-service'))
const CaregiverTimeLogTab = dynamic(() => import('@/views/apps/caregiver/view/details/time-log'))
const CaregiverScheduleTab = dynamic(() => import('@/views/apps/caregiver/view/details/schedule'))

// Vars
const tabContentList = () => ({
  profile: <CaregiverProfileTab />,
  'account-history': <CaregiverAccHistoryTab />,
  'assigned-service': <CaregiverAssignedServiceTab />,
  'time-log': <CaregiverTimeLogTab />,
  schedule: <CaregiverScheduleTab />
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

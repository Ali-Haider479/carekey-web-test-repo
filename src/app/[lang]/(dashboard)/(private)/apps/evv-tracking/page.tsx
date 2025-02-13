// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import EvvView from '@/views/apps/evv'

const EvvCompletedShifts = dynamic(() => import('@/views/apps/evv/completed-shifts'))
const EvvActiveUser = dynamic(() => import('@/views/apps/evv/active-user'))
const EvvMissedShifts = dynamic(() => import('@/views/apps/evv/missed-shifts'))

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  'completed-shifts': <EvvCompletedShifts />,
  'active-users': <EvvActiveUser />,
  'missed-shifts': <EvvMissedShifts />
})

const EvvTrackingViewApp = () => {
  return <EvvView tabContentList={tabContentList()} />
}

export default EvvTrackingViewApp

// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import TimesheetView from '@views/apps/timesheet'

const SignatureDetails = dynamic(() => import('@/views/apps/timesheet/signature-details'))
const AdminApprovalDetails = dynamic(() => import('@views/apps/timesheet/waiting-admin-approval'))
const LogsApprovalDetails = dynamic(() => import('@/views/apps/timesheet/waiting-logs-approval'))
const ReceivedTimsesheetDetails = dynamic(() => import('@/views/apps/timesheet/received-timesheet-details'))
const ManualTimesheetPage = dynamic(() => import('@/views/apps/timesheet/manual-timesheet'))

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  'signature-status': <SignatureDetails />,
  'received-timesheet': <ReceivedTimsesheetDetails />,
  'waiting-admin-approval': <AdminApprovalDetails />,
  'waiting-logs-approval': <LogsApprovalDetails />,
  'manual-timesheet': <ManualTimesheetPage />
})

const TimesheetsViewApp = () => {
  return <TimesheetView tabContentList={tabContentList()} />
}

export default TimesheetsViewApp

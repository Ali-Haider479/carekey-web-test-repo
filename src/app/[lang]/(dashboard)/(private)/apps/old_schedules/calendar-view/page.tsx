// Data Imports
import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import ScheduleCalendarWrapper from '@/views/apps/old_schedule/calendar-view/ScheduleCalendarWrapper'
// import CalendarView from '@/views/apps/schedule/view'
import { Card } from '@mui/material'

const CalendarViewApp = async () => {
  return (
    <AppFullCalendar className='app-calendar'>
      <ScheduleCalendarWrapper />
    </AppFullCalendar>
  )
}

export default CalendarViewApp

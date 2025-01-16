// Data Imports
import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import ScheduleCalendarWrapper from '@/views/apps/schedule/calendar-view/ScheduleCalendarWrapper'
// import CalendarView from '@/views/apps/schedule/view'
import { Card } from '@mui/material'

const CalendarViewApp = async () => {
    return (
        <Card className='overflow-visible'>
            <AppFullCalendar className='app-calendar'>
                <ScheduleCalendarWrapper />
            </AppFullCalendar>
        </Card>
    )
}

export default CalendarViewApp

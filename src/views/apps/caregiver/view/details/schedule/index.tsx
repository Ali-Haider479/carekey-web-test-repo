'use client'
import React from 'react'
import { Card } from '@mui/material'
import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import ScheduleCalendarWrapper from './ScheduleCalendarWrapper'

const Schedule = () => {
  return (
    <div>
      <Card className='overflow-visible'>
        <AppFullCalendar className='app-calendar'>
          <ScheduleCalendarWrapper />
        </AppFullCalendar>
      </Card>
    </div>
  )
}

export default Schedule

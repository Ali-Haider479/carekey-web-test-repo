'use client'
import React, { useEffect } from 'react'
import ScheduleCalendar from './ScheduleCalendar'
import { Card } from '@mui/material'
import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import ScheduleCalendarWrapper from './ScheduleCalendarWrapper'
import axios from 'axios'
import { useParams } from 'next/navigation'

const Schedule = () => {
  const { id } = useParams()

  const fetchCaregiverSchedule = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/schedule/caregiver/${id}`)
      console.log('Caregiver Schedule Data --> ', response)
    } catch (error) {
      console.error('error fetching data: ', error)
    }
  }

  useEffect(() => {
    fetchCaregiverSchedule()
  }, [])

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

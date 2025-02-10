'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { Card, useMediaQuery } from '@mui/material'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import { useDispatch, useSelector } from 'react-redux'

// Type Imports
import type { CalendarColors, CalendarType } from '@/types/apps/calendarTypes'

// Component Imports
import ScheduleCalendar from './ScheduleCalendar'
import ScheduleSidebarLeft from './ScheduleSidebarLeft'
import AddScheduleSidebar from './AddScheduleSidebar'
import { fetchEvents, filterCaregiverSchedules, filterClientSchedules } from '@/redux-store/slices/calendar'
import axios from 'axios'
import { useAppDispatch } from '@/hooks/useDispatch'
import CalenderFilters from './CalenderFilters'

// CalendarColors Object
const calendarsColor: CalendarColors = {
  Personal: 'error',
  Business: 'primary',
  Family: 'warning',
  Holiday: 'success',
  ETC: 'info'
}

const AppCalendar = () => {
  // States
  const [calendarApi, setCalendarApi] = useState<null | any>(null)
  const [caregiverList, setCaregiverList] = useState<[] | any>([])
  const [clientList, setClientList] = useState<[] | any>([])
  const [serviceList, setServiceList] = useState<[] | any>([])
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState<boolean>(false)
  const [isClient, setIsClient] = useState<boolean>(false)

  // Hooks
  const dispatch = useAppDispatch()
  const calendarStore = useSelector((state: { calendarReducer: CalendarType }) => state.calendarReducer)
  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)

  useEffect(() => {
    dispatch(fetchEvents())
  }, [dispatch])

  const filterEvent = (value: any, label: any) => {
    console.log('filter value --> ', value, label)
    if (label.includes('caregiver')) {
      console.log('Inside caregiver')
      dispatch(filterCaregiverSchedules(value))
      setIsClient(false)
    } else if (label.includes('client')) {
      console.log('inside client')
      dispatch(filterClientSchedules(value))
      setIsClient(true)
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        const response = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregivers`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/service`)
        ])
        setCaregiverList(response[0].data)
        setClientList(response[1].data)
        setServiceList(response[2].data)
      } catch (error) {
        console.log('ERROR', error)
      }
    })()
  }, [])

  return (
    <div className='flex flex-col w-full'>
      <Card className='p-5 mb-5'>
        <CalenderFilters filterEvent={filterEvent} />
      </Card>
      <Card className='flex w-full'>
        <ScheduleSidebarLeft
          mdAbove={mdAbove}
          dispatch={dispatch}
          calendarApi={calendarApi}
          calendarStore={calendarStore}
          calendarsColor={calendarsColor}
          leftSidebarOpen={leftSidebarOpen}
          handleLeftSidebarToggle={handleLeftSidebarToggle}
          handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        />
        <div className='p-6 pbe-0 flex-grow overflow-visible bg-backgroundPaper rounded'>
          <ScheduleCalendar
            dispatch={dispatch}
            calendarApi={calendarApi}
            // calendarStore={calendarStore}
            setCalendarApi={setCalendarApi}
            calendarsColor={calendarsColor}
            handleLeftSidebarToggle={handleLeftSidebarToggle}
            handleAddEventSidebarToggle={handleAddEventSidebarToggle}
          />
        </div>
        <AddScheduleSidebar
          dispatch={dispatch}
          calendarApi={calendarApi}
          calendarStore={calendarStore}
          addEventSidebarOpen={addEventSidebarOpen}
          handleAddEventSidebarToggle={handleAddEventSidebarToggle}
          caregiverList={caregiverList}
          clientList={clientList}
          serviceList={serviceList}
        />
      </Card>
    </div>
  )
}

export default AppCalendar

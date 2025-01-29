'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { useMediaQuery } from '@mui/material'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import { useDispatch, useSelector } from 'react-redux'

// Type Imports
import type { CalendarColors, CalendarType } from '@/types/apps/calendarTypes'

// Component Imports
import ScheduleCalendar from './ScheduleCalendar'
import ScheduleSidebarLeft from './ScheduleSidebarLeft'
import AddScheduleSidebar from './AddScheduleSidebar'
import { fetchEvents } from '@/redux-store/slices/calendar'
import axios from 'axios'
import { useParams } from 'next/navigation'

// CalendarColors Object
const calendarsColor: CalendarColors = {
  Personal: 'error',
  Business: 'primary',
  Family: 'warning',
  Holiday: 'success',
  ETC: 'info'
}

const AppCalendar = () => {
  const { id } = useParams()
  // States
  const [calendarApi, setCalendarApi] = useState<null | any>(null)
  const [caregiverList, setCaregiverList] = useState<[] | any>([])
  const [clientList, setClientList] = useState<[] | any>([])
  const [serviceList, setServiceList] = useState<[] | any>([])
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState<boolean>(false)

  // Hooks
  const dispatch = useDispatch()
  const calendarStore = useSelector((state: { calendarReducer: CalendarType }) => state.calendarReducer)
  const CurrentCaregiverCalenderEvents = calendarStore.events.filter((item: any) => item.caregiver.id == id)
  console.log(CurrentCaregiverCalenderEvents)
  const CurrentCaregiverFilteredEvents = calendarStore.filteredEvents.filter((item: any) => item.caregiver.id == id)
  console.log(CurrentCaregiverFilteredEvents)
  const CaregiverCalenderStore = {
    ...calendarStore,
    events: CurrentCaregiverCalenderEvents,
    filteredEvents: CurrentCaregiverFilteredEvents
  }

  console.log('Calender store data', calendarStore)
  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)

  useEffect(() => {
    dispatch(fetchEvents())
  }, [dispatch])

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
    <>
      <ScheduleSidebarLeft
        mdAbove={mdAbove}
        dispatch={dispatch}
        calendarApi={calendarApi}
        calendarStore={CaregiverCalenderStore}
        calendarsColor={calendarsColor}
        leftSidebarOpen={leftSidebarOpen}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
      />
      <div className='p-6 pbe-0 flex-grow overflow-visible bg-backgroundPaper rounded'>
        <ScheduleCalendar
          dispatch={dispatch}
          calendarApi={calendarApi}
          calendarStore={CaregiverCalenderStore}
          setCalendarApi={setCalendarApi}
          calendarsColor={calendarsColor}
          handleLeftSidebarToggle={handleLeftSidebarToggle}
          handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        />
      </div>
      <AddScheduleSidebar
        dispatch={dispatch}
        calendarApi={calendarApi}
        calendarStore={CaregiverCalenderStore}
        addEventSidebarOpen={addEventSidebarOpen}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        caregiverList={caregiverList}
        clientList={clientList}
        serviceList={serviceList}
      />
    </>
  )
}

export default AppCalendar

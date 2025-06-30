'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { CircularProgress, useMediaQuery } from '@mui/material'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import { useSelector } from 'react-redux'

// Type Imports
import type { CalendarColors, CalendarType } from '@/types/apps/calendarTypes'

// Component Imports
import ScheduleCalendar from './ScheduleCalendar'
import ScheduleSidebarLeft from './ScheduleSidebarLeft'
import AddScheduleSidebar from './AddScheduleSidebar'
import {
  addEvent,
  fetchEvents,
  filterCaregiverSchedules,
  filterEvents,
  updateEvent
} from '@/redux-store/slices/calendar'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { useAppDispatch } from '@/hooks/useDispatch'
import api from '@/utils/api'

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
  const [currentCaregiverData, setCurrentCaregiverData] = useState<any>()
  // const [caregiverList, setCaregiverList] = useState<[] | any>([])
  // const [clientList, setClientList] = useState<[] | any>([])
  // const [serviceList, setServiceList] = useState<[] | any>([])
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState<boolean>(false)
  const [isEdited, setIsEdited] = useState<boolean>(false)
  const [localEvents, setLocalEvents] = useState<any[]>([])
  const [filteredEvents, setFilteredEvents] = useState<any>([])
  const [payPeriod, setPayPeriod] = useState<[] | any>([])

  // Hooks
  const dispatch = useAppDispatch()
  const calendarStore = useSelector((state: { calendarReducer: CalendarType }) => state.calendarReducer)

  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)

  const isEditedOn = () => setIsEdited(true)
  const isEditedOff = () => setIsEdited(false)

  useEffect(() => {
    const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
    ;(async () => {
      try {
        const response = await Promise.all([
          api.get(`/caregivers/${id}`),
          // api.get(`/user/clientUsers/${id}`),
          api.get(`/pay-period/tenant/${authUser?.tenant?.id}`)
        ])
        // setCaregiverList(response[0].data)
        setCurrentCaregiverData(response[0].data)
        // setClientList(response[1].data)
        setPayPeriod(response[1].data)
      } catch (error) {
        console.log('ERROR', error)
      }
    })()
  }, [])

  useEffect(() => {
    if (calendarStore.events.length > 0 && localEvents.length < calendarStore.events.length) {
      setLocalEvents(calendarStore.events)
      const filteredEvents = calendarStore.events.filter((item: any) => item.caregiver?.id == id)
      setFilteredEvents({ caregiverEvents: filteredEvents })
    }
  }, [calendarStore.events])

  const handleAddEvent = (newEvent: any[]) => {
    if (!Array.isArray(newEvent)) {
      return
    }
    setLocalEvents(prevEvents => [...(prevEvents || []), ...newEvent])

    setFilteredEvents((prevFilteredEvents: { caregiverEvents: any[] }) => {
      return {
        ...prevFilteredEvents,
        caregiverEvents: [...(prevFilteredEvents.caregiverEvents || []), ...newEvent]
      }
    })

    dispatch(addEvent(newEvent))
  }

  const handleUpdateEvent = (updatedEvent: any) => {
    setLocalEvents(prevEvents => prevEvents.map(event => (event.id === updatedEvent.id ? updatedEvent : event)))

    setFilteredEvents((prevFilteredEvents: { caregiverEvents: any[] }) => ({
      ...prevFilteredEvents,
      caregiverEvents: prevFilteredEvents?.caregiverEvents?.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    }))

    dispatch(updateEvent(updatedEvent))
  }

  useEffect(() => {
    if (isEdited === false) {
      dispatch(fetchEvents())
    }
  }, [isEdited])

  return currentCaregiverData ? (
    <>
      <ScheduleSidebarLeft
        mdAbove={mdAbove}
        dispatch={dispatch}
        calendarApi={calendarApi}
        calendarStore={{
          ...calendarStore,
          events: localEvents,
          caregiverEvents: filteredEvents.caregiverEvents
        }}
        calendarsColor={calendarsColor}
        leftSidebarOpen={leftSidebarOpen}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
      />
      <div className='p-6 pbe-0 flex-grow overflow-visible bg-backgroundPaper rounded'>
        <ScheduleCalendar
          dispatch={dispatch}
          calendarApi={calendarApi}
          calendarStore={{
            ...calendarStore,
            events: localEvents,
            caregiverEvents: filteredEvents.caregiverEvents
          }}
          setCalendarApi={setCalendarApi}
          calendarsColor={calendarsColor}
          handleLeftSidebarToggle={handleLeftSidebarToggle}
          handleAddEventSidebarToggle={handleAddEventSidebarToggle}
          handleIsEditedOn={isEditedOn}
        />
      </div>
      <AddScheduleSidebar
        dispatch={dispatch}
        calendarApi={calendarApi}
        calendarStore={{
          ...calendarStore,
          events: localEvents,
          caregiverEvents: filteredEvents.caregiverEvents
        }}
        addEventSidebarOpen={addEventSidebarOpen}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        // caregiverList={caregiverList}
        // clientList={clientList}
        // serviceList={serviceList}
        setIsEditedOff={isEditedOff}
        isEdited={isEdited}
        handleAddEvent={handleAddEvent}
        handleUpdateEvent={handleUpdateEvent}
        payPeriod={payPeriod}
        data={currentCaregiverData}
      />
    </>
  ) : (
    <div className='flex items-center justify-center p-10 w-full'>
      <CircularProgress />
    </div>
  )
}

export default AppCalendar

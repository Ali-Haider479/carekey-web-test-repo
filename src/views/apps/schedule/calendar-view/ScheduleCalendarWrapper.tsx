'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { Card, useMediaQuery } from '@mui/material'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import { useSelector } from 'react-redux'

// Type Imports
import type { CalendarColors, CalendarType } from '@/types/apps/calendarTypes'

// Component Imports
import ScheduleCalendar from './ScheduleCalendar'
import ScheduleSidebarLeft from './ScheduleSidebarLeft'
import AddScheduleSidebar from './AddScheduleSidebar'
import { addEvent, fetchEvents, updateEvent } from '@/redux-store/slices/calendar'
import axios from 'axios'
import { useAppDispatch } from '@/hooks/useDispatch'
import CalenderFilters from './CalenderFilters'
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
  // States
  const [calendarApi, setCalendarApi] = useState<null | any>(null)
  const [caregiverList, setCaregiverList] = useState<[] | any>([])
  const [clientList, setClientList] = useState<[] | any>([])
  const [serviceList, setServiceList] = useState<[] | any>([])
  const [payPeriod, setPayPeriod] = useState<[] | any>([])
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState<boolean>(false)
  const [isEdited, setIsEdited] = useState<boolean>(false)
  const [isClient, setIsClient] = useState<boolean>(false)
  const [localEvents, setLocalEvents] = useState<any[]>([])
  const [filteredEvents, setFilteredEvents] = useState<{ caregiverEvents: any[]; clientEvents: any[] }>({
    caregiverEvents: [],
    clientEvents: []
  })

  // Hooks
  const dispatch = useAppDispatch()
  const calendarStore = useSelector((state: { calendarReducer: CalendarType }) => state.calendarReducer)
  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const isEditedOn = () => setIsEdited(true)
  const isEditedOff = () => setIsEdited(false)

  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)
  console.log('IS Edited Schedule Calendar Wrapper:', isEdited)

  useEffect(() => {
    setLocalEvents(calendarStore.events)
  }, [calendarStore.events])

  useEffect(() => {
    if (isEdited === false) {
      console.log('Flag', isEdited)
      dispatch(fetchEvents())
    }
  }, [dispatch, isEdited])

  const filterEvent = (value: any, label: any) => {
    console.log('filter value --> ', value, label)
    if (label.includes('caregiver')) {
      console.log('Inside caregiver')
      const filtered = localEvents.filter(event => event.caregiver?.id === value)
      setFilteredEvents((prev: any) => ({ ...prev, caregiverEvents: filtered }))
      // dispatch(filterCaregiverSchedules(value))
      setIsClient(false)
    } else if (label.includes('client')) {
      console.log('inside client')
      const filtered = localEvents.filter(event => event.client?.id === value)
      setFilteredEvents((prev: any) => ({ ...prev, clientEvents: filtered }))
      // dispatch(filterClientSchedules(value))
      setIsClient(true)
    }
  }

  const handleAddEvent = (newEvent: any) => {
    setLocalEvents(prevEvents => [...prevEvents, ...newEvent])
    setFilteredEvents(prev => ({
      ...prev,
      caregiverEvents: isClient ? prev.caregiverEvents : [...(prev.caregiverEvents || []), ...newEvent],
      clientEvents: isClient ? [...(prev.clientEvents || []), ...newEvent] : prev.clientEvents
    }))
    dispatch(addEvent(newEvent))
  }

  const handleUpdateEvent = (updatedEvent: any) => {
    setLocalEvents(prevEvents => prevEvents.map(event => (event.id === updatedEvent.id ? updatedEvent : event)))
    setFilteredEvents(prev => ({
      ...prev,
      caregiverEvents: isClient
        ? prev.caregiverEvents
        : prev.caregiverEvents.map(event => (event.id === updatedEvent.id ? updatedEvent : event)),
      clientEvents: isClient
        ? prev.clientEvents.map(event => (event.id === updatedEvent.id ? updatedEvent : event))
        : prev.clientEvents
    }))
    dispatch(updateEvent(updatedEvent))
  }

  useEffect(() => {
    const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
    console.log('LOGGED USER', authUser)
    ;(async () => {
      try {
        const response = await Promise.all([
          api.get(`/caregivers`),
          api.get(`/client`),
          api.get(`/service`),
          api.get(`/pay-period/tenant/${authUser?.tenant?.id}`)
        ])
        setCaregiverList(response[0].data)
        setClientList(response[1].data)
        setServiceList(response[2].data)
        setPayPeriod(response[3].data)
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
          calendarStore={{
            ...calendarStore,
            events: localEvents,
            caregiverEvents:
              isClient === false && filteredEvents?.caregiverEvents?.length > 0 ? filteredEvents.caregiverEvents : [],
            clientEvents:
              isClient === true && filteredEvents?.clientEvents?.length > 0 ? filteredEvents.clientEvents : []
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
              caregiverEvents:
                isClient === false && filteredEvents?.caregiverEvents?.length > 0 ? filteredEvents.caregiverEvents : [],
              clientEvents:
                isClient === true && filteredEvents?.clientEvents?.length > 0 ? filteredEvents.clientEvents : []
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
          calendarStore={{ ...calendarStore, events: localEvents }}
          addEventSidebarOpen={addEventSidebarOpen}
          handleAddEventSidebarToggle={handleAddEventSidebarToggle}
          caregiverList={caregiverList}
          clientList={clientList}
          serviceList={serviceList}
          setIsEditedOff={isEditedOff}
          isEdited={isEdited}
          handleAddEvent={handleAddEvent}
          handleUpdateEvent={handleUpdateEvent}
          payPeriod={payPeriod}
        />
      </Card>
    </div>
  )
}

export default AppCalendar

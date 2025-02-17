'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { useMediaQuery } from '@mui/material'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import { useSelector } from 'react-redux'

// Type Imports
import type { CalendarColors, CalendarType } from '@/types/apps/calendarTypes'

// Component Imports
import ScheduleCalendar from './ScheduleCalendar'
import ScheduleSidebarLeft from './ScheduleSidebarLeft'
import AddScheduleSidebar from './AddScheduleSidebar'
import { addEvent, fetchEvents, filterCaregiverSchedules, updateEvent } from '@/redux-store/slices/calendar'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { useAppDispatch } from '@/hooks/useDispatch'

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
  const [isEdited, setIsEdited] = useState<boolean>(false)
  const [localEvents, setLocalEvents] = useState<any[]>([])
  const [filteredEvents, setFilteredEvents] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [payPeriod, setPayPeriod] = useState<[] | any>([])

  // Hooks
  const dispatch = useAppDispatch()
  const calendarStore = useSelector((state: { calendarReducer: CalendarType }) => state.calendarReducer)

  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)

  const isEditedOn = () => setIsEdited(true)
  const isEditedOff = () => setIsEdited(false)

  console.log('IS Edited Caregiver Calendar Wrapper:', isEdited)

  console.log('Caregiver CalenderStoreItems', calendarStore)

  useEffect(() => {
    setLocalEvents(calendarStore.events)
  }, [calendarStore.events])

  // Fetch events on component mount
  useEffect(() => {
    if (isEdited === false) {
      console.log('Flag', isEdited)
      dispatch(fetchEvents())
    }
  }, [dispatch, isEdited])

  // Filter caregiver events after events are fetched
  useEffect(() => {
    if (calendarStore.events.length > 0) {
      setLoading(true) // Start loading
      dispatch(filterCaregiverSchedules(id))
      setLoading(false) // Stop loading after filtering is done
    }
  }, [id, isEdited, calendarStore.events])

  useEffect(() => {
    console.log(calendarStore.caregiverEvents)
    if (calendarStore.caregiverEvents.length > 0) {
      setFilteredEvents({ caregiverEvents: calendarStore.caregiverEvents })
    }
  }, [calendarStore.caregiverEvents, dispatch])

  useEffect(() => {
    const authUser: any = JSON.parse(localStorage.getItem('AuthUser') ?? '')
    ;(async () => {
      try {
        const response = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregivers`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/service`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pay-period/tenant/${authUser?.tenant?.id}`)
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

  const handleAddEvent = (newEvent: any) => {
    setLocalEvents(prevEvents => [...prevEvents, ...newEvent])

    setFilteredEvents((prevFilteredEvents: { caregiverEvents: any }) => ({
      ...prevFilteredEvents,
      caregiverEvents: [...prevFilteredEvents.caregiverEvents, ...newEvent]
    }))

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

  return (
    <>
      <ScheduleSidebarLeft
        mdAbove={mdAbove}
        dispatch={dispatch}
        calendarApi={calendarApi}
        calendarStore={{
          ...calendarStore,
          events: localEvents,
          caregiverEvents: filteredEvents.caregiverEvents || calendarStore.caregiverEvents
        }}
        calendarsColor={calendarsColor}
        leftSidebarOpen={leftSidebarOpen}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
      />
      <div className='p-6 pbe-0 flex-grow overflow-visible bg-backgroundPaper rounded'>
        {loading ? (
          <div>Loading events...</div>
        ) : (
          <ScheduleCalendar
            dispatch={dispatch}
            calendarApi={calendarApi}
            calendarStore={{
              ...calendarStore,
              events: localEvents,
              caregiverEvents: filteredEvents.caregiverEvents || calendarStore.caregiverEvents
            }}
            setCalendarApi={setCalendarApi}
            calendarsColor={calendarsColor}
            handleLeftSidebarToggle={handleLeftSidebarToggle}
            handleAddEventSidebarToggle={handleAddEventSidebarToggle}
            handleIsEditedOn={isEditedOn}
          />
        )}
      </div>
      <AddScheduleSidebar
        dispatch={dispatch}
        calendarApi={calendarApi}
        calendarStore={{
          ...calendarStore,
          events: localEvents,
          caregiverEvents: filteredEvents.caregiverEvents || calendarStore.caregiverEvents
        }}
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
    </>
  )
}

export default AppCalendar

// React Imports
import { useEffect, useRef, useState } from 'react'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party imports
import type { Dispatch } from '@reduxjs/toolkit'
import 'bootstrap-icons/font/bootstrap-icons.css'

import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { type CalendarOptions } from '@fullcalendar/core'

// Type Imports
import type { AddEventType, CalendarColors, CalendarType } from '@/types/apps/calendarTypes'

// Slice Imports
import {
  filterCaregiverSchedules,
  filterClientSchedules,
  filterEvents,
  selectedEvent,
  updateEvent
} from '@/redux-store/slices/calendar'
import CalenderFilters from './CalenderFilters'
import { useSelector } from 'react-redux'
import { boolean } from 'valibot'

type CalenderProps = {
  // calendarStore: CalendarType
  calendarApi: any
  setCalendarApi: (val: any) => void
  calendarsColor: CalendarColors
  dispatch: Dispatch
  handleLeftSidebarToggle: () => void
  handleAddEventSidebarToggle: () => void
}

const blankEvent: AddEventType = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    description: ''
  }
}

const ScheduleCalendar = (props: CalenderProps) => {
  // Props
  const {
    // calendarStore,
    calendarApi,
    setCalendarApi,
    calendarsColor,
    dispatch,
    handleAddEventSidebarToggle,
    handleLeftSidebarToggle
  } = props

  const calendarStore = useSelector((state: { calendarReducer: CalendarType }) => state.calendarReducer)

  // Refs
  const calendarRef = useRef()
  const theme = useTheme()

  const [isClient, setIsClient] = useState<boolean>(false)

  useEffect(() => {
    if (calendarApi === null) {
      // @ts-ignore
      setCalendarApi(calendarRef.current?.getApi())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  console.log('All events', calendarStore)

  // calendarOptions(Props)
  const calendarOptions: CalendarOptions = {
    events: calendarStore.clientEvents.length ? calendarStore.clientEvents : calendarStore.caregiverEvents,
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'sidebarToggle, prev, next, title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    views: {
      week: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
      },
      month: {
        titleFormat: { year: 'numeric', month: 'short' }
      },
      day: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
      }
    },

    /*
          Enable dragging and resizing event
          ? Docs: https://fullcalendar.io/docs/editable
        */
    editable: true,

    /*
          Enable resizing event from start
          ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
        */
    eventResizableFromStart: true,

    /*
          Automatically scroll the scroll-containers during event drag-and-drop and date selecting
          ? Docs: https://fullcalendar.io/docs/dragScroll
        */
    dragScroll: true,

    /*
          Max number of events within a given day
          ? Docs: https://fullcalendar.io/docs/dayMaxEvents
        */
    dayMaxEvents: 2,

    /*
          Determines if day names and week names are clickable
          ? Docs: https://fullcalendar.io/docs/navLinks
        */
    navLinks: true,

    eventClassNames({ event: calendarEvent }: any) {
      // @ts-ignore
      const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar]

      return [
        // Background Color
        `event-bg-${colorName}`
      ]
    },

    eventClick({ event: clickedEvent }: any) {
      dispatch(selectedEvent(clickedEvent))
      handleAddEventSidebarToggle()

      //* Only grab required field otherwise it goes in infinity loop
      //! Always grab all fields rendered by form (even if it get `undefined`)
      // event.value = grabEventDataFromEventApi(clickedEvent)
      // isAddNewEventSidebarActive.value = true
    },

    customButtons: {
      sidebarToggle: {
        icon: 'bi bi-list',
        click() {
          handleLeftSidebarToggle()
        }
      }
    },

    dateClick(info: any) {
      const ev = { ...blankEvent }

      ev.start = info.date
      ev.end = info.date
      ev.allDay = true

      dispatch(selectedEvent(ev))
      handleAddEventSidebarToggle()
    },

    /*
          Handle event drop (Also include dragged event)
          ? Docs: https://fullcalendar.io/docs/eventDrop
          ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
        */
    eventDrop({ event: droppedEvent }: any) {
      dispatch(updateEvent(droppedEvent))
      dispatch(filterEvents())
    },

    /*
          Handle event resize
          ? Docs: https://fullcalendar.io/docs/eventResize
        */
    eventResize({ event: resizedEvent }: any) {
      dispatch(updateEvent(resizedEvent))
      dispatch(filterEvents())
    },

    // @ts-ignore
    ref: calendarRef,

    direction: theme.direction
  }

  return (
    <div>
      <FullCalendar {...calendarOptions} />
    </div>
  )
}

export default ScheduleCalendar

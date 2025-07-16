// Third-party Imports
import type { Dispatch } from '@reduxjs/toolkit'
import type { EventInput } from '@fullcalendar/core'

// Type Imports
import type { ThemeColor } from '@core/types'

export type CalendarFiltersType = 'Personal' | 'Business' | 'Family' | 'Holiday' | 'ETC'

export type CalendarColors = {
  ETC: ThemeColor
  Family: ThemeColor
  Holiday: ThemeColor
  Personal: ThemeColor
  Business: ThemeColor
}

export type CalendarType = {
  events: EventInput[]
  caregiverEvents: EventInput[]
  clientEvents: EventInput[]
  filteredEvents: EventInput[]
  selectedEvent: null | any
  selectedCalendars: CalendarFiltersType[]
  selectedDate: null | string
}

export type AddEventType = Omit<EventInput, 'id'>

export type SidebarLeftProps = {
  mdAbove: boolean
  calendarApi: any
  calendarStore: CalendarType
  leftSidebarOpen: boolean
  dispatch: Dispatch
  calendarsColor: CalendarColors
  handleLeftSidebarToggle: () => void
  handleAddEventSidebarToggle: () => void
}

export type AddEventSidebarType = {
  calendarStore: CalendarType
  calendarApi: any
  dispatch: Dispatch
  addEventSidebarOpen: boolean
  handleAddEventSidebarToggle: () => void
  caregiverList?: any
  clientList?: any
  serviceList?: any
  setIsEditedOff?: () => void
  isEdited?: boolean
  handleAddEvent: (AddEvent: any) => void
  handleUpdateEvent: (updatedEvent: any) => void
  payPeriod?: any
  data?: any
  selectedDate?: any
}

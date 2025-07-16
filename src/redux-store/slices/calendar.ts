import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { EventInput } from '@fullcalendar/core'
import type { CalendarFiltersType, CalendarType } from '@/types/apps/calendarTypes'
import api from '@/utils/api'

// Define initial state
const initialState: CalendarType & { loading: boolean; error: string | null } = {
  events: [],
  caregiverEvents: [],
  clientEvents: [],
  filteredEvents: [],
  selectedEvent: null,
  selectedCalendars: ['Personal', 'Business', 'Family', 'Holiday', 'ETC'],
  loading: false,
  error: null,
  selectedDate: null
}

// Async thunk for fetching events
export const fetchEvents = createAsyncThunk('calendar/fetchEvents', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get(`/schedule`)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data || 'Failed to fetch events')
  }
})

const filterEventsUsingCheckbox = (events: EventInput[], selectedCalendars: CalendarFiltersType[]) => {
  return events.filter(event => selectedCalendars.includes(event.extendedProps?.calendar as CalendarFiltersType))
}

const filterEventsUsingCaregiverId = (events: EventInput[], caregiverId: number) => {
  console.log('redux caregiver id', caregiverId, typeof caregiverId)
  return events.filter(event => event.caregiver?.id === caregiverId)
}

const filterEventsUsingClientId = (events: EventInput[], clientId: number) => {
  console.log('redux client id', clientId, typeof clientId)
  return events.filter(event => event.client?.id === clientId)
}

export const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    filterEvents: state => {
      state.filteredEvents = state.events
    },
    addEvent: (state, action) => {
      const newEvent = {
        ...action.payload,
        id: `${parseInt(state.events[state.events.length - 1]?.id ?? '') + 1}`
      }
      state.events.push(newEvent)
    },
    updateEvent: (state, action: PayloadAction<EventInput>) => {
      state.events = state.events.map(event => {
        if (action.payload._def && event.id === action.payload._def.publicId) {
          return {
            id: event.id,
            title: action.payload._def.title,
            status: action.payload.status,
            end: action.payload._instance.range.end,
            start: action.payload._instance.range.start,
            assignedHours: action.payload.assignedHours,
            caregiver: action.payload.caregiver,
            client: action.payload.client,
            service: action.payload.service,
            notes: action.payload.notes,
            location: action.payload.location
          }
        } else if (event.id == action.payload.id) {
          return action.payload
        }
        return event
      })
    },
    deleteEvent: (state, action) => {
      state.events = state.events.filter(event => event.id !== action.payload)
    },
    selectedEvent: (state, action) => {
      state.selectedEvent = action.payload
    },
    filterCalendarLabel: (state, action) => {
      const index = state.selectedCalendars.indexOf(action.payload)
      if (index !== -1) {
        state.selectedCalendars.splice(index, 1)
      } else {
        state.selectedCalendars.push(action.payload)
      }
      state.events = filterEventsUsingCheckbox(state.filteredEvents, state.selectedCalendars)
    },
    filterAllCalendarLabels: (state, action) => {
      state.selectedCalendars = action.payload ? ['Personal', 'Business', 'Family', 'Holiday', 'ETC'] : []
      state.events = filterEventsUsingCheckbox(state.filteredEvents, state.selectedCalendars)
    },
    filterCaregiverSchedules: (state, action) => {
      const caregiverId = action.payload
      state.caregiverEvents = filterEventsUsingCaregiverId(state.filteredEvents, Number(caregiverId))
    },
    filterClientSchedules: (state, action) => {
      const clientId = action.payload
      state.clientEvents = filterEventsUsingClientId(state.filteredEvents, Number(clientId))
    },
    clearFilter: state => {
      state.clientEvents = []
      state.caregiverEvents = []
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchEvents.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false
        // Map events to check dates and set status to 'missed' if both start and end dates are in the past
        const currentDate = new Date()
        state.events = action.payload.map((event: any) => {
          const startDate = new Date(event.start)
          const endDate = event.end ? new Date(event.end) : startDate // Handle cases where end date is not provided

          // Check if both start and end dates are before the current date
          if (startDate < currentDate && endDate < currentDate && event.status === 'scheduled') {
            return { ...event, status: 'missed' }
          }
          if (event.timelog !== null && event.status === 'worked' && event.timelog.tsApprovalStatus === 'Approved') {
            return { ...event, status: 'approved' }
          }
          return event
        })
        state.filteredEvents = state.events
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  filterEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  selectedEvent,
  filterCalendarLabel,
  filterCaregiverSchedules,
  filterClientSchedules,
  filterAllCalendarLabels,
  clearFilter,
  setSelectedDate
} = calendarSlice.actions

export default calendarSlice.reducer

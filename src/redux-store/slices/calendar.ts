// Third-party Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { EventInput } from '@fullcalendar/core'
import axios from 'axios'

// Type Imports
import type { CalendarFiltersType, CalendarType } from '@/types/apps/calendarTypes'

// Define initial state
const initialState: CalendarType & { loading: boolean; error: string | null } = {
  events: [],
  filteredEvents: [],
  selectedEvent: null,
  selectedCalendars: ['Personal', 'Business', 'Family', 'Holiday', 'ETC'],
  loading: false,
  error: null
}

// Create async thunk for fetching events
// export const fetchEvents = createAsyncThunk('calendar/fetchEvents', async (_, { rejectWithValue }) => {
//   try {
//     const response = await axios.get('http://192.168.18.192:8080/schedule')

//     return response.data
//   } catch (error: any) {
//     return rejectWithValue(error.response?.data || 'Failed to fetch events')
//   }
// })

export const fetchEvents = createAsyncThunk('calendar/fetchEvents', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/schedule`)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data || 'Failed to fetch events')
  }
})

const filterEventsUsingCheckbox = (events: EventInput[], selectedCalendars: CalendarFiltersType[]) => {
  return events.filter(event => selectedCalendars.includes(event.extendedProps?.calendar as CalendarFiltersType))
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
            assinedHours: action.payload.assinedHours,
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
        state.events = action.payload
        state.filteredEvents = action.payload
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
  filterAllCalendarLabels
} = calendarSlice.actions

export default calendarSlice.reducer

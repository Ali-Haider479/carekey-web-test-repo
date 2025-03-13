'use client'
import { Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import ScheduleTableFiltersCard from './ScheduleTableFiltersCard'
import ScheduleListTable from './ScheduleListTable'
import { useEffect, useState } from 'react'
import { fetchEvents } from '@/redux-store/slices/calendar'
import { useAppDispatch } from '@/hooks/useDispatch'
import { useSelector } from 'react-redux'
import { CalendarType } from '@/types/apps/calendarTypes'

const ScheduleList = () => {
  const dispatch = useAppDispatch()
  const calendarStore = useSelector((state: { calendarReducer: CalendarType }) => state.calendarReducer)
  const { events } = calendarStore

  // Initialize filteredEvents with null or the full events list
  const [filteredEvents, setFilteredEvents] = useState<any>(null)
  const [filterClicked, setFilterClicked] = useState<boolean>(false)

  // Fetch events on mount
  useEffect(() => {
    dispatch(fetchEvents()).then(() => {
      // Optionally set initial filteredEvents to all events
      setFilteredEvents(events)
    })
  }, [dispatch])

  // Update filteredEvents when events change (optional, depending on your needs)
  useEffect(() => {
    if (filteredEvents === null) {
      setFilteredEvents(events)
    }
  }, [events])

  const handleFilteredData = (filteredData: any) => {
    setFilterClicked(true)
    setFilteredEvents(filteredData) // Always set filteredEvents to the filtered data
  }

  console.log('Events from Redux:', events)
  console.log('Filtered events:', filteredEvents)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h2'>Schedule List</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ScheduleTableFiltersCard onFilterApplied={handleFilteredData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        {/* Use filteredEvents if set, otherwise use events */}
        <ScheduleListTable events={filterClicked ? filteredEvents : events} />
      </Grid>
    </Grid>
  )
}

export default ScheduleList

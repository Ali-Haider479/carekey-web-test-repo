'use client'
import { Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'

import ScheduleTableFiltersCard from './ScheduleTableFiltersCard'
import ScheduleListTable from './ScheduleListTable'
import { useEffect } from 'react'
import { fetchEvents } from '@/redux-store/slices/calendar'
import { useAppDispatch } from '@/hooks/useDispatch'
import { useSelector } from 'react-redux'
import { CalendarType } from '@/types/apps/calendarTypes'

const ScheduleList = () => {
  const dispatch = useAppDispatch()
  // const events = useSelector((state: any) => state.calendar.events)
  const calendarStore = useSelector((state: { calendarReducer: CalendarType }) => state.calendarReducer)

  useEffect(() => {
    dispatch(fetchEvents())
  }, [dispatch])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h2'>Schedule List</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ScheduleTableFiltersCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ScheduleListTable events={calendarStore} />
      </Grid>
    </Grid>
  )
}

export default ScheduleList

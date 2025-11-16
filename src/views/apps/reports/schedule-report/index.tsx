'use client'
import { Grid2 as Grid } from '@mui/material'
import ScheduleFilters from './scheduleFilters'
import ScheduleTable from './scheduleTable'
import api from '@/utils/api'
import { useEffect, useState } from 'react'

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const fetchScheduleData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/reports/schedule/${authUser?.tenant?.id}`)
      console.log('Fetched schedule data:', response.data)
      setScheduleData(response.data)
    } catch (error) {
      console.error('Error fetching schedule data:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchScheduleData()
  }, [])

  const handleFilteredData = (accountStatus: any) => {
    setScheduleData(accountStatus)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ScheduleFilters onFilterApplied={handleFilteredData} />
        <ScheduleTable scheduleData={scheduleData} loading={loading} />
      </Grid>
    </Grid>
  )
}

export default Schedule

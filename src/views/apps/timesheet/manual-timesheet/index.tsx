'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import ManualTimesheet from './ManualTimesheet'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { fetchEvents } from '@/redux-store/slices/calendar'

// Component Imports

const ManualTimesheetPage = () => {
  const [caregiverList, setCaregiverList] = useState<[] | any>([])
  const [clientList, setClientList] = useState<[] | any>([])
  const [serviceList, setServiceList] = useState<[] | any>([])
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchEvents())
  }, [dispatch])

  useEffect(() => {
    ;(async () => {
      try {
        const response = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregivers`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/service`)
        ])
        setCaregiverList(response[0].data)
        setClientList(response[1].data)
        setServiceList(response[2].data)
      } catch (error) {
        console.log('ERROR', error)
      }
    })()
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ManualTimesheet caregiverList={caregiverList} clientList={clientList} serviceList={serviceList} />
      </Grid>
    </Grid>
  )
}

export default ManualTimesheetPage

'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import ManualTimesheet from './ManualTimesheet'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { fetchEvents } from '@/redux-store/slices/calendar'
import { useAppDispatch } from '@/hooks/useDispatch'
import api from '@/utils/api'

// Component Imports

const ManualTimesheetPage = () => {
  const [caregiverList, setCaregiverList] = useState<[] | any>([])
  const [clientList, setClientList] = useState<[] | any>([])
  const [serviceList, setServiceList] = useState<[] | any>([])
  const [payPeriod, setPayPeriod] = useState<[] | any>([])
  const dispatch = useAppDispatch()
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  useEffect(() => {
    dispatch(fetchEvents())
  }, [dispatch])

  useEffect(() => {
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
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ManualTimesheet
          caregiverList={caregiverList}
          clientList={clientList}
          serviceList={serviceList}
          payPeriod={payPeriod}
        />
      </Grid>
    </Grid>
  )
}

export default ManualTimesheetPage

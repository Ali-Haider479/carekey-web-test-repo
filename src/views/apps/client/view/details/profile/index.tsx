'use client'
import React, { useEffect, useState } from 'react'
import InfoCard from '../../../components/InfoCard'
import ClientAboutCard from './ClientAboutCard'
import Grid from '@mui/material/Grid2'
import { useParams } from 'next/navigation'
import axios from 'axios'
import api from '@/utils/api'
import { CircularProgress } from '@mui/material'

const Profile = () => {
  const { id } = useParams()
  const [clientData, setClientData] = useState<any>()
  const [clientDataLoading, setClientDataLoading] = useState<boolean>(false)
  const getClientData = async () => {
    setClientDataLoading(true)
    try {
      const response = await api.get(`/client/detail/${id}`)
      console.log('Response Client from Profile Data =>>', response.data)
      setClientData(response.data)
    } catch (error) {
      console.error('Error getting Client Data: ', error)
    } finally {
      setClientDataLoading(false)
    }
  }

  useEffect(() => {
    getClientData()
  }, [])

  return (
    <>
      {clientDataLoading ? (
        <Grid
          container
          size={{ xs: 12, sm: 12, md: 12 }}
          justifyContent='center'
          alignItems='center'
          style={{ minHeight: '200px' }}
        >
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container spacing={0}>
          <Grid size={{ xs: 12, sm: 4, md: 4 }}>
            <InfoCard clientData={clientData} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 8 }}>
            <ClientAboutCard clientData={clientData} />
          </Grid>
        </Grid>
      )}
    </>
  )
}

export default Profile

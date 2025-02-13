'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Card from '@mui/material/Card'
import { CircularProgress, Typography } from '@mui/material'
import ReactTable from '@/@core/components/mui/ReactTable'
import { formattedDate } from '@/utils/helperFunctions'
import EvvFilters from '../completed-shifts/EvvFilter'

// Types
interface Location {
  latitude: number
  longitude: number
}

interface LocationDetails {
  city: string
  country: string
}

interface Caregiver {
  firstName: string
  lastName: string
}

interface Client {
  firstName: string
  lastName: string
}

interface TimeLogData {
  id: number
  clockIn: string
  serviceName: string
  startLocation: Location
  caregiver: Caregiver
  client: Client
}

interface Props {
  timeLogData: TimeLogData[]
  isLoading: boolean
}

// Custom hook for location details
const useLocationDetails = (location: Location) => {
  const [locationDetails, setLocationDetails] = useState<LocationDetails>({
    city: 'Loading...',
    country: 'Loading...'
  })

  const getLocationDetails = useCallback(async (latitude: number, longitude: number): Promise<LocationDetails> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
      )
      const data = await response.json()

      return {
        city:
          data.address.city ||
          data.address.town ||
          data.address.village ||
          (data.address.district ? data.address.district.split(' ')[0] : null) ||
          'Unknown',
        country: data.address.country || 'Unknown'
      }
    } catch (error) {
      console.error('Error fetching location details:', error)
      return { city: 'Unknown', country: 'Unknown' }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchLocationDetails = async () => {
      const details = await getLocationDetails(location.latitude, location.longitude)
      if (isMounted) {
        setLocationDetails(details)
      }
    }

    fetchLocationDetails()

    return () => {
      isMounted = false
    }
  }, [location.latitude, location.longitude, getLocationDetails])

  return locationDetails
}

// Memoized components
const LocationCell = React.memo(({ location }: { location: Location }) => {
  const locationDetails = useLocationDetails(location)

  return (
    <div>
      {locationDetails?.city ? `${locationDetails.city}, ` : ''}
      {locationDetails?.country || 'Unknown Country'}
    </div>
  )
})

const EvvActiveUserTable = ({ timeLogData, isLoading }: Props) => {
  const columns = [
    {
      accessorKey: 'caregiverName',
      header: 'CAREGIVER NAME',
      Cell: ({ row }: any) => (
        <Typography>{`${row.original.caregiver.firstName} ${row.original.caregiver.lastName}`}</Typography>
      )
    },
    {
      accessorKey: 'clientName',
      header: 'CLIENT NAME',
      Cell: ({ row }: any) => (
        <Typography>{`${row.original.client.firstName} ${row.original.client.lastName}`}</Typography>
      )
    },
    { accessorKey: 'serviceName', header: 'SERVICE' },
    {
      accessorKey: 'clockIn',
      header: 'CLOCK IN',
      Cell: ({ row }: { row: { original: TimeLogData } }) => formattedDate(row.original.clockIn)
    },
    {
      accessorKey: 'location',
      header: 'LOCATION',
      Cell: ({ row }: any) => <LocationCell location={row.original.startLocation} />
    },
    { accessorKey: 'status', header: 'STATUS', Cell: ({ row }: any) => <div>Active</div> }
  ]

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      <div className='p-4 my-2'>
        <EvvFilters />
      </div>
      {isLoading ? (
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      ) : (
        <ReactTable columns={columns} data={timeLogData} enableExpanding={false} enableExpandAll={false} />
      )}
    </Card>
  )
}

export default React.memo(EvvActiveUserTable)

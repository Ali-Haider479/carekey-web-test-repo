'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Card from '@mui/material/Card'
import { Button, CircularProgress, Dialog, Grid2 as Grid, IconButton, TextField, Typography } from '@mui/material'
import ReactTable from '@/@core/components/mui/ReactTable'
import { formattedDate } from '@/utils/helperFunctions'
import EvvFilters from '../completed-shifts/EvvFilter'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import axios from 'axios'

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
    <Typography color='primary'>
      {locationDetails?.city ? `${locationDetails.city}, ` : ''}
      {locationDetails?.country || 'Unknown Country'}
    </Typography>
  )
})

const EvvActiveUserTable = ({ timeLogData, isLoading }: Props) => {
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isModalShow, setIsModalShow] = useState(false)
  const [clockOutReason, setClockOutReason] = useState('')

  const handleModalClose = () => {
    setIsModalShow(false)
  }

  const handleModalOpen = (user: any) => {
    setIsModalShow(true)
    setSelectedUser(user)
  }

  const handleSave = async () => {
    try {
      const payload = {
        id: selectedUser.id,
        notes: clockOutReason,
        clockOut: new Date().toISOString()
      }
      console.log('UPDATED DATA AFTER SAVE', payload)
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/time-log`, payload)
      console.log('RESPONSE', res)
      // Reset states
      setSelectedUser(null)
      setIsModalShow(false)
      setClockOutReason('')
    } catch (error) {
      console.error('Error saving data', error)
    }
  }

  const columns = [
    {
      id: 'caregiverName',
      label: 'CAREGIVER NAME',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Typography color='primary'>{`${user?.caregiver?.firstName} ${user?.caregiver?.lastName}`}</Typography>
      )
    },
    {
      id: 'clientName',
      label: 'CLIENT NAME',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Typography color='primary'>{`${user?.client?.firstName} ${user?.client?.lastName}`}</Typography>
      )
    },
    {
      id: 'serviceName',
      label: 'SERVICE',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => <Typography color='primary'>{user?.serviceName}</Typography>
    },
    {
      id: 'clockIn',
      label: 'CLOCK IN',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => <Typography color='primary'>{formattedDate(user?.clockIn)}</Typography>
    },
    {
      id: 'location',
      label: 'LOCATION',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => <LocationCell location={user?.startLocation} />
    },
    {
      id: 'status',
      label: 'STATUS',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Typography color='primary' className='text-[#71DD37]'>
          ONLINE
        </Typography>
      )
    },
    {
      id: 'actions',
      label: 'ACTION',
      editable: false,
      render: (user: any) => (
        <IconButton onClick={() => handleModalOpen(user)}>
          <MoreVertIcon />
        </IconButton>
      )
    }
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
        // <ReactTable columns={columns} data={timeLogData} enableExpanding={false} enableExpandAll={false} />
        <>
          <ReactTable
            columns={columns}
            data={timeLogData}
            keyExtractor={user => user.id.toString()}
            enableRowSelect
            enablePagination
            pageSize={5}
            stickyHeader
            maxHeight={600}
            containerStyle={{ borderRadius: 2 }}
          />
          <Dialog
            open={isModalShow}
            onClose={handleModalClose}
            closeAfterTransition={false}
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
            maxWidth='md'
          >
            <DialogCloseButton onClick={() => setIsModalShow(false)} disableRipple>
              <i className='bx-x' />
            </DialogCloseButton>
            <div className='flex items-center justify-center w-full px-5 flex-col'>
              <div>
                <h2 className='text-xl font-semibold mt-10 mb-6'>Clock-out User</h2>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 12 }}>
                    <TextField
                      label='Reason for manual clock out'
                      name='clockOut'
                      placeholder='clockOut'
                      fullWidth
                      size='small'
                      multiline // Enables textarea
                      rows={4} // Number of visible rows
                      type='text' // Text input type (should be text for textarea)
                      onChange={(e: any) => setClockOutReason(e.target.value)}
                      sx={{ width: '100%', minWidth: '480px' }} // added width styling
                    />
                  </Grid>
                </Grid>
              </div>
              <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                  CANCEL
                </Button>
                <Button onClick={handleSave} variant='contained' className='bg-[#4B0082]'>
                  CLOCK OUT
                </Button>
              </div>
            </div>
          </Dialog>
        </>
      )}
    </Card>
  )
}

export default React.memo(EvvActiveUserTable)

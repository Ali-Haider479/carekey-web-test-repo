'use client'

import React, { useState, useEffect, useMemo, useCallback, forwardRef } from 'react'
import Card from '@mui/material/Card'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  FormControl,
  Grid2 as Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import ReactTable from '@/@core/components/mui/ReactTable'
import { combineDateAndTime, formattedDate } from '@/utils/helperFunctions'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import ActiveUserFilters from './ActiveUserFilters'
import api from '@/utils/api'
import { setHours, setMinutes, setSeconds } from 'date-fns'

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
  serviceActivityIds: number[]
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
  payPeriod: any
  fetchInitialData: any
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

const EvvActiveUserTable = ({ timeLogData, isLoading, payPeriod, fetchInitialData }: Props) => {
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isModalShow, setIsModalShow] = useState(false)
  const [clockOutReason, setClockOutReason] = useState('')
  const [values, setValues] = useState<any>()
  const [weekRange, setWeekRange] = useState<any>({})
  const [filteredData, setFilteredData] = useState<any>()
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [serviceActivities, setServiceActivities] = useState<any>([])
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const handleModalClose = () => {
    setIsModalShow(false)
  }

  const handleChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value as number[]
    setSelectedItems(value)
  }

  const handleDelete = (itemToRemove: number) => {
    setSelectedItems(prev => prev.filter(item => item !== itemToRemove))
  }

  const clientServiceActivities = async () => {
    try {
      const activityIds = selectedUser?.client?.serviceActivityIds
      if (!selectedUser?.client) return // Avoid fetching if service is not set
      const response: any = await api.get(`/activity/activities/${activityIds}`)
      setServiceActivities(response?.data)
    } catch (error) {
      console.error('Error fetching client service activities:', error)
    }
  }

  useEffect(() => {
    if (selectedUser?.client?.serviceActivityIds) {
      clientServiceActivities()
    }
  }, [selectedUser])

  const handleModalOpen = (user: any) => {
    setIsModalShow(true)
    setSelectedUser(user)
  }

  console.log('Client Data', timeLogData[0]?.client)

  const calculateStartAndEndDate = (range: any) => {
    // Ensure correct parsing of the start date in UTC
    const [year, month, day] = range?.startDate?.split('-')
    const startDate = new Date(Date.UTC(year, month - 1, day)) // Use UTC to avoid time zone issues

    const endDate = new Date(startDate)
    endDate.setUTCDate(startDate.getUTCDate() + range.numberOfWeeks * 7) // Update in UTC as well

    return {
      startDate: startDate.toISOString().split('T')[0], // Get ISO date in YYYY-MM-DD format
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  console.log('Tg data-------------------', payPeriod)

  console.log('Time Log Active User Data', timeLogData)

  useEffect(() => {
    if (payPeriod && Object?.keys(payPeriod).length > 0) {
      const range = calculateStartAndEndDate(payPeriod)
      setWeekRange(range)
    }

    setFilteredData(timeLogData)
  }, [payPeriod])

  const handleSave = async () => {
    const pendingSignatures: any = await api.get(
      `/signatures/${selectedUser.caregiver?.id}/pending-signatures-count/${selectedUser?.payPeriodHistory?.id}`
    )
    const currentClientPendingSigns = pendingSignatures.data.pendingClients.filter(
      (el: any) => el.clientId === selectedUser.client.id
    )
    console.log('ONE EVV currentClientPendingSigns', currentClientPendingSigns)
    let signResponse: any
    try {
      if (currentClientPendingSigns.length === 0) {
        const payLoad = {
          clientSignature: '',
          caregiverSignature: '',
          duration: '',
          caregiverId: selectedUser.caregiver?.id,
          clientId: selectedUser.client.id,
          tenantId: authUser?.tenant?.id,
          signatureStatus: 'Pending'
        }

        signResponse = await api.post(`/signatures`, payLoad)
      }

      const checkedActivityRes = await api.post(`/activity`, {
        activityIds: selectedItems
      })

      if (checkedActivityRes.status === 201) {
        const payload = {
          id: selectedUser.id,
          notes: clockOutReason,
          clockOut: combineDateAndTime(values?.dateOfService, values?.clockIn),
          checkedActivityId: checkedActivityRes.data.id,
          signatureId:
            currentClientPendingSigns.length > 0 ? currentClientPendingSigns[0].signatureId : signResponse?.data?.id
        }
        const res = await api.patch(`/time-log`, payload)
        console.log('RESPONSE', res)
      }
      await fetchInitialData()
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
      render: (user: any) =>
        user?.isCommunityVisit || !user?.startLocation ? (
          <Typography color='primary'>Community Visit</Typography>
        ) : (
          <LocationCell location={user?.startLocation} />
        )
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

  const PickersComponent = forwardRef(({ ...props }: any, ref) => {
    return (
      <TextField
        inputRef={ref}
        fullWidth
        size='small'
        {...props}
        label={props.label || ''}
        className={props.className}
        placeholder={props.placeholder}
        id={props.id}
        error={props.error}
      />
    )
  })

  const handleFilteredData = (status: any) => {
    setFilteredData(status)
  }

  console.log('Updated values', values)
  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      <div className='p-4 my-2'>
        <ActiveUserFilters onFilterApplied={handleFilteredData} />
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
            data={filteredData}
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
                  <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 3 }}>
                    <AppReactDatepicker
                      selectsStart
                      id='event-start-date'
                      endDate={values?.dateOfService !== null ? values?.dateOfService : weekRange.endDate}
                      selected={values?.dateOfService}
                      startDate={values?.dateOfService !== null ? values?.dateOfService : weekRange.startDate}
                      showTimeSelect={!values?.dateOfService}
                      dateFormat={!values?.dateOfService ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                      minDate={selectedUser?.clockIn} // Set the minimum selectable date
                      maxDate={weekRange.endDate}
                      customInput={
                        <PickersComponent label='Date Of Clockout' registername='dateOfService' id='event-start-date' />
                      }
                      onChange={(date: Date | null) =>
                        date !== null && setValues({ ...values, dateOfService: new Date(date) })
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <AppReactDatepicker
                      showTimeSelect
                      selected={values?.clockIn}
                      timeIntervals={15}
                      minDate={selectedUser?.clockIn}
                      startDate={new Date()}
                      showTimeSelectOnly
                      dateFormat='hh:mm aa'
                      id='time-only-picker'
                      minTime={
                        values?.dateOfService &&
                        selectedUser?.clockIn &&
                        new Date(values.dateOfService).toDateString() === new Date(selectedUser.clockIn).toDateString()
                          ? new Date(selectedUser.clockIn) // Same day: use clockIn time
                          : setHours(setMinutes(setSeconds(new Date(), 0), 0), 0) // Different day: start of day (12:00 AM)
                      }
                      maxTime={setSeconds(setMinutes(setHours(new Date(), 23), 59), 59)}
                      onChange={(date: Date | null) => {
                        if (date !== null) {
                          // Combine the selected end date with the selected end time
                          setValues({
                            ...values,
                            clockIn: date
                          })
                        }
                      }}
                      customInput={
                        <PickersComponent
                          label='Clock-out Time'
                          registername='clockIn'
                          className='mbe-3'
                          id='event-end-time'
                        />
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12 }}>
                    <FormControl fullWidth className='relative'>
                      <InputLabel size='small'>Select Activities</InputLabel>
                      <Select
                        multiple
                        value={selectedItems}
                        onChange={handleChange} // Fixed: Pass the function directly
                        renderValue={() => ''}
                        label='Select Activities'
                        size='small'
                      >
                        {serviceActivities?.map((svc: any) => (
                          <MenuItem key={svc.id} value={svc.id}>
                            {svc.title}
                          </MenuItem>
                        ))}
                      </Select>

                      {/* Render chips BELOW the select */}
                      <Box className='flex flex-wrap gap-2 mt-2'>
                        {selectedItems.map((item: any) => {
                          const service = serviceActivities.find((s: any) => s.id === item)
                          return (
                            <Chip
                              key={item}
                              onDelete={() => handleDelete(item)}
                              label={service?.title}
                              deleteIcon={<CloseIcon sx={{ fontSize: '14px', color: '#8592A3' }} />}
                              className='mt-2 text-[#8592A3] text-sm py-1'
                            />
                          )
                        })}
                      </Box>
                    </FormControl>
                  </Grid>
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

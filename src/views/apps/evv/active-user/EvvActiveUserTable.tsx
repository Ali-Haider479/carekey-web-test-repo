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
import CustomAlert from '@/@core/components/mui/Alter'

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
  dateOfService: Date
}

interface Props {
  timeLogData: TimeLogData[]
  isLoading: boolean
  payPeriod: any
  fetchInitialData: any
  formattedAddress: any
}

interface ClockOutFormData {
  dateOfService: Date | null
  clockOut: Date | null
  serviceActivities: number[]
  reason: string
}

const defaultValues: ClockOutFormData = {
  dateOfService: null,
  clockOut: null,
  serviceActivities: [],
  reason: ''
}

interface FormErrors {
  [key: string]: string
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

  console.log('LOCATION DETAILS ------>> ', locationDetails)

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

const EvvActiveUserTable = ({ timeLogData, isLoading, payPeriod, fetchInitialData, formattedAddress }: Props) => {
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isModalShow, setIsModalShow] = useState(false)
  const [clockOutReason, setClockOutReason] = useState('')
  const [values, setValues] = useState<ClockOutFormData>(defaultValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [weekRange, setWeekRange] = useState<any>({})
  const [filteredData, setFilteredData] = useState<any>()
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [serviceActivities, setServiceActivities] = useState<any>([])
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()

  console.log(
    'FORMATTED ADDRESS --~--~-->>',
    // formattedAddress,
    // formattedAddress?.features[0]?.properties?.address?.formattedAddress,
    timeLogData
  )

  const handleModalClose = () => {
    setIsModalShow(false)
    setValues(defaultValues)
    setSelectedItems([])
    setClockOutReason('')
    setSelectedUser(null)
    setErrors({})
    setTouched({})
  }

  // const handleChange = (event: SelectChangeEvent<number[]>) => {
  //   const value = event.target.value as number[]
  //   setSelectedItems(value)
  // }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    if (!values.dateOfService || !timeLogData?.[0]?.dateOfService) {
      newErrors.dateOfService = 'Date of Clockout is required'
      isValid = false
    }

    if (!values.clockOut) {
      newErrors.clockOut = 'Time of Clockout is required'
      isValid = false
    }

    if (selectedItems.length === 0) {
      newErrors.serviceActivities = 'At least one activity is required'
      isValid = false
    }

    if (!clockOutReason.trim()) {
      newErrors.reason = 'Reason for manual clock out is required'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange =
    (field: keyof ClockOutFormData) =>
      (event: SelectChangeEvent<number[]> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (field === 'serviceActivities') {
          const value = (event as SelectChangeEvent<number[]>).target.value as number[]
          setSelectedItems(value)
          setValues(prev => ({
            ...prev,
            serviceActivities: value
          }))
        } else if (field === 'reason') {
          const value = (event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>).target.value
          setClockOutReason(value)
          setValues(prev => ({
            ...prev,
            reason: value
          }))
        }

        if (touched[field] && errors[field]) {
          setErrors(prev => ({
            ...prev,
            [field]: ''
          }))
        }
      }

  const handleDateChange = (field: keyof ClockOutFormData) => (date: Date | null) => {
    setValues(prev => ({
      ...prev,
      [field]: date
    }))

    if (touched[field] && date) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  console.log('TimeLog Data', timeLogData)

  const handleBlur = (field: keyof ClockOutFormData) => () => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))

    if (field === 'serviceActivities' && selectedItems.length === 0) {
      setErrors(prev => ({
        ...prev,
        serviceActivities: 'At least one activity is required'
      }))
    } else if (field === 'reason' && !clockOutReason.trim()) {
      setErrors(prev => ({
        ...prev,
        reason: 'Reason for manual clock out is required'
      }))
    } else if (!values[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: `${field === 'dateOfService' ? 'Date of Clockout' : 'Time of Clockout'} is required`
      }))
    }
  }

  const handleDelete = (itemToRemove: number) => {
    const updatedItems = selectedItems.filter(item => item !== itemToRemove)
    setSelectedItems(updatedItems)
    setValues(prev => ({
      ...prev,
      serviceActivities: updatedItems
    }))

    if (touched.serviceActivities && updatedItems.length === 0) {
      setErrors(prev => ({
        ...prev,
        serviceActivities: 'At least one activity is required'
      }))
    } else if (touched.serviceActivities) {
      setErrors(prev => ({
        ...prev,
        serviceActivities: ''
      }))
    }
  }

  const clientServiceActivities = async () => {
    try {
      const activityIds = selectedUser?.client?.serviceActivityIds
      if (!activityIds) return
      const response: any = await api.get(`/activity/activities/${activityIds}`)
      setServiceActivities(response.data.filter((item: any) => item.service.name === selectedUser.serviceName))
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

  useEffect(() => {
    if (payPeriod && Object?.keys(payPeriod).length > 0) {
      const range = calculateStartAndEndDate(payPeriod)
      setWeekRange(range)
    }

    setFilteredData(timeLogData)
  }, [payPeriod])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent default form submission

    setTouched({
      dateOfService: true,
      clockOut: true,
      serviceActivities: true,
      reason: true
    })

    if (!validateForm()) {
      // setAlertOpen(true)
      // setAlertProps({
      //   message: 'Please fill all required fields.',
      //   severity: 'error'
      // })
      return
    }

    try {
      const response: any = await Promise.all([
        api.get(`/time-log/admin-clockout/${selectedUser?.id}`),
        api.get(`/signatures/${selectedUser.client.id}/pending-signatures-count/${selectedUser?.payPeriodHistory?.id}`)
      ])

      if (response[0].data[0].clockOut !== null) {
        setAlertOpen(true)
        setAlertProps({
          message: 'The user has already clocked out.',
          severity: 'error'
        })
        return
      }

      const currentClientPendingSigns = response[1].data.pendingClients.filter(
        (el: any) => el.clientId === selectedUser.client.id
      )

      let signResponse: any
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
        activityIds: values?.serviceActivities
      })

      if (checkedActivityRes.status === 201) {
        const payload = {
          id: selectedUser.id,
          notes: values?.reason,
          clockOut: combineDateAndTime(values?.dateOfService, values?.clockOut),
          checkedActivityId: checkedActivityRes.data.id,
          adminOverride: true,
          signatureId:
            currentClientPendingSigns.length > 0 ? currentClientPendingSigns[0].signatureId : signResponse?.data?.id
        }
        await api.patch(`/time-log`, payload)
      }

      await fetchInitialData()
      handleModalClose()
    } catch (error) {
      console.error('Error saving data', error)
      setAlertOpen(true)
      setAlertProps({
        message: 'Failed to clock out. Please try again.',
        severity: 'error'
      })
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
      render: (user: any) => {
        console.log("USER", user);
        const caregiverName = `${user.caregiver.firstName} ${user.caregiver.lastName}`;
        const formattedAddressIndex = formattedAddress?.features?.findIndex((item: any) =>
          item?.properties?.caregiverName === caregiverName);
        console.log("formattedAddressIndex", formattedAddressIndex)
        return (
          user?.isCommunityVisit || !user?.startLocation ? (
            <Typography color='primary'>Community Visit</Typography>
          ) : (
            // <LocationCell location={user?.startLocation} />
            <Typography color='primary'>
              {formattedAddress?.features[formattedAddressIndex]?.properties?.address?.formattedAddress}
            </Typography>
          )
        )
      }
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

  console.log('VALUES ====>> ', values)

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
      <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />

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
            pageSize={25}
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
            <DialogCloseButton onClick={handleModalClose} disableRipple>
              <i className='bx-x' />
            </DialogCloseButton>
            <div className='flex items-center justify-center w-full px-5 flex-col'>
              <form onSubmit={handleSave}>
                <div>
                  <h2 className='text-xl font-semibold mt-10 mb-6'>Clock-out User</h2>
                  <Grid container spacing={4}>
                    <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 3 }}>
                      <AppReactDatepicker
                        selectsStart
                        id='event-start-date'
                        endDate={
                          timeLogData?.[0]?.dateOfService !== null ? timeLogData?.[0]?.dateOfService : weekRange.endDate
                        }
                        selected={values?.dateOfService}
                        startDate={
                          timeLogData?.[0]?.dateOfService !== null
                            ? timeLogData?.[0]?.dateOfService
                            : weekRange.startDate
                        }
                        dateFormat={'yyyy-MM-dd'}
                        minDate={selectedUser?.clockIn} // Set the minimum selectable date
                        maxDate={weekRange.endDate}
                        customInput={
                          <PickersComponent
                            error={touched.dateOfService && !!errors.dateOfService}
                            helperText={touched.dateOfService && errors.dateOfService}
                            label='Date Of Clockout'
                            registername='dateOfService'
                            id='event-start-date'
                          />
                        }
                        onChange={handleDateChange('dateOfService')}
                        onBlur={handleBlur('dateOfService')}
                      />
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                      <AppReactDatepicker
                        showTimeSelect
                        selected={values?.clockOut}
                        timeIntervals={15}
                        minDate={selectedUser?.clockIn}
                        startDate={new Date()}
                        showTimeSelectOnly
                        dateFormat='hh:mm aa'
                        id='time-only-picker'
                        minTime={(() => {
                          if (!selectedUser?.clockIn || !values?.dateOfService) return new Date()

                          const clockInTime = new Date(selectedUser.clockIn)
                          const selectedDate = values.dateOfService

                          // Check if dates are the same
                          const isSameDate =
                            clockInTime.getFullYear() === selectedDate.getFullYear() &&
                            clockInTime.getMonth() === selectedDate.getMonth() &&
                            clockInTime.getDate() === selectedDate.getDate()

                          if (isSameDate) {
                            const minutes = clockInTime.getMinutes()
                            const roundedMinutes = Math.ceil(minutes / 15) * 15
                            const nextInterval = new Date(clockInTime)

                            if (minutes === roundedMinutes) {
                              nextInterval.setMinutes(minutes + 15)
                            } else {
                              nextInterval.setMinutes(roundedMinutes)
                            }

                            return nextInterval
                          } else {
                            // If different date, start from beginning of day
                            return setSeconds(setMinutes(setHours(new Date(), 0), 0), 0)
                          }
                        })()}
                        maxTime={setSeconds(setMinutes(setHours(new Date(), 23), 59), 59)}
                        onChange={handleDateChange('clockOut')}
                        onBlur={handleBlur('clockOut')}
                        customInput={
                          <PickersComponent
                            label='Clock-out Time'
                            registername='clockOut'
                            className='mbe-3'
                            id='event-end-time'
                            error={touched.clockOut && !!errors.clockOut}
                            helperText={touched.clockOut && errors.clockOut}
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
                          onChange={handleChange('serviceActivities')}
                          onBlur={handleBlur('serviceActivities')}
                          error={touched.serviceActivities && !!errors.serviceActivities}
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
                        {touched.serviceActivities && errors.serviceActivities && (
                          <Typography color='error' variant='caption'>
                            {errors.serviceActivities}
                          </Typography>
                        )}
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
                        onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                          handleChange('reason')(event)
                        }
                        onBlur={handleBlur('reason')}
                        sx={{ width: '100%', minWidth: '480px' }} // added width styling
                        error={touched.reason && !!errors.reason}
                        helperText={touched.reason && errors.reason}
                        value={clockOutReason}
                      />
                    </Grid>
                  </Grid>
                </div>
                <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                  <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                    CANCEL
                  </Button>
                  <Button type='submit' variant='contained' className='bg-[#4B0082]'>
                    CLOCK OUT
                  </Button>
                </div>
              </form>
            </div>
          </Dialog>
        </>
      )}
    </Card>
  )
}

export default React.memo(EvvActiveUserTable)

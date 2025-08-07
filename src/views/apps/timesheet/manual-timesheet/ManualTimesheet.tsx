'use client'
import React, { forwardRef, useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  TextField,
  Box,
  Chip,
  SelectChangeEvent
} from '@mui/material'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { Close as CloseIcon } from '@mui/icons-material'
import api from '@/utils/api'
import { set, setHours, setMinutes, setSeconds } from 'date-fns'
import { calculateStartAndEndDate } from '@/utils/helperFunctions'
import CustomAlert from '@/@core/components/mui/Alter'

interface DefaultStateType {
  currentWeek: string
  dateOfService: any
  caregiver: string | undefined
  client: string
  service: string
  notes: string
  manualEntry: boolean
  serviceName: string
  payPeriodHistoryId: number
  signatureId: number
  clockIn: any
  clockOut: any
  checkedActivityId: number
  reason: string
  payperiod: string | number | null
  clientServiceId: any
}

const defaultState: DefaultStateType = {
  currentWeek: '',
  caregiver: '',
  client: '',
  service: '',
  dateOfService: null,
  notes: '',
  manualEntry: true,
  serviceName: '',
  payPeriodHistoryId: 0,
  signatureId: 0,
  clockIn: null,
  clockOut: null,
  checkedActivityId: 0,
  reason: '',
  payperiod: null,
  clientServiceId: null
}

interface PickerProps {
  label?: string
  error?: boolean
  className?: string
  id?: string
  registername?: string
  placeholder?: string
}

const ManualTimesheet = ({ caregiverList, payPeriodList }: any) => {
  const [values, setValues] = useState(defaultState)
  const [errors, setErrors] = useState({
    payperiod: false,
    caregiver: false,
    client: false,
    clientServiceId: false,
    dateOfService: false,
    clockIn: false,
    clockOut: false,
    activities: false
  })
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false)
  const [weekRange, setWeekRange] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [clientUsers, setClientUsers] = useState<any>([])
  const [serviceType, setServiceType] = useState<any[]>([])
  const [serviceActivities, setServiceActivities] = useState<any>([])
  const [clientServiceAuth, setClientServiceAuth] = useState<any>([])
  const [selectedService, setSelectedService] = useState<any>([])
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()

  const [payperiodWeeks, setPayperiodWeeks] = useState([])

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const calculateStartAndEndDateNew = (range: any) => {
    // Ensure correct parsing of the start date in UTC
    const [year, month, day] = range?.startDate?.split('-')
    const startDate = new Date(Date.UTC(year, month - 1, day)) // Use UTC to avoid time zone issues

    let endDate
    if (range.endDate) {
      // If endDate exists, parse it
      const [endYear, endMonth, endDay] = range.endDate.split('-')
      endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay))
    } else {
      console.log('endDate is null', endDate)
      // If endDate is null, calculate it based on numberOfWeeks
      endDate = new Date(startDate)
      endDate.setUTCDate(startDate.getUTCDate() + range.numberOfWeeks * 7)
    }

    // Get current date in UTC (May 28, 2025)
    const currentDate = new Date() // Month is 0-based (4 = May)

    // Determine if the period is current
    const isCurrent = range.endDate === null || (currentDate >= startDate && currentDate <= endDate)
    console.log('endDate', endDate)

    return {
      id: range.id,
      startDate: startDate.toISOString().split('T')[0], // Get ISO date in YYYY-MM-DD format
      endDate: endDate.toISOString().split('T')[0], // Get ISO date in YYYY-MM-DD format
      current: isCurrent,
      numberOfWeeks: range.numberOfWeeks
    }
  }

  // Validation function to check required fields
  const validateForm = () => {
    const newErrors = {
      payperiod: !values.payperiod,
      caregiver: !values.caregiver,
      client: !values.client,
      clientServiceId: !values.clientServiceId,
      dateOfService: !values.dateOfService,
      clockIn: !values.clockIn,
      clockOut: !values.clockOut,
      activities: selectedItems.length === 0
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const combineDateAndTimeForGMT = (date: any, time: any) => {
    if (!date || !time) return null
    const datePart = new Date(date)
    const timePart = new Date(time)
    const combined = new Date(
      Date.UTC(
        datePart.getUTCFullYear(),
        datePart.getUTCMonth(),
        datePart.getUTCDate(),
        timePart.getHours(),
        timePart.getMinutes(),
        0,
        0
      )
    )
    return combined.toISOString()
  }

  const handleDelete = (itemToRemove: number) => {
    setSelectedItems(prev => prev.filter(item => item !== itemToRemove))
    setErrors(prev => ({ ...prev, activities: false }))
  }

  const handleChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value as number[]
    setSelectedItems(value)
    setErrors(prev => ({ ...prev, activities: value.length === 0 }))
  }

  const fetchClientUsers = async () => {
    try {
      const filterCg = caregiverList.filter((ele: any) => ele.id === values.caregiver)
      const caregiverUserId = filterCg[0]?.user?.id
      if (!caregiverUserId) return
      const response = await api.get(`/user/clientUsers/${caregiverUserId}`)
      setClientUsers(response.data)
    } catch (error) {
      console.error('Error fetching client users:', error)
    }
  }

  useEffect(() => {
    if (values.caregiver) fetchClientUsers()
  }, [values.caregiver])

  const fetchClientServiceAuth = async () => {
    try {
      if (!values.client) return
      const response = await api.get(`/client/${values.client}/service-auth`)
      setClientServiceAuth(response.data)
    } catch (error) {
      console.error('Error fetching client service auth:', error)
    }
  }

  useEffect(() => {
    if (values.client && values.clientServiceId) {
      fetchClientServiceAuth()
    }
  }, [values.client, values.clientServiceId])

  const fetchClientServiceType = async () => {
    try {
      if (!values.client) return
      const response = await api.get(`/client/${values.client}/services`)
      const serviceAuthServicesRes = await api.get(`/client/${values.client}/service-auth/services`)
      setServiceType([...response.data, ...serviceAuthServicesRes.data])
    } catch (error) {
      console.error('Error fetching client service type:', error)
    }
  }

  const clientServiceActivities = async () => {
    try {
      // Find the selected client from clientUsers array
      const selectedClient = clientUsers.find((client: any) => client?.client?.id === values.client)
      const activityIds = selectedClient?.client?.serviceActivityIds

      // Only fetch if we have a client and activity IDs
      if (!values.client || !activityIds || !values.clientServiceId) return

      const response: any = await api.get(`/activity/activities/${activityIds}`)
      const selectedService = serviceType?.find((item: any) => item?.clientServiceId === values.clientServiceId)
      setSelectedService(selectedService)
      setServiceActivities(
        response.data.filter(
          (item: any) =>
            item.procedureCode === selectedService?.procedureCode &&
            (item.modifierCode === selectedService?.modifierCode ||
              (item.modifierCode === null && selectedService?.modifierCode === null))
        )
      )
    } catch (error) {
      console.error('Error fetching client service activities:', error)
    }
  }

  useEffect(() => {
    if (values.client) {
      setSelectedItems([])
      setServiceActivities([])
      fetchClientServiceType()
    }
  }, [values.client, values.clientServiceId])

  useEffect(() => {
    if (values.clientServiceId) {
      clientServiceActivities()
    }
  }, [values.clientServiceId])

  useEffect(() => {
    const processedData = payPeriodList.map((range: any) => calculateStartAndEndDateNew(range))
    setPayperiodWeeks(processedData)
  }, [payPeriodList])

  // useEffect(() => {
  //   if (Object.keys(payPeriod).length > 0) {
  //     const range = calculateStartAndEndDate(payPeriod)
  //     setWeekRange(range)
  //   }
  // }, [payPeriod])

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
        helperText={props.error ? 'This field is required' : ''}
      />
    )
  })

  const onDiscard = () => {
    setValues(defaultState)
    setSelectedItems([])
    setErrors({
      payperiod: false,
      caregiver: false,
      client: false,
      clientServiceId: false,
      dateOfService: false,
      clockIn: false,
      clockOut: false,
      activities: false
    })
  }

  const onSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      let signResponse: any
      const pendingSignatures: any = await api.get(
        `/signatures/${values.caregiver}/pending-signatures-count/${values.payperiod}`
      )
      const currentClientPendingSigns = pendingSignatures.data.pendingClients.filter(
        (el: any) => el.clientId === values.client
      )
      if (currentClientPendingSigns.length === 0) {
        const payLoad = {
          clientSignature: '',
          caregiverSignature: '',
          duration: '',
          caregiverId: values.caregiver,
          clientId: values.client,
          tenantId: authUser?.tenant?.id,
          signatureStatus: 'Pending'
        }
        signResponse = await api.post(`/signatures`, payLoad)
      }

      const checkedActivityRes = await api.post(`/activity/checked`, {
        activityIds: selectedItems
      })

      if (checkedActivityRes.status === 201) {
        const serviceDate = new Date(values.dateOfService)
        let newClockIn = new Date(values.clockIn)
        let newClockOut = new Date(values.clockOut)
        newClockIn.setFullYear(serviceDate.getFullYear(), serviceDate.getMonth(), serviceDate.getDate())
        newClockOut.setFullYear(serviceDate.getFullYear(), serviceDate.getMonth(), serviceDate.getDate())

        const hoursWorked = (newClockOut.getTime() - newClockIn.getTime()) / (1000 * 60 * 60)
        const roundedHoursWorked = Math.round(hoursWorked * 4) / 4 // Round to the nearest quarter hour
        const unitsUsed = Math.ceil(roundedHoursWorked * 4) // Convert to quarter hours

        if (clientServiceAuth.length === 0) {
          console.log('VALUES', values)
          const modifiedEvent = {
            dateOfService: values?.dateOfService,
            manualEntry: true,
            clockIn: newClockIn.toISOString(),
            clockOut: newClockOut.toISOString(),
            tsApprovalStatus: 'Pending',
            loggedVia: 'desktop',
            notes: values.notes,
            reason: values.reason,
            clientServiceId: values.clientServiceId,
            clientId: values.client,
            caregiverId: values.caregiver,
            checkedActivityId: checkedActivityRes.data.id,
            payPeriodHistoryId: values.payperiod,
            signatureId:
              currentClientPendingSigns.length > 0 ? currentClientPendingSigns[0].signatureId : signResponse?.data?.id,
            tenantId: authUser?.tenant?.id
          }
          console.log('PAYLOAD', modifiedEvent)

          const timelogResponse = await api.post(`/time-log`, modifiedEvent)
        } else {
          const correspondingServiceAuth = clientServiceAuth.find(
            (item: any) =>
              item?.modifierCode === selectedService?.modifierCode &&
              (item?.procedureCode === selectedService?.procedureCode ||
                (item?.procedureCode === null && selectedService?.procedureCode === null))
          )

          const allowedUnits = Math.ceil(correspondingServiceAuth?.units - correspondingServiceAuth?.usedUnits)

          if (unitsUsed > allowedUnits) {
            setIsLoading(false)
            setAlertOpen(true)
            setAlertProps({
              severity: 'error',
              message: `You cannot use more than ${allowedUnits} units for this service.`
            })
            setValues(defaultState)
            setSelectedItems([])
            setErrors({
              payperiod: false,
              caregiver: false,
              client: false,
              clientServiceId: false,
              dateOfService: false,
              clockIn: false,
              clockOut: false,
              activities: false
            })
            return
          }

          const newUnitsUsed = Math.ceil(Number(correspondingServiceAuth?.usedUnits) + unitsUsed)

          console.log('New Units Used --->> ', newUnitsUsed)

          const modifiedServiceAuth = {
            ...correspondingServiceAuth,
            usedUnits: newUnitsUsed
          }

          correspondingServiceAuth?.id &&
            (await api.patch(`/client/service-auth/${correspondingServiceAuth?.id}`, modifiedServiceAuth))

          // Fetch schedules and filter
          const schedules: any = await api.get('/schedule')
          const filteredSchedule = schedules?.data?.filter(
            (item: any) => item.caregiver?.id === values.caregiver && item.client?.id === values.client
          )

          // Check for schedule overlap in local timezone
          const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000
          const scheduleOverlap = filteredSchedule?.find((item: any) => {
            // Convert schedule start and end from UTC to local timezone (PKT)
            const utcStart = new Date(item.start)
            const utcEnd = new Date(item.end)
            const scheduleStart = new Date(utcStart.getTime() - timezoneOffset)
            const scheduleEnd = new Date(utcEnd.getTime() - timezoneOffset)

            // Convert newClockIn and newClockOut from UTC to local timezone (PKT)
            const shiftStart = new Date(newClockIn.getTime() - timezoneOffset)
            const shiftEnd = new Date(newClockOut.getTime() - timezoneOffset)

            // Validate dates
            if (
              isNaN(scheduleStart.getTime()) ||
              isNaN(scheduleEnd.getTime()) ||
              isNaN(shiftStart.getTime()) ||
              isNaN(shiftEnd.getTime())
            ) {
              console.warn(`Invalid dates for schedule ID ${item.id} or shift`)
              return false
            }

            // Compare dates (year, month, day) in local timezone
            const scheduleDate = new Date(
              scheduleStart.getFullYear(),
              scheduleStart.getMonth(),
              scheduleStart.getDate()
            )
            const shiftDate = new Date(shiftStart.getFullYear(), shiftStart.getMonth(), shiftStart.getDate())

            if (scheduleDate.getTime() !== shiftDate.getTime()) {
              console.log(
                `Date mismatch for schedule ID ${item.id}: ${scheduleDate.toISOString()} vs ${shiftDate.toISOString()}`
              )
              return false
            }

            // Log dates and times for debugging (in local timezone)
            console.log(
              'Dates to compare --->> ',
              scheduleStart.toISOString(),
              scheduleEnd.toISOString(),
              ' --- With --- ',
              shiftStart.toISOString(),
              shiftEnd.toISOString(),
              ' --- Result --- ',
              shiftStart.getTime() <= scheduleEnd.getTime() && shiftEnd.getTime() >= scheduleStart.getTime()
            )

            // Check for time overlap: start1 <= end2 && end1 >= start2
            return shiftStart.getTime() <= scheduleEnd.getTime() && shiftEnd.getTime() >= scheduleStart.getTime()
          })

          console.log('Schedule Overlapping...... : ', scheduleOverlap)

          const modifiedEvent = {
            dateOfService: values?.dateOfService,
            manualEntry: true,
            clockIn: newClockIn.toISOString(),
            clockOut: newClockOut.toISOString(),
            tsApprovalStatus: 'Pending',
            loggedVia: 'desktop',
            notes: values.notes,
            reason: values.reason,
            clientServiceId: values.clientServiceId,
            clientId: values.client,
            caregiverId: values.caregiver,
            checkedActivityId: checkedActivityRes.data.id,
            payPeriodHistoryId: values.payperiod,
            signatureId:
              currentClientPendingSigns.length > 0 ? currentClientPendingSigns[0].signatureId : signResponse?.data?.id,
            tenantId: authUser?.tenant?.id
          }
          console.log('PAYLOAD', modifiedEvent)

          const timelogResponse = await api.post(`/time-log`, modifiedEvent)

          if (scheduleOverlap && scheduleOverlap?.status === 'scheduled') {
            console.log('Schedule Overlap detected.....', scheduleOverlap)
            const scheduleDto = {
              timeLogId: timelogResponse.data.id,
              caregiverId: values.caregiver,
              status: 'worked'
            }
            const updateSchedule = await api.patch(`/schedule/${scheduleOverlap?.id}`, scheduleDto)
            console.log('Schedule Updated: ', updateSchedule)
          } else if (correspondingServiceAuth && !scheduleOverlap) {
            console.log('Creating new schedule --->> ')
            const clockIn = timelogResponse.data.clockIn
            const clockOut = timelogResponse.data.clockOut
            const usedHours = new Date(clockIn).getTime() - new Date(clockOut).getTime()
            const assignedHours = new Date(usedHours).getHours()
            const newScheduleDto = {
              display: 'block',
              title: 'Schedule Added from web manual timesheet',
              start: clockIn,
              end: clockOut,
              status: 'worked',
              staffRatio: '1:1',
              frequency: 'daily',
              notes: '',
              location: '',
              caregiverId: timelogResponse.data.caregiver.id,
              clientId: timelogResponse.data.client.id,
              clientServiceId: timelogResponse.data.clientService.id,
              tenantId: authUser?.tenant?.id,
              payPeriod: timelogResponse.data.payPeriodHistory.id,
              serviceAuthId: correspondingServiceAuth?.id,
              timeLogId: timelogResponse.data.id,
              assignedHours: 0,
              timelogCreatedSchedule: true
            }
            console.log('New Schedule DTO --->> ', newScheduleDto)
            const newScheduleRes = await api.post('/schedule', [newScheduleDto])
            console.log('New Schedule Created --->> ', newScheduleRes)
          }
        }

        setValues(defaultState)
        setSelectedItems([])
        setErrors({
          payperiod: false,
          caregiver: false,
          client: false,
          clientServiceId: false,
          dateOfService: false,
          clockIn: false,
          clockOut: false,
          activities: false
        })
        setOpenSuccessSnackbar(true)
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
      console.log('Error:', error)
    }
  }

  // Check if form is valid to enable/disable submit button
  const isFormValid = () => {
    return (
      values.caregiver &&
      values.client &&
      values.clientServiceId &&
      values.dateOfService &&
      values.clockIn &&
      values.clockOut &&
      values.notes &&
      values.reason &&
      selectedItems.length > 0
    )
  }

  const handlePayperiodChange = (payperiodId: any) => {
    const weekRange = payperiodWeeks.find((item: any) => item.id === payperiodId)
    setWeekRange(weekRange || {})
  }

  return (
    <>
      <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
      <Card className='w-full h-fit' sx={{ p: 2, borderRadius: 1, boxShadow: 2 }}>
        <CardHeader
          title='Add Your Manually Timesheet Details'
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 500 } }}
        />
        <CardContent>
          <Grid container spacing={4}>
            {/* <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 6 }}>
              <TextField
                label={'Current Week'}
                value={`${weekRange.startDate} to ${weekRange.endDate}`}
                disabled
                size='small'
                fullWidth
              />
            </Grid> */}

            <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 6 }}>
              <FormControl required fullWidth size='small' variant='outlined' error={errors.caregiver}>
                <InputLabel id='payperiod-select-label'>Select Payperiod Week</InputLabel>
                <Select
                  labelId='payperiod-select-label'
                  value={values.payperiod}
                  label='Select Payperiod Week*'
                  onChange={e => {
                    setValues({ ...values, payperiod: e.target.value })
                    setErrors(prev => ({ ...prev, payperiod: !e.target.value }))
                    handlePayperiodChange(e.target.value)
                  }}
                >
                  {payperiodWeeks.map((payperiod: any) => (
                    <MenuItem key={payperiod?.id} value={payperiod?.id}>
                      {`${new Date(payperiod?.startDate).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                      })} to ${new Date(payperiod?.endDate).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                      })} ${payperiod.current ? '(Current)' : ''}`}
                    </MenuItem>
                  ))}
                </Select>
                {errors.payperiod && <span style={{ color: 'red', fontSize: '12px' }}>This field is required</span>}
              </FormControl>
            </Grid>

            <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 6 }}>
              <FormControl required fullWidth size='small' variant='outlined' error={errors.caregiver}>
                <InputLabel id='caregiver-select-label'>Select Caregiver</InputLabel>
                <Select
                  labelId='caregiver-select-label'
                  value={values.caregiver}
                  label='Select Caregiver *'
                  onChange={e => {
                    setValues({ ...values, caregiver: e.target.value, client: '' })
                    setErrors(prev => ({ ...prev, caregiver: !e.target.value }))
                  }}
                >
                  {caregiverList.map((caregiver: any) => (
                    <MenuItem key={caregiver?.id} value={caregiver?.id}>
                      {`${caregiver.firstName} ${caregiver.lastName}`}
                    </MenuItem>
                  ))}
                </Select>
                {errors.caregiver && <span style={{ color: 'red', fontSize: '12px' }}>This field is required</span>}
              </FormControl>
            </Grid>

            <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 6 }}>
              <FormControl
                required
                fullWidth
                size='small'
                variant='outlined'
                error={errors.client}
                disabled={!values.caregiver}
              >
                <InputLabel id='client-select-label'>Select Client</InputLabel>
                <Select
                  labelId='client-select-label'
                  value={values.client}
                  label='Select Client *'
                  onChange={e => {
                    setValues({ ...values, client: e.target.value })
                    setErrors(prev => ({ ...prev, client: !e.target.value }))
                  }}
                >
                  {clientUsers.map((client: any) => (
                    <MenuItem key={client?.client?.id} value={client?.client?.id}>
                      {`${client?.client?.firstName} ${client?.client?.lastName}`}
                    </MenuItem>
                  ))}
                </Select>
                {errors.client && <span style={{ color: 'red', fontSize: '12px' }}>This field is required</span>}
              </FormControl>
            </Grid>

            <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 6 }}>
              <FormControl required fullWidth size='small' variant='outlined' error={errors.clientServiceId}>
                <InputLabel id='service-select-label'>Select Service</InputLabel>
                <Select
                  labelId='service-select-label'
                  value={values.clientServiceId}
                  label='Select Service *'
                  onChange={e => {
                    setValues({ ...values, clientServiceId: e.target.value })
                    setErrors(prev => ({ ...prev, clientServiceId: !e.target.value }))
                  }}
                >
                  {serviceType.map((service: any) => (
                    <MenuItem key={service.id} value={service.clientServiceId}>
                      {service.name} {service.dummyService ? '(Demo Service)' : '(S.A Service)'}
                    </MenuItem>
                  ))}
                </Select>
                {errors.clientServiceId && (
                  <span style={{ color: 'red', fontSize: '12px' }}>This field is required</span>
                )}
              </FormControl>
            </Grid>

            <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 6 }}>
              <AppReactDatepicker
                selectsStart
                id='event-start-date'
                endDate={weekRange.current === true ? new Date() : weekRange.endDate}
                selected={values.dateOfService}
                startDate={values.dateOfService !== null ? values.dateOfService : weekRange.startDate}
                dateFormat={'yyyy-MM-dd'}
                minDate={weekRange.startDate}
                maxDate={weekRange.current === true ? new Date() : weekRange.endDate}
                disabled={!values.payperiod}
                customInput={
                  <TextField
                    fullWidth
                    size='small'
                    label={'Date Of Service'}
                    placeholder='MM/DD/YYYY'
                    id='event-start-date'
                    required
                    error={errors.dateOfService}
                    helperText={errors.dateOfService ? 'This field is required' : ''}
                  />
                }
                onChange={(date: Date | null) => {
                  setValues({ ...values, dateOfService: date })
                  setErrors(prev => ({ ...prev, dateOfService: !date }))
                }}
              />
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <AppReactDatepicker
                showTimeSelect
                selected={values.clockIn}
                timeIntervals={15}
                minDate={new Date()}
                startDate={new Date()}
                showTimeSelectOnly
                dateFormat='hh:mm aa'
                id='clock-in-picker'
                onChange={(date: any | null) => {
                  if (date !== null) {
                    setValues({
                      ...values,
                      clockIn: date,
                      clockOut: null
                    })
                    setErrors(prev => ({ ...prev, clockIn: !date }))
                  }
                }}
                customInput={
                  <PickersComponent
                    label='Clock-In Time'
                    registername='clockIn'
                    className='mbe-3'
                    id='clock-in-time'
                    required
                    error={errors.clockIn}
                  />
                }
              />
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <AppReactDatepicker
                showTimeSelect
                selected={values.clockOut}
                timeIntervals={15}
                minDate={new Date()}
                startDate={new Date()}
                showTimeSelectOnly
                dateFormat='hh:mm aa'
                minTime={(() => {
                  if (!values?.clockIn) return new Date()

                  const clockInTime = new Date(values.clockIn)
                  const minutes = clockInTime.getMinutes()
                  const roundedMinutes = Math.ceil(minutes / 15) * 15

                  const nextInterval = new Date(clockInTime)

                  // If minutes and roundedMinutes are same, add 15 minutes
                  if (minutes === roundedMinutes) {
                    nextInterval.setMinutes(minutes + 15)
                  } else {
                    nextInterval.setMinutes(roundedMinutes)
                  }

                  return nextInterval
                })()}
                maxTime={setSeconds(setMinutes(setHours(new Date(), 23), 59), 59)}
                id='clock-out-picker'
                onChange={(date: Date | null) => {
                  if (date !== null) {
                    setValues({
                      ...values,
                      clockOut: date
                    })
                    setErrors(prev => ({ ...prev, clockOut: !date }))
                  }
                }}
                customInput={
                  <PickersComponent
                    label='Clock-Out Time'
                    registername='clockOut'
                    className='mbe-3'
                    id='clock-out-time'
                    required
                    error={errors.clockOut}
                  />
                }
              />
            </Grid>

            <Box className='w-full pb-1'>
              <FormControl fullWidth className='relative' error={errors.activities}>
                <InputLabel size='small'>Select Activities *</InputLabel>
                <Select
                  multiple
                  required
                  value={selectedItems}
                  onChange={handleChange}
                  renderValue={() => ''}
                  label='Select Activities *'
                  size='small'
                >
                  {serviceActivities?.map((svc: any) => (
                    <MenuItem key={svc.id} value={svc.id}>
                      {svc.title}
                    </MenuItem>
                  ))}
                </Select>
                {errors.activities && (
                  <span style={{ color: 'red', fontSize: '12px' }}>At least one activity is required</span>
                )}
                <Box className='flex flex-wrap gap-2 mt-2'>
                  {selectedItems.map(item => {
                    const service = serviceActivities.find((s: any) => s.id === item)
                    return (
                      <Chip
                        key={item}
                        onDelete={() => handleDelete(item)}
                        label={service?.title}
                        deleteIcon={<CloseIcon sx={theme => ({ fontSize: '14px', color: theme.palette.error.main })} />}
                        sx={theme => ({
                          backgroundColor:
                            theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main
                        })}
                        className='mt-2 text-[#fff] text-sm py-1'
                      />
                    )
                  })}
                </Box>
              </FormControl>
            </Box>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size='small'
                value={values.reason}
                label={'Reason'}
                placeholder={'Enter Reason'}
                multiline
                rows={3}
                type='text'
                onChange={e => {
                  setValues({
                    ...values,
                    reason: e.target.value.trimStart()
                  })
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                value={values.notes}
                size='small'
                label={'Notes'}
                placeholder={'Enter Notes'}
                multiline
                rows={3}
                type='text'
                onChange={e => {
                  setValues({ ...values, notes: e.target.value.trimStart() })
                }}
              />
            </Grid>

            <Grid
              size={{ xs: 12 }}
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                mt: 2
              }}
            >
              <Button variant='outlined' color='secondary' onClick={onDiscard}>
                DISCARD
              </Button>
              <Button variant='contained' color='primary' onClick={onSubmit} disabled={!isFormValid() || isLoading}>
                ADD LOG
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSuccessSnackbar(false)} severity='success' sx={{ width: '100%' }}>
          Time Log Created Successfully!
        </Alert>
      </Snackbar>
    </>
  )
}

export default ManualTimesheet

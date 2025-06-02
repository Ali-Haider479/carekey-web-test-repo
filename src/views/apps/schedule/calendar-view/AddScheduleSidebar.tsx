'use client'
import { useState, useEffect, forwardRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useForm, Controller } from 'react-hook-form'
import CustomTextField from '@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import {
  addEvent,
  deleteEvent,
  fetchEvents,
  filterEvents,
  selectedEvent,
  updateEvent
} from '@/redux-store/slices/calendar'
import axios from 'axios'
import FormModal from '@/@core/components/mui/Modal'
import { AddEventSidebarType, AddEventType } from '@/types/apps/calendarTypes'
import { Alert, CircularProgress, Grid2 as Grid, patch, Snackbar } from '@mui/material'
import CustomAlert from '@/@core/components/mui/Alter'
import api from '@/utils/api'

interface PickerProps {
  label?: string
  error?: boolean
  className?: string
  id?: string
  registername?: string
}

interface DefaultStateType {
  title: string
  status: string
  endDate: Date
  startDate: Date
  caregiver: string | undefined
  client: string
  service: string
  assignedHours: number | string
  startTime: Date
  endTime: Date
  notes: string
  location: string
  payPeriod: string
}

const defaultState: DefaultStateType = {
  title: '',
  caregiver: '',
  client: '',
  service: '',
  endDate: new Date(),
  status: 'pending',
  startDate: new Date(),
  startTime: new Date(),
  endTime: new Date(),
  assignedHours: 0,
  notes: '',
  location: '',
  payPeriod: ''
}

/**
 * Splits a time frame into 1 or 2 objects, depending on whether it crosses midnight.
 *
 * @param {Date} startDate - The starting date/time.
 * @param {number} assignedHours - The total assigned hours (in decimal). e.g. 4 or 5.5
 * @returns An array of one or two objects:
 *          {
 *            startDate: Date,
 *            assignedHours: number,
 *            endDate: Date
 *          }
 */
function createTimeFrames(startDate: Date, assignedHours: number) {
  // 1. Convert "assignedHours" to minutes (assuming standard decimal notation, e.g., 4.5 -> 4h 30m)
  const assignedMinutes = Math.floor(assignedHours * 60)

  // 2. Compute the naive end date by adding assignedMinutes to startDate
  const endDate = new Date(startDate.getTime() + assignedMinutes * 60_000)

  // 3. Calculate the "midnight boundary" of the start date (i.e., next midnight).
  const midnight = new Date(startDate)
  midnight.setHours(24, 0, 0, 0) // This sets hours to 24:00 of the same day => effectively midnight

  // 4. Check if endDate crosses that midnight boundary
  if (endDate <= midnight) {
    // No crossing: Just return one object
    return [
      {
        startDate: startDate,
        assignedHours: assignedHours,
        endDate: endDate
      }
    ]
  } else {
    // Crossing midnight, so split into two objects:

    // (a) First chunk: from startDate until midnight
    const firstChunkMinutes = (midnight.getTime() - startDate.getTime()) / 60_000
    const firstEndDate = new Date(startDate.getTime() + firstChunkMinutes * 60_000)

    // Convert chunk minutes to decimal hours
    const firstAssignedHours = Number((firstChunkMinutes / 60).toFixed(2))

    // (b) Second chunk: from midnight onward for the leftover
    const secondChunkMinutes = assignedMinutes - firstChunkMinutes
    const secondStartDate = new Date(midnight.getTime()) // same as firstEndDate
    const secondEndDate = new Date(secondStartDate.getTime() + secondChunkMinutes * 60_000)

    // Convert leftover minutes to decimal hours
    const secondAssignedHours = Number((secondChunkMinutes / 60).toFixed(2))

    return [
      {
        startDate: startDate,
        assignedHours: firstAssignedHours,
        endDate: firstEndDate
      },
      {
        startDate: secondStartDate,
        assignedHours: secondAssignedHours,
        endDate: secondEndDate
      }
    ]
  }
}

const AddEventModal = (props: AddEventSidebarType) => {
  const {
    calendarStore,
    dispatch,
    addEventSidebarOpen,
    handleAddEventSidebarToggle,
    isEdited,
    setIsEditedOff,
    handleAddEvent,
    handleUpdateEvent
  } = props
  const [values, setValues] = useState<DefaultStateType>(defaultState)
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<any>()
  const [clientUsers, setClientUsers] = useState<any>([])
  const [serviceType, setServiceType] = useState<any[]>([])
  const [serviceActivities, setServiceActivities] = useState<any>([])
  const [isAddEventLoading, setIsAddEventLoading] = useState(false)
  const [clientServiceAuth, setClientServiceAuth] = useState<any>()
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const fetchClientServiceAuth = async () => {
    try {
      if (values.client) {
        const res = await api.get(`/client/${values.client}/service-auth`)
        console.log('Client Service Auth Data: ', res.data)
        setClientServiceAuth(res.data)
      }
    } catch (error) {
      console.error('Error fetching client service auth: ', error)
    }
  }

  useEffect(() => {
    if (values.client) {
      fetchClientServiceAuth()
    }
  }, [values.client])

  const isFormValid = () => {
    return (
      values.title.trim() !== '' &&
      values.caregiver !== '' &&
      values.client !== '' &&
      values.service !== '' &&
      values.notes !== '' &&
      values.startDate instanceof Date &&
      !isNaN(values.startDate.getTime()) &&
      values.startTime instanceof Date &&
      !isNaN(values.startTime.getTime()) &&
      values.endDate instanceof Date &&
      !isNaN(values.endDate.getTime()) &&
      typeof values.assignedHours === 'number' &&
      values.assignedHours > 0
    )
  }

  const fetchClientUsers = async () => {
    try {
      const filterCg = props?.caregiverList?.filter((ele: any) => ele.id === values.caregiver)
      const caregiverUserId = filterCg[0]?.user?.id
      if (!caregiverUserId) return // Avoid fetching if caregiverUserId is not set
      const response = await api.get(`/user/clientUsers/${caregiverUserId}`)
      setClientUsers(response.data)
    } catch (error) {
      console.error('error fetching client users: ', error)
    }
  }

  useEffect(() => {
    fetchClientUsers()
  }, [values.caregiver])

  const fetchClientServiceType = async () => {
    try {
      if (!values.client) return // Avoid fetching if client is not set
      const response = await api.get(`/client/${values.client}/services`)
      setServiceType(response.data)
    } catch (error) {
      console.error('Error fetching client service type:', error)
    }
  }

  const clientServiceActivities = async () => {
    try {
      const activityIds = clientUsers[0]?.client?.serviceActivityIds
      if (!values.client) return // Avoid fetching if service is not set
      const response: any = await api.get(`/activity/activities/${activityIds}`)
      setServiceActivities(response?.data)
    } catch (error) {
      console.error('Error fetching client service activities:', error)
    }
  }

  useEffect(() => {
    fetchClientServiceType()
    clientServiceActivities()
  }, [values.client])

  const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
    return (
      <CustomTextField
        inputRef={ref}
        fullWidth
        {...props}
        label={props.label || ''}
        className={props.className}
        id={props.id}
        error={props.error}
      />
    )
  })

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const resetToStoredValues = useCallback(() => {
    if (calendarStore.selectedEvent !== null) {
      const event = calendarStore.selectedEvent
      setValue('title', event.title || '')
      setValues({
        title: event.title || '',
        endDate: event.end !== null ? event.end : event.start,
        startDate: event.start !== null ? event.start : new Date(),
        startTime: event.start !== null ? event.start : new Date(),
        endTime: event.end !== null ? event.end : event.start,
        status: (event?.extendedProps?.status || 'waiting').toLowerCase(),
        caregiver: event?.extendedProps?.caregiver?.id || event?.extendedProps?.caregiver,
        client: event?.extendedProps?.client?.id || event?.extendedProps?.client,
        service: event?.extendedProps?.service?.id || event?.extendedProps?.service,
        assignedHours: event?.extendedProps?.assignedHours,
        notes: event?.extendedProps?.notes,
        location: event?.extendedProps?.location,
        payPeriod: props?.payPeriod?.id
      })
    }
  }, [setValue, calendarStore.selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValues(defaultState)
  }, [setValue])

  const handleModalClose = () => {
    setValues(defaultState)
    clearErrors()
    dispatch(selectedEvent(null))
    handleAddEventSidebarToggle()
    setAlertOpen(false)
  }

  const calculateTotalDays = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate)

    const end = new Date(endDate)

    // Calculate the difference in days
    const timeDifference = end.getTime() - start.getTime()
    const totalDays = timeDifference / (24 * 60 * 60 * 1000) + 1

    return Math.round(totalDays) // Use Math.round to handle any floating point inaccuracies
  }

  const onSubmit = async () => {
    setIsAddEventLoading(true)
    if (clientServiceAuth?.length === 0) {
      setAlertOpen(true)
      setAlertMessage({
        message: 'Client must have a service auth to create a schedule',
        severity: 'error'
      })
      setIsAddEventLoading(false)
      return
    }
    if (clientServiceAuth?.length > 0 && clientServiceAuth[0]?.endDate < new Date()) {
      setAlertOpen(true)
      setAlertMessage({
        message: 'The service auth has expired. Please update the service auth before creating a schedule',
        severity: 'error'
      })
      setIsAddEventLoading(false)
      return
    }
    console.log('In onSubmit--------------->')
    const startDate = values.startDate
    const assignedHours = values.assignedHours
    const endDate =
      isEdited && calendarStore?.selectedEvent
        ? typeof assignedHours === 'number'
          ? new Date(startDate.getTime() + assignedHours * 60 * 60 * 1000)
          : values.endDate
        : values.endDate

    const bulkEvents: AddEventType[] = []

    // Calculate total days including cases where it crosses midnight
    const totalDays = calculateTotalDays(startDate, endDate)

    let currentDate = new Date(startDate)

    for (let i = 0; i < totalDays; i++) {
      const eventStartDate = new Date(currentDate)
      const finalStartDate = mergeDateWithTime(eventStartDate, values.startTime)
      // const finalEndDate = new Date(finalStartDate.getTime() + assignedHours * 60 * 60 * 1000)
      const finalEndDate =
        typeof assignedHours === 'number'
          ? new Date(finalStartDate.getTime() + assignedHours * 60 * 60 * 1000)
          : new Date(finalStartDate.getTime())

      bulkEvents.push({
        display: 'block',
        title: values.title,
        start: finalStartDate,
        end: finalEndDate,
        status: values.status,
        caregiverId: values.caregiver,
        clientId: values.client,
        serviceId: values.service,
        assignedHours: assignedHours,
        notes: values.notes || '',
        location: values.location || '',
        payPeriod: props?.payPeriod?.id,
        tenantId: authUser?.tenant?.id
      })

      // Move to the next day without modifying endDate
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Make a single API call with bulk data
    if (isEdited && calendarStore?.selectedEvent && calendarStore?.selectedEvent?.title !== '') {
      console.log('Editing Existing Event!!!!', calendarStore.selectedEvent.id)
      console.log('bulkEvents>>>>>', bulkEvents)
      console.log(startDate.getHours(), assignedHours)
      if (
        startDate.getHours() + startDate.getMinutes() / 60 + (typeof assignedHours === 'number' ? assignedHours : 0) >
        24
      ) {
        setAlertMessage({
          message: 'Please select hours with in the date',
          severity: 'error'
        })
        setAlertOpen(true)
        return
      } else {
        setAlertOpen(false)
      }
      try {
        if (bulkEvents.length === 1) {
          console.log('CALENDER STORE', calendarStore)
          const eventId = calendarStore?.selectedEvent?.id
          console.log('EVENT ID', eventId)
          const patchBody = {
            ...bulkEvents[0]
          }
          const updatedSchedule = await api.patch(`/schedule/${eventId}`, patchBody)
          handleUpdateEvent(updatedSchedule.data)
          handleModalClose()
        }
      } catch (error: any) {
        console.error('Error updating schedule:', error)
        if (error.status === 409) {
          setAlertOpen(true)
          setAlertMessage({
            message: 'Caregiver already has a schedule within same date and time',
            severity: 'error'
          })
        }
      } finally {
        setIsEditedOff
      }
    } else {
      try {
        const createSchedule = await api.post(`/schedule`, bulkEvents)
        console.log('Created schedule:', createSchedule.data)
        handleAddEvent(createSchedule.data)
        handleModalClose()
      } catch (error: any) {
        console.error('Error creating schedule:', error)
        if (error.status === 409) {
          setAlertOpen(true)
          setAlertMessage({
            message: 'Caregiver already has a schedule within same date and time',
            severity: 'error'
          })
        }
      }
    }

    dispatch(filterEvents())
    setIsAddEventLoading(false)
  }

  const mergeDateWithTime = (date: Date, time: Date): Date => {
    const mergedDate = new Date(date)
    mergedDate.setHours(time.getHours(), time.getMinutes(), 0, 0)
    return mergedDate
  }

  const handleDeleteButtonClick = () => {
    if (calendarStore.selectedEvent) {
      dispatch(deleteEvent(calendarStore.selectedEvent.id))
      dispatch(filterEvents())
    }
    handleModalClose()
  }

  const handleStartDate = (date: Date | null) => {
    if (date && date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    }
  }

  const handleStartTime = (date: Date | null) => {
    if (date && date > values.endTime) {
      setValues({ ...values, startTime: new Date(date), endTime: new Date(date) })
    }
  }

  useEffect(() => {
    if (calendarStore.selectedEvent !== null) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
    }
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, calendarStore.selectedEvent])

  return (
    <>
      <FormModal
        isModalOpen={addEventSidebarOpen}
        setIsModalOpen={handleAddEventSidebarToggle}
        title={
          calendarStore.selectedEvent && calendarStore.selectedEvent.title.length ? 'Update Event' : 'Create an Event'
        }
        handleCancel={handleModalClose}
        bodyStyle={{ padding: 0 }}
      >
        {alertOpen === true && (
          <Alert onClose={() => setAlertOpen(false)} severity={alertMessage?.severity}>
            {alertMessage?.message}
          </Alert>
        )}
        <div className='flex items-center justify-center pt-[20px] pb-[20px] w-full px-5'>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
            {/* <Controller
            name='title'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                label='Event title'
                value={value}
                onChange={onChange}
                fullWidth
                className='mbe-3'
                id='event-title'
                {...(errors.title && { error: true, helperText: 'This field is required' })}
              />
            )}
          /> */}

            <CustomTextField
              fullWidth
              className='mbe-3'
              label='Event title'
              value={values.title}
              id='event-title'
              onChange={e => setValues({ ...values, title: e.target.value })}
            />

            <CustomTextField
              select
              fullWidth
              className='mbe-3'
              label='Caregiver'
              disabled={isEdited && calendarStore?.selectedEvent?.title?.length}
              value={values?.caregiver}
              id='caregiver-schedule'
              onChange={e => setValues({ ...values, caregiver: e.target.value })}
            >
              {props?.caregiverList.length > 0 ? (
                props?.caregiverList.map((caregiver: any) => (
                  <MenuItem key={caregiver.id} value={caregiver.id}>
                    {`${caregiver.firstName} ${caregiver.lastName}`}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No options available</MenuItem>
              )}
            </CustomTextField>

            <CustomTextField
              select
              fullWidth
              className='mbe-3'
              label='Client'
              value={values?.client}
              disabled={isEdited && calendarStore?.selectedEvent?.title?.length}
              id='client-schedule'
              onChange={e => setValues({ ...values, client: e.target.value })}
            >
              {clientUsers?.length > 0 ? (
                clientUsers.map((client: any) => (
                  <MenuItem key={client.client.id} value={client.client.id}>
                    {`${client.client.firstName} ${client.client.lastName}`}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No options available</MenuItem>
              )}
            </CustomTextField>

            <CustomTextField
              select
              fullWidth
              className='mbe-3'
              label='Event type'
              value={values?.service}
              id='service-schedule'
              onChange={e => setValues({ ...values, service: e.target.value })}
            >
              {serviceType?.length > 0 ? (
                serviceType?.map((service: any) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No options available</MenuItem>
              )}
            </CustomTextField>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <AppReactDatepicker
                  selectsStart
                  id='event-start-date'
                  endDate={values.endDate}
                  selected={values.startDate}
                  startDate={values.startDate}
                  showTimeSelect={!values.startDate}
                  dateFormat={!values.startDate ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                  disabled={isEdited && calendarStore?.selectedEvent?.title?.length}
                  customInput={
                    <PickersComponent
                      label='Start Date'
                      registername='startDate'
                      className='mbe-3'
                      id='event-start-date'
                    />
                  }
                  onChange={(date: Date | null) => {
                    if (date !== null) {
                      // Combine the selected start date with the selected start time
                      setValues({
                        ...values,
                        startDate: mergeDateWithTime(date, values.startTime)
                      })
                    }
                  }}
                  onSelect={handleStartDate}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AppReactDatepicker
                  showTimeSelect
                  onSelect={handleStartTime}
                  selected={values.startTime}
                  timeIntervals={15}
                  showTimeSelectOnly
                  dateFormat='hh:mm aa'
                  id='time-only-picker'
                  disabled={isEdited && calendarStore?.selectedEvent?.title?.length}
                  onChange={(date: Date | null) => {
                    if (date !== null) {
                      // Combine the selected start date with the selected start time
                      setValues({
                        ...values,
                        startTime: date,
                        startDate: mergeDateWithTime(values.startDate, date)
                      })
                    }
                  }}
                  customInput={
                    <PickersComponent
                      label='Start Time'
                      registername='startTime'
                      className='mbe-3'
                      id='event-start-time'
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AppReactDatepicker
                  selectsEnd
                  id='event-end-date'
                  endDate={values.endDate}
                  selected={values.endDate}
                  minDate={values.startDate}
                  startDate={values.startDate}
                  showTimeSelect={!values.endDate}
                  dateFormat={!values.endDate ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                  customInput={
                    <PickersComponent label='End Date' registername='endDate' className='mbe-3' id='event-end-date' />
                  }
                  disabled={isEdited && calendarStore?.selectedEvent?.title?.length}
                  onChange={(date: Date | null) => {
                    if (date !== null) {
                      // Combine the selected end date with the selected end time
                      setValues({
                        ...values,
                        endDate: date
                      })
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {/* <AppReactDatepicker
                showTimeSelect
                selected={values.endTime}
                timeIntervals={1}
                minDate={values.startTime}
                startDate={values.startTime}
                showTimeSelectOnly
                dateFormat='hh:mm aa'
                id='time-only-picker'
                onChange={(date: Date | null) => {
                  if (date !== null) {
                    // Combine the selected end date with the selected end time
                    setValues({
                      ...values,
                      endTime: date,
                      endDate: mergeDateWithTime(values.endDate, date)
                    })
                  }
                }}
                customInput={
                  <PickersComponent label='End Time' registername='endTime' className='mbe-3' id='event-end-time' />
                }
              /> */}
                <CustomTextField
                  fullWidth
                  className='mbe-3'
                  label='Assigned Hours (Per Day)'
                  value={values.assignedHours}
                  id='event-assignedHours'
                  type='number'
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: 24,
                      step: 0.25
                    }
                  }}
                  // onChange={e => setValues({ ...values, assignedHours: Number(e.target.value) })}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    // Allow digits, decimal point, backspace, delete, tab, enter, and arrow keys
                    const allowedKeys = [
                      '0',
                      '1',
                      '2',
                      '3',
                      '4',
                      '5',
                      '6',
                      '7',
                      '8',
                      '9',
                      '.',
                      'Backspace',
                      'Delete',
                      'Tab',
                      'Enter',
                      'ArrowLeft',
                      'ArrowRight'
                    ]
                    // Allow Ctrl/Cmd + A, C, V, X for select, copy, paste, cut
                    if (e.ctrlKey || e.metaKey) {
                      allowedKeys.push('a', 'c', 'v', 'x')
                    }
                    if (!allowedKeys.includes(e.key)) {
                      e.preventDefault()
                    }
                    // Prevent multiple decimal points
                    if (e.key === '.' && (e.target as HTMLInputElement).value.includes('.')) {
                      e.preventDefault()
                    }
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value
                    // Allow empty string or valid number (e.g., "123", "12.34")
                    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                      let newValue: number | string = value === '' ? '' : parseFloat(value)
                      if (typeof newValue === 'number') {
                        if (isNaN(newValue)) {
                          newValue = '' // Handle invalid number
                        } else {
                          if (newValue > 24) {
                            newValue = 24 // Cap at 24
                          }
                          if (newValue < 0) {
                            newValue = 0 // Prevent negative values
                          }
                        }
                      }
                      setValues({ ...values, assignedHours: newValue })
                    }
                  }}
                  error={
                    typeof values.assignedHours === 'number' &&
                    (values.assignedHours > 24 || isNaN(values.assignedHours))
                  }
                  helperText={
                    typeof values.assignedHours === 'number' && values.assignedHours > 24
                      ? 'Assigned hours cannot exceed 24.'
                      : typeof values.assignedHours === 'number' && isNaN(values.assignedHours)
                        ? 'Please enter a valid number.'
                        : ''
                  }
                />
              </Grid>
            </Grid>
            {/* <CustomTextField
            select
            fullWidth
           className='mbe-3'
            label='Status'
            value={values.status}
            id='event-status'
            onChange={e => setValues({ ...values, status: e.target.value })}
          >
            <MenuItem value='pending'>Pending</MenuItem>
            <MenuItem value='waiting'>Waiting</MenuItem>
          </CustomTextField> */}

            <CustomTextField
              fullWidth
              className='mbe-3'
              label='Location'
              value={values.location}
              id='event-location'
              onChange={e => setValues({ ...values, location: String(e.target.value) })}
            />
            <CustomTextField
              label='Notes or instructions'
              multiline={true}
              value={values.notes}
              onChange={e => setValues({ ...values, notes: e.target.value })}
              fullWidth
              className='mbe-3'
              id='event-notes'
            />
            <div className='flex gap-4 justify-end'>
              {calendarStore.selectedEvent && calendarStore.selectedEvent.title.length ? (
                <>
                  <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                    CANCEL
                  </Button>
                  <Button type='submit' variant='contained' className='bg-[#4B0082]' disabled={!isFormValid()}>
                    Update
                  </Button>
                  {/* <Button variant='outlined' color='secondary' onClick={resetToStoredValues}>
                  Reset
                </Button> */}
                  {/* <Button variant='outlined' color='error' onClick={handleDeleteButtonClick}>
                  Delete
                </Button> */}
                </>
              ) : (
                <>
                  <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                    CANCEL
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    className='bg-[#4B0082]'
                    startIcon={isAddEventLoading ? <CircularProgress size={20} color='inherit' /> : null}
                    disabled={!isFormValid() || isAddEventLoading}
                  >
                    ADD EVENT
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
      </FormModal>
    </>
  )
}

export default AddEventModal

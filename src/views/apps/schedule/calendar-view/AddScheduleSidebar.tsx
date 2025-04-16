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
import { Alert, Grid2 as Grid, patch, Snackbar } from '@mui/material'
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
  assignedHours: number
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
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

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
    console.log('In onSubmit--------------->')
    const startDate = values.startDate
    const assignedHours = values.assignedHours
    const endDate =
      isEdited && calendarStore?.selectedEvent
        ? new Date(startDate.getTime() + assignedHours * 60 * 60 * 1000)
        : values.endDate

    const bulkEvents: AddEventType[] = []

    // Calculate total days including cases where it crosses midnight
    const totalDays = calculateTotalDays(startDate, endDate)

    let currentDate = new Date(startDate)

    for (let i = 0; i < totalDays; i++) {
      const eventStartDate = new Date(currentDate)
      const finalStartDate = mergeDateWithTime(eventStartDate, values.startTime)
      const finalEndDate = new Date(finalStartDate.getTime() + assignedHours * 60 * 60 * 1000)

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
        notes: values.notes,
        location: values.location,
        payPeriod: props?.payPeriod?.id,
        tenantId: authUser?.tenant?.id
      })

      // Move to the next day without modifying endDate
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Make a single API call with bulk data
    if (isEdited && calendarStore?.selectedEvent) {
      console.log('Editing Existing Event!!!!', calendarStore.selectedEvent.id)
      console.log('bulkEvents>>>>>', bulkEvents)
      console.log(startDate.getHours(), assignedHours)
      if (startDate.getHours() + startDate.getMinutes() / 60 + assignedHours > 24) {
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
          const eventId = calendarStore?.selectedEvent?.id
          const patchBody = {
            ...bulkEvents[0]
          }
          const updatedSchedule = await api.patch(`/schedule/${eventId}`, patchBody)
          handleUpdateEvent(updatedSchedule.data)
        }
      } catch (error) {
        console.error('Error updating schedule:', error)
      } finally {
        setIsEditedOff
      }
    } else {
      try {
        const createSchedule = await api.post(`/schedule`, bulkEvents)
        console.log('Created schedule:', createSchedule.data)
        handleAddEvent(createSchedule.data)
      } catch (error) {
        console.error('Error creating schedule:', error)
      }
    }

    dispatch(filterEvents())
    handleModalClose()
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
              label='Event type'
              value={values?.service}
              id='service-schedule'
              onChange={e => setValues({ ...values, service: e.target.value })}
            >
              {props?.serviceList?.length > 0 ? (
                props.serviceList.map((service: any) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
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
              disabled={isEdited && calendarStore.selectedEvent}
              id='client-schedule'
              onChange={e => setValues({ ...values, client: e.target.value })}
            >
              {props?.clientList?.length > 0 ? (
                props?.clientList.map((client: any) => (
                  <MenuItem key={client.id} value={client.id}>
                    {`${client.firstName} ${client.lastName}`}
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
              label='Caregiver'
              disabled={isEdited && calendarStore.selectedEvent}
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
                  disabled={isEdited && calendarStore.selectedEvent}
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
                  disabled={isEdited && calendarStore.selectedEvent}
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
                  disabled={isEdited && calendarStore.selectedEvent}
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
                  onChange={e => setValues({ ...values, assignedHours: Number(e.target.value) })}
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
                  <Button type='submit' variant='contained' className='bg-[#4B0082]'>
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
                  <Button type='submit' variant='contained' className='bg-[#4B0082]'>
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

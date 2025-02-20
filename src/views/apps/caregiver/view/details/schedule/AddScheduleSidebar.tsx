import { useState, useEffect, forwardRef, useCallback, use } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useForm, Controller } from 'react-hook-form'
import CustomTextField from '@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { addEvent, deleteEvent, filterEvents, selectedEvent, updateEvent } from '@/redux-store/slices/calendar'
import axios from 'axios'
import FormModal from '@/@core/components/mui/Modal'
import { AddEventSidebarType, AddEventType } from '@/types/apps/calendarTypes'
import { Alert, Grid2 as Grid, TextField } from '@mui/material'
import { useParams } from 'next/navigation'

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
  const [caregiver, setCaregiver] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { calendarStore, dispatch, addEventSidebarOpen, handleAddEventSidebarToggle } = props
  const [values, setValues] = useState<DefaultStateType>(defaultState)
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<any>()
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
    handleSubmit,
    formState: { errors }
  } = useForm()

  const resetToStoredValues = useCallback(() => {
    if (calendarStore.selectedEvent !== null) {
      const event = calendarStore.selectedEvent
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
  }, [calendarStore.selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValues(defaultState)
  }, [])

  const handleModalClose = () => {
    setValues(defaultState)
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
    const startDate = values.startDate
    const assignedHours = values.assignedHours
    const endDate =
      props.isEdited && calendarStore?.selectedEvent
        ? new Date(startDate?.getTime() + assignedHours * 60 * 60 * 1000)
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
        caregiverId: props.data.id,
        clientId: values.client,
        serviceId: values.service,
        assignedHours: assignedHours,
        notes: values.notes,
        location: values.location,
        payPeriod: props?.payPeriod?.id
      })

      // Move to the next day without modifying endDate
      currentDate.setDate(currentDate.getDate() + 1)
    }

    if (props.isEdited && calendarStore.selectedEvent) {
      // console.log('Editing Existing Event!!!!', calendarStore.selectedEvent.id)
      // console.log('bulkEvents>>>>>', bulkEvents)
      // console.log(startDate.getHours(), assignedHours)
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
          const eventId = calendarStore.selectedEvent.id
          const patchBody = {
            ...bulkEvents[0]
          }
          const updatedSchedule = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/schedule/${eventId}`, patchBody)
          props.handleUpdateEvent(updatedSchedule.data)
        }
      } catch (error) {
        console.error('Error updating schedule:', error)
      } finally {
        props.setIsEditedOff
      }
    } else {
      // Make a single API call with bulk data
      try {
        // console.log('bulkEvents', bulkEvents)
        if (bulkEvents.length > 0) {
          const createSchedule = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/schedule`, bulkEvents)
          props.handleAddEvent(createSchedule.data)
        }
      } catch (error) {
        console.error('Error creating schedule:', error)
      }
    }
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
    if (props.data) {
      setCaregiver(props.data)
      setValues({ ...values, caregiver: props.data?.id })
    }
  }, [props?.data])

  useEffect(() => {
    if (calendarStore.selectedEvent !== null) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
    }
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, calendarStore.selectedEvent])

  return (
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
            {props?.serviceList.map((service: any) => (
              <MenuItem key={service.id} value={service.id}>
                {service.name}
              </MenuItem>
            ))}
          </CustomTextField>

          <CustomTextField
            select
            fullWidth
            className='mbe-3'
            label='Client'
            value={values?.client}
            id='client-schedule'
            onChange={e => setValues({ ...values, client: e.target.value })}
            disabled={props.isEdited && calendarStore.selectedEvent}
          >
            {props?.clientList.map((client: any) => (
              <MenuItem key={client.id} value={client.id}>
                {`${client.firstName} ${client.lastName}`}
              </MenuItem>
            ))}
          </CustomTextField>

          {caregiver && (
            <CustomTextField
              fullWidth
              className='mbe-3'
              label='Caregiver'
              value={`${caregiver.firstName} ${caregiver.lastName}`}
              id='caregiver-schedule'
              disabled={true}
            />
          )}
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
                customInput={
                  <PickersComponent
                    label='Start Date'
                    registername='startDate'
                    className='mbe-3'
                    id='event-start-date'
                  />
                }
                disabled={props.isEdited && calendarStore.selectedEvent}
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
                disabled={props.isEdited && calendarStore.selectedEvent}
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
                minDate={new Date(values.startDate.getTime() + 15 * 60 * 1000)}
                startDate={values.startDate}
                showTimeSelect={!values.endDate}
                dateFormat={!values.endDate ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                customInput={
                  <PickersComponent label='End Date' registername='endDate' className='mbe-3' id='event-end-date' />
                }
                disabled={props.isEdited && calendarStore.selectedEvent}
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
              <CustomTextField
                fullWidth
                className='mbe-3'
                label='Assigned Hours'
                value={values.assignedHours}
                id='event-assignedHours'
                onChange={e => setValues({ ...values, assignedHours: Number(e.target.value) })}
              />
            </Grid>
          </Grid>

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
  )
}

export default AddEventModal

import { useState, useEffect, forwardRef, useCallback } from 'react'
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
  notes: string
  location: string
}

const defaultState: DefaultStateType = {
  title: '',
  caregiver: '',
  client: '',
  service: '',
  endDate: new Date(),
  status: 'pending',
  startDate: new Date(),
  assignedHours: 0,
  notes: '',
  location: ''
}

const AddEventModal = (props: AddEventSidebarType) => {
  const { calendarStore, dispatch, addEventSidebarOpen, handleAddEventSidebarToggle } = props
  const [values, setValues] = useState<DefaultStateType>(defaultState)
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
        status: (event?.extendedProps?.status || 'waiting').toLowerCase(),
        caregiver: event?.extendedProps?.caregiver?.id || event?.extendedProps?.caregiver,
        client: event?.extendedProps?.client?.id || event?.extendedProps?.client,
        service: event?.extendedProps?.service?.id || event?.extendedProps?.service,
        assignedHours: event?.extendedProps?.assignedHours,
        notes: event?.extendedProps?.notes,
        location: event?.extendedProps?.location
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

  const onSubmit = async (data: { title: string }) => {
    const modifiedEvent: AddEventType = {
      display: 'block',
      title: data.title,
      end: values.endDate,
      start: values.startDate,
      status: values.status,
      caregiverId: values.caregiver,
      clientId: values.client,
      serviceId: values.service,
      assignedHours: values.assignedHours,
      notes: values.notes,
      location: values.location
    }
    if (calendarStore.selectedEvent === null || !calendarStore.selectedEvent.title.length) {
      const createSchedule = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/schedule`, modifiedEvent)
      dispatch(addEvent(createSchedule.data))
    } else {
      const updateSchedule = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/schedule/${calendarStore.selectedEvent.id}`,
        modifiedEvent
      )
      dispatch(updateEvent({ ...updateSchedule.data, id: calendarStore.selectedEvent.id }))
    }

    dispatch(filterEvents())
    handleModalClose()
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
      <div className='flex items-center justify-center pt-[20px] pb-[20px] w-full px-5'>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
          <Controller
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
          >
            {props?.clientList.map((client: any) => (
              <MenuItem key={client.id} value={client.id}>
                {`${client.firstName} ${client.lastName}`}
              </MenuItem>
            ))}
          </CustomTextField>

          <CustomTextField
            select
            fullWidth
            className='mbe-3'
            label='Caregiver'
            value={values?.caregiver}
            id='caregiver-schedule'
            onChange={e => setValues({ ...values, caregiver: e.target.value })}
          >
            {props?.caregiverList.map((caregiver: any) => (
              <MenuItem key={caregiver.id} value={caregiver.id}>
                {`${caregiver.firstName} ${caregiver.lastName}`}
              </MenuItem>
            ))}
          </CustomTextField>

          <AppReactDatepicker
            selectsStart
            id='event-start-date'
            endDate={values.endDate}
            selected={values.startDate}
            startDate={values.startDate}
            showTimeSelect={!values.startDate}
            dateFormat={!values.startDate ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
            customInput={
              <PickersComponent label='Start Date' registername='startDate' className='mbe-3' id='event-start-date' />
            }
            onChange={(date: Date | null) => date !== null && setValues({ ...values, startDate: new Date(date) })}
            onSelect={handleStartDate}
          />
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
            onChange={(date: Date | null) => date !== null && setValues({ ...values, endDate: new Date(date) })}
          />

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
            label='Assigned Hours'
            value={values.assignedHours}
            id='event-assignedHours'
            onChange={e => setValues({ ...values, assignedHours: Number(e.target.value) })}
          />
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
  )
}

export default AddEventModal

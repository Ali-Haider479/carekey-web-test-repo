// React Imports
import { useState, useEffect, forwardRef, useCallback } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import type { SelectChangeEvent } from '@mui/material/Select'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Type Imports
import type { AddEventSidebarType, AddEventType } from '@/types/apps/calendarTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { addEvent, deleteEvent, filterEvents, selectedEvent, updateEvent } from '@/redux-store/slices/calendar'
import axios from 'axios'

// Slice Imports

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
}

// Vars
const capitalize = (string: string) => string && string[0].toUpperCase() + string.slice(1)

// Vars
const defaultState: DefaultStateType = {
  title: '',
  caregiver: '',
  client: '',
  service: '',
  endDate: new Date(),
  status: 'pending',
  startDate: new Date(),
  assignedHours: 0
}

const AddEventSidebar = (props: AddEventSidebarType) => {
  // Props
  const { calendarStore, dispatch, addEventSidebarOpen, handleAddEventSidebarToggle } = props

  // States
  const [values, setValues] = useState<DefaultStateType>(defaultState)

  // Refs
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

  // Hooks
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
        assignedHours: event?.extendedProps?.assignedHours
      })
    }
  }, [setValue, calendarStore.selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValues(defaultState)
  }, [setValue])

  const handleSidebarClose = () => {
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
      assignedHours: values.assignedHours
    }
    if (
      calendarStore.selectedEvent === null ||
      (calendarStore.selectedEvent !== null && !calendarStore.selectedEvent.title.length)
    ) {
      const createSchedule = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/schedule`, modifiedEvent)
      const response = createSchedule.data
      dispatch(addEvent(response))
    } else {
      const updateSchedule = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/schedule/${calendarStore.selectedEvent.id}`,
        modifiedEvent
      )
      const response = updateSchedule.data
      dispatch(updateEvent({ ...response, id: calendarStore.selectedEvent.id }))
    }

    dispatch(filterEvents())

    handleSidebarClose()
  }

  const handleDeleteButtonClick = () => {
    if (calendarStore.selectedEvent) {
      dispatch(deleteEvent(calendarStore.selectedEvent.id))
      dispatch(filterEvents())
    }

    // calendarApi.getEventById(calendarStore.selectedEvent.id).remove()
    handleSidebarClose()
  }

  const handleStartDate = (date: Date | null) => {
    if (date && date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    }
  }

  const RenderSidebarFooter = () => {
    if (
      calendarStore.selectedEvent === null ||
      (calendarStore.selectedEvent && !calendarStore.selectedEvent.title.length)
    ) {
      return (
        <div className='flex gap-4'>
          <Button type='submit' variant='contained'>
            Add
          </Button>
          <Button variant='tonal' color='secondary' onClick={resetToEmptyValues}>
            Reset
          </Button>
        </div>
      )
    } else {
      return (
        <div className='flex gap-4'>
          <Button type='submit' variant='contained'>
            Update
          </Button>
          <Button variant='tonal' color='secondary' onClick={resetToStoredValues}>
            Reset
          </Button>
        </div>
      )
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
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', 400] } }}
    >
      <Box className='flex items-center justify-between sidebar-header plb-5 pli-6 border-be'>
        <Typography variant='h5'>
          {calendarStore.selectedEvent && calendarStore.selectedEvent.title.length ? 'Update Event' : 'Add Event'}
        </Typography>
        {calendarStore.selectedEvent && calendarStore.selectedEvent.title.length ? (
          <Box className='flex items-center' sx={{ gap: calendarStore.selectedEvent !== null ? 1 : 0 }}>
            <IconButton size='small' onClick={handleDeleteButtonClick}>
              <i className='bx-trash-alt text-2xl' />
            </IconButton>
            <IconButton size='small' onClick={handleSidebarClose}>
              <i className='bx-x text-2xl' />
            </IconButton>
          </Box>
        ) : (
          <IconButton size='small' onClick={handleSidebarClose}>
            <i className='bx-x text-2xl' />
          </IconButton>
        )}
      </Box>
      <Box className='sidebar-body p-6'>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
          <Controller
            name='title'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                label='Title'
                value={value}
                onChange={onChange}
                fullWidth
                className='mbe-6'
                id='event-title'
                {...(errors.title && { error: true, helperText: 'This field is required' })}
              />
            )}
          />
          <CustomTextField
            select
            fullWidth
            className='mbe-6'
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
          <CustomTextField
            select
            fullWidth
            className='mbe-6'
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
            className='mbe-6'
            label='Service'
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
          <AppReactDatepicker
            selectsStart
            id='event-start-date'
            endDate={values.endDate}
            selected={values.startDate}
            startDate={values.startDate}
            showTimeSelect={!values.startDate}
            dateFormat={!values.startDate ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
            customInput={
              <PickersComponent label='Start Date' registername='startDate' className='mbe-6' id='event-start-date' />
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
              <PickersComponent label='End Date' registername='endDate' className='mbe-6' id='event-end-date' />
            }
            onChange={(date: Date | null) => date !== null && setValues({ ...values, endDate: new Date(date) })}
          />
          <CustomTextField
            select
            fullWidth
            className='mbe-6'
            label='Status'
            value={values.status}
            id='event-status'
            onChange={e => setValues({ ...values, status: e.target.value })}
          >
            <MenuItem value='pending'>Pending</MenuItem>
            <MenuItem value='waiting'>Waiting</MenuItem>
          </CustomTextField>
          <CustomTextField
            fullWidth
            className='mbe-6'
            label='Assigned Hours'
            value={values.assignedHours}
            id='event-assignedHours'
            onChange={e => setValues({ ...values, assignedHours: Number(e.target.value) })}
          />
          <div className='flex items-center'>
            <RenderSidebarFooter />
          </div>
        </form>
      </Box>
    </Drawer>
  )
}

export default AddEventSidebar

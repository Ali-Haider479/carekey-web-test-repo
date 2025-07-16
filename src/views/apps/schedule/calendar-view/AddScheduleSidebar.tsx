'use client'
import { useState, useEffect, forwardRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useForm, Controller, FormProvider } from 'react-hook-form'
import CustomTextField from '@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import {
  addEvent,
  deleteEvent,
  fetchEvents,
  filterEvents,
  selectedEvent,
  setSelectedDate,
  updateEvent
} from '@/redux-store/slices/calendar'
import axios from 'axios'
import FormModal from '@/@core/components/mui/Modal'
import { AddEventSidebarType, AddEventType } from '@/types/apps/calendarTypes'
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  FormLabel,
  Grid2 as Grid,
  patch,
  Snackbar,
  useTheme
} from '@mui/material'
import CustomAlert from '@/@core/components/mui/Alter'
import api from '@/utils/api'
import { serviceStatuses, staffRatio } from '@/utils/constants'
import {
  AccessTime as Clock,
  PeopleAlt as Users,
  Work as Briefcase,
  Person as User,
  HowToReg as UserCheck,
  CalendarToday as Calendar,
  EditNote as Note,
  KeyboardArrowDown as ChevronDown,
  ExpandLess as ChevronUp
} from '@mui/icons-material'
import { formatTimeTo12hr } from '@/utils/helperFunctions'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { useAppDispatch } from '@/hooks/useDispatch'

interface PickerProps {
  label?: string
  error?: boolean
  className?: string
  id?: string
  registername?: string
}

interface DefaultStateType {
  title: string
  endDate: Date
  startDate: Date
  caregiver: string | undefined
  client: string
  service: string
  assignedHours: number | string
  status: string
  staffRatio: string
  frequency?: string
  serviceAuth: string
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
  startDate: new Date(),
  startTime: new Date(),
  endTime: new Date(),
  assignedHours: 0,
  notes: '',
  location: '',
  payPeriod: '',
  staffRatio: '',
  status: 'scheduled',
  serviceAuth: '',
  frequency: ''
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
    // dispatch,
    addEventSidebarOpen,
    handleAddEventSidebarToggle,
    isEdited,
    setIsEditedOff,
    handleAddEvent,
    handleUpdateEvent,
    selectedDate
  } = props
  const [values, setValues] = useState<DefaultStateType>(defaultState)
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<any>()
  const [clientUsers, setClientUsers] = useState<any>([])
  const [serviceType, setServiceType] = useState<any[]>([])
  const [serviceActivities, setServiceActivities] = useState<any>([])
  const [isAddEventLoading, setIsAddEventLoading] = useState(false)
  const [clientServiceAuth, setClientServiceAuth] = useState<any>()
  const [selectedService, setSelectedService] = useState<any>()
  const [selectedServiceAuth, setSelectedServiceAuth] = useState<any>()
  const [activeClientServiceAuth, setActiveClientServiceAuth] = useState<any>()
  const [serviceAuthUnitsRemaining, setServiceAuthUnitsRemaining] = useState<any>(0)
  const [isDeleteModalShow, setIsDeleteModalShow] = useState<boolean>(false)
  const [bulkDeleteChecked, setBulkDeleteChecked] = useState<boolean>(false)
  const [deleteButtonLoading, setDeleteButtonLoading] = useState<boolean>(false)
  const [bulkEditChecked, setBulkEditChecked] = useState<boolean>(false)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const [showPreview, setShowPreview] = useState(true)
  const theme = useTheme()

  console.log('calendarStore in Add Schedule Side Bar ---->', calendarStore)

  const dispatch = useAppDispatch()

  const handleBulkDeleteChange = () => {
    if (!bulkDeleteChecked) {
      setBulkDeleteChecked(true)
    } else {
      setBulkDeleteChecked(false)
    }
  }

  const handleBulkEditChange = () => {
    if (!bulkEditChecked) {
      setBulkEditChecked(true)
    } else {
      setBulkEditChecked(false)
    }
  }

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
  }, [values.client, calendarStore.selectedEvent])

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
  }, [values.caregiver, calendarStore.selectedEvent])

  const fetchClientServiceType = async () => {
    try {
      if (!values.client) return // Avoid fetching if client is not set
      const response = await api.get(`/client/${values.client}/services`)
      const serviceAuthServicesRes = await api.get(`/client/${values.client}/service-auth/services`)
      setServiceType([...response.data, ...serviceAuthServicesRes.data])
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
  }, [values.client, calendarStore.selectedEvent])

  useEffect(() => {
    if (values.service) {
      console.log('Service Type ---->> ', serviceType, values.service)
      const filteredServiceType = serviceType.find(item => item.clientServiceId === values.service)
      console.log('Filtered ServiceType ----->> ', filteredServiceType)
      setSelectedService(filteredServiceType)
      const corrospondingServiceAuth = clientServiceAuth?.filter(
        (item: any) =>
          item.procedureCode === filteredServiceType?.procedureCode &&
          (item.modifierCode === filteredServiceType?.modifierCode ||
            (item.modifierCode === null && filteredServiceType?.modifierCode === null))
      )
      console.log('Corrosponding Service Auth for service: ', corrospondingServiceAuth)
      const activeCorrospondingServiceAuth = corrospondingServiceAuth?.filter(
        (item: any) => new Date(item.endDate) > new Date()
      )
      console.log('Active Service Auths: ', activeCorrospondingServiceAuth)
      setActiveClientServiceAuth(activeCorrospondingServiceAuth)
    }
  }, [values.service, calendarStore.selectedEvent])

  useEffect(() => {
    if (values.serviceAuth && clientServiceAuth?.length > 0) {
      const selectedServiceAuth = clientServiceAuth.find((item: any) => item.id === values.serviceAuth)
      console.log('Selected Service Auth: ', selectedServiceAuth)
      setSelectedServiceAuth(selectedServiceAuth)
      const remainingUnits = selectedServiceAuth?.units - selectedServiceAuth?.usedUnits
      console.log('Remaining Units in Service Auth: ', remainingUnits)
      setServiceAuthUnitsRemaining(remainingUnits)
    }
  }, [values.serviceAuth, calendarStore.selectedEvent])

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
    register,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const resetToStoredValues = useCallback(() => {
    if (calendarStore.selectedEvent !== null) {
      const event = calendarStore.selectedEvent
      console.log('Resetting to stored values for event:', event)
      setValue('title', event.title || '')
      setValues({
        title: event.title || '',
        endDate: event.end !== null ? event.end : event.start,
        startDate: event.start !== null ? new Date(event.start) : new Date(),
        startTime: event.start !== null ? event.start : new Date(),
        endTime: event.end !== null ? event.end : event.start,
        caregiver: event?.caregiver?.id || event?.caregiver,
        client: event?.client?.id || event.client,
        service: event?.clientService?.id,
        assignedHours: event?.assignedHours,
        notes: event?.notes,
        location: event?.location,
        status: 'scheduled',
        frequency: event?.frequency || '',
        payPeriod: props?.payPeriod?.id,
        staffRatio: event?.staffRatio || '',
        serviceAuth: event?.serviceAuth?.id || event?.serviceAuth
      })
    }
  }, [setValue, calendarStore.selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    console.log('Value of selected Date in resetToEmptyValues --->>', calendarStore)
    setValues({
      ...defaultState,
      startDate: calendarStore?.selectedDate
        ? mergeDateWithTime(new Date(calendarStore?.selectedDate), values.startTime)
        : new Date(),
      endDate: calendarStore?.selectedDate
        ? mergeDateWithTime(new Date(calendarStore?.selectedDate), values.endTime)
        : new Date()
    })
  }, [setValue, calendarStore])

  const handleModalClose = () => {
    setValues(defaultState)
    clearErrors()
    dispatch(selectedEvent(null))
    dispatch(setSelectedDate(null))
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
    if (selectedServiceAuth && new Date(selectedServiceAuth.endDate) < new Date()) {
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
          ? new Date(new Date(startDate).getTime() + assignedHours * 60 * 60 * 1000)
          : values.endDate
        : values.endDate

    const bulkEvents: AddEventType[] = []
    const editBulkEvents: AddEventType[] = []

    // Calculate total days including cases where it crosses midnight
    const totalDays = calculateTotalDays(startDate, endDate)

    const unitsPerDay = Math.ceil(Number(assignedHours) * 4)
    const totalUsedUnits = Number(unitsPerDay) * Number(totalDays)

    const totalUsedHours = (totalUsedUnits / 4).toFixed(2)
    const remainingHours = (serviceAuthUnitsRemaining / 4).toFixed(2)

    if (totalUsedUnits > serviceAuthUnitsRemaining) {
      setAlertOpen(true)
      setAlertMessage({
        message: `Total units (${totalUsedUnits}) exceed remaining authorized units (${serviceAuthUnitsRemaining}).`,
        severity: 'error'
      })
      setIsAddEventLoading(false)
      return
    }

    let currentDate = new Date(startDate)

    for (let i = 0; i < totalDays; i++) {
      const eventStartDate = new Date(currentDate)
      const eventStartTime = new Date(values.startTime)
      const finalStartDate = mergeDateWithTime(eventStartDate, eventStartTime)
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
        status: 'scheduled',
        staffRatio: values.staffRatio,
        frequency: values.frequency,
        caregiverId: values.caregiver,
        clientId: values.client,
        clientServiceId: values.service,
        assignedHours: assignedHours,
        notes: values.notes || '',
        location: values.location || '',
        payPeriod: props?.payPeriod?.id,
        tenantId: authUser?.tenant?.id,
        serviceAuthId: values.serviceAuth
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
          if (bulkEditChecked) {
            const matchingEvents = calendarStore?.events?.filter((event: any) => {
              const eventStart = event?.start?.split('T')[1]
              const eventEnd = event?.end?.split('T')[1]
              const selectedEventStart = calendarStore?.selectedEvent?.start?.split('T')[1]
              const selectedEventEnd = calendarStore?.selectedEvent?.end?.split('T')[1]
              return (
                eventStart === selectedEventStart &&
                eventEnd === selectedEventEnd &&
                event.caregiver.id === calendarStore.selectedEvent.caregiver.id &&
                event.client.id === calendarStore.selectedEvent.client.id
              )
            })
            console.log('Found Matching Events ---->> ', matchingEvents)
            const bulkUpdatePayload = matchingEvents.map((event: any) => {
              const { start, end, ...updateScheduleDto } = bulkEvents[0]
              // Preserve original event date, update time based on assignedHours
              const originalEndDate = new Date(event.end)
              const updatedEndTime = new Date(
                new Date(event.start).getTime() +
                  (typeof assignedHours === 'number' ? assignedHours * 60 * 60 * 1000 : 0)
              )
              const finalEndDate = new Date(
                originalEndDate.getFullYear(),
                originalEndDate.getMonth(),
                originalEndDate.getDate(),
                updatedEndTime.getHours(),
                updatedEndTime.getMinutes(),
                updatedEndTime.getSeconds()
              )
              return {
                id: event.id,
                updateScheduleDto: {
                  ...updateScheduleDto,
                  end: finalEndDate
                }
              }
            })
            const updatedSchedules = await api.patch('/schedule/bulk', bulkUpdatePayload)
            updatedSchedules.data.forEach((updatedSchedule: any) => {
              handleUpdateEvent(updatedSchedule)
            })
            handleModalClose()
          } else {
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
        setIsAddEventLoading(false)
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

  console.log('Bulk Delete checkbox state ---->> ', bulkDeleteChecked)

  const handleDeleteSchedule = async () => {
    console.log('Inside handle Delete function.......')
    setDeleteButtonLoading(true)
    try {
      if (!bulkDeleteChecked) {
        const delScheduleRes = await api.delete(`/schedule/${calendarStore?.selectedEvent?.id}`)
        console.log('Delete Schedule Response ---->> ', delScheduleRes)
      } else {
        const matchingEvents = calendarStore?.events?.filter((event: any) => {
          const eventStart = event?.start?.split('T')[1]
          const eventEnd = event?.end?.split('T')[1]
          const selectedEventStart = calendarStore?.selectedEvent?.start?.split('T')[1]
          const selectedEventEnd = calendarStore?.selectedEvent?.end?.split('T')[1]
          return (
            eventStart === selectedEventStart &&
            eventEnd === selectedEventEnd &&
            event.caregiver.id === calendarStore.selectedEvent.caregiver.id &&
            event.client.id === calendarStore.selectedEvent.client.id
          )
        })
        console.log('Found Matching Events ---->> ', matchingEvents)
        if (matchingEvents.length === 0) {
          setTimeout(() => {
            setAlertOpen(true)
            setAlertMessage({
              message: 'No corresponding schedules found to delete',
              severity: 'warning'
            })
          }, 5000)
          const delScheduleRes = await api.delete(`/schedule/${calendarStore?.selectedEvent?.id}`)
          console.log('Delete Schedule Response ---->> ', delScheduleRes)
        } else {
          for (const event of matchingEvents) {
            console.log('EVENT IN FOR LOOP --->> ', event)
            try {
              const delScheduleRes = await api.delete(`/schedule/${event.id}`)
              console.log('Delete Schedule Response ---->> ', delScheduleRes)
            } catch (error) {
              console.error('Error Deleting Schedule: ', error)
            }
          }
        }
      }
      dispatch(fetchEvents())
      dispatch(filterEvents())
      setIsDeleteModalShow(false)
      setBulkDeleteChecked(false)
      handleAddEventSidebarToggle()
    } catch (error) {
      console.error('Error deleting scheudle: ', error)
    } finally {
      setDeleteButtonLoading(false)
    }
  }

  const handleDelete = () => setIsDeleteModalShow(true)

  const handleDeleteModalClose = () => setIsDeleteModalShow(false)

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
        handleDelete={handleDelete}
      >
        {alertOpen === true && (
          <Alert onClose={() => setAlertOpen(false)} severity={alertMessage?.severity}>
            {alertMessage?.message}
          </Alert>
        )}
        {isEdited && calendarStore.selectedEvent && (
          <div className='rounded-lg p-4 mb-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <User className='w-4 h-4 text-gray-500' />
                  <span
                    className={`text-sm font-medium ${theme.palette.mode === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
                  >
                    Client:
                  </span>
                  <span className={`text-sm ${theme.palette.mode === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    {calendarStore?.selectedEvent.client
                      ? `${calendarStore.selectedEvent.client.firstName} ${calendarStore.selectedEvent.client.lastName}`
                      : 'Unknown Client'}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <UserCheck className='w-4 h-4 text-gray-500' />
                  <span
                    className={`text-sm font-medium ${theme.palette.mode === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
                  >
                    Caregiver:
                  </span>
                  <span className={`text-sm ${theme.palette.mode === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    {calendarStore?.selectedEvent?.caregiver
                      ? `${calendarStore?.selectedEvent?.caregiver.firstName} ${calendarStore?.selectedEvent?.caregiver.lastName}`
                      : 'Unknown Caregiver'}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Briefcase className='w-4 h-4 text-gray-500' />
                  <span
                    className={`text-sm font-medium ${theme.palette.mode === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
                  >
                    Service:
                  </span>
                  <span className={`text-sm ${theme.palette.mode === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    {calendarStore?.selectedEvent?.clientService?.service?.name ||
                      calendarStore?.selectedEvent?.clientService?.serviceAuthService?.name ||
                      'Unknown Service'}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Users className='w-4 h-4 text-gray-500' />
                  <span
                    className={`text-sm font-medium ${theme.palette.mode === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
                  >
                    Staff Ratio:
                  </span>
                  <span className={`text-sm ${theme.palette.mode === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    {calendarStore?.selectedEvent?.staffRatio || 'NAN'}
                  </span>
                </div>
              </div>
              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <Calendar className='w-4 h-4 text-gray-500' />
                  <span
                    className={`text-sm font-medium ${theme.palette.mode === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
                  >
                    Date:
                  </span>
                  <span className={`text-sm ${theme.palette.mode === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    {new Date(calendarStore?.selectedEvent.start).toLocaleDateString()}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Clock className='w-4 h-4 text-gray-500' />
                  <span
                    className={`text-sm font-medium ${theme.palette.mode === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
                  >
                    Time:
                  </span>
                  <span className={`text-sm ${theme.palette.mode === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    {new Date(calendarStore?.selectedEvent.start).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}{' '}
                    -{' '}
                    {new Date(calendarStore?.selectedEvent.end).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Clock className='w-4 h-4 text-gray-500' />
                  <span
                    className={`text-sm font-medium ${theme.palette.mode === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
                  >
                    Exceeded Units:
                  </span>
                  <span className={`text-sm ${theme.palette.mode === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    {calendarStore?.selectedEvent?.timelog?.exceededUnits || 0}
                  </span>
                </div>
                {calendarStore?.selectedEvent.notes && (
                  <div className='flex items-start space-x-2'>
                    <Note className='w-4 h-4 text-gray-500' />
                    <span
                      className={`text-sm font-medium ${theme.palette.mode === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
                    >
                      Notes:
                    </span>
                    <span className={`text-sm ${theme.palette.mode === 'light' ? 'text-gray-900' : 'text-white'}`}>
                      {calendarStore?.selectedEvent.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center' // This will push content to the right
              }}
            >
              <Button
                className='mt-4'
                variant='text'
                style={{ display: showPreview ? 'block' : 'none' }}
                onClick={() => {
                  setShowPreview(false)
                }}
                endIcon={<ChevronDown />}
                disabled={calendarStore?.selectedEvent?.status !== 'scheduled'}
              >
                Show Edit Modal
              </Button>
            </Box>
          </div>
        )}
        <div
          className='flex items-center justify-center pt-[20px] pb-[20px] w-full px-4'
          style={{
            display:
              !isEdited || !calendarStore?.selectedEvent
                ? 'block'
                : isEdited && calendarStore?.selectedEvent && !showPreview
                  ? 'block'
                  : 'none'
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
            {isEdited && calendarStore?.selectedEvent && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-end' // This will push content to the right
                }}
              >
                <Button
                  variant='text'
                  style={{ marginRight: '10px' }}
                  onClick={() => {
                    setShowPreview(true)
                  }}
                  endIcon={<ChevronUp className='w-4 h-4' />}
                >
                  Hide Edit Modal
                </Button>
              </Box>
            )}
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
              {props?.caregiverList?.length > 0 ? (
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
              label='Service type'
              value={values?.service}
              id='service-schedule'
              onChange={e => setValues({ ...values, service: e.target.value })}
            >
              {serviceType?.length > 0 ? (
                serviceType
                  ?.filter(item => item.dummyService === false)
                  .map((service: any) => (
                    <MenuItem key={service.id} value={service.clientServiceId}>
                      {service.name} {`(${service?.procedureCode} - ${service?.modifierCode || 'N/A'})`}{' '}
                      {service?.dummyService ? '(Demo Service)' : '(S.A Service)'}
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
              label='Service Auth'
              value={values?.serviceAuth}
              id='service-auth'
              onChange={e => setValues({ ...values, serviceAuth: e.target.value })}
            >
              {activeClientServiceAuth?.length > 0 ? (
                activeClientServiceAuth.map((serviceAuth: any) => (
                  <MenuItem key={serviceAuth.id} value={serviceAuth.id}>
                    {serviceAuth.serviceName}{' '}
                    {`(${serviceAuth?.startDate?.split('T')[0]} - ${serviceAuth?.endDate?.split('T')[0]})`}
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
              <Grid size={{ xs: 12, md: 12 }}>
                <CustomTextField
                  select
                  fullWidth
                  className='mbe-3'
                  label='Staff Ratio'
                  value={values?.staffRatio}
                  id='staff-ratio-schedule'
                  onChange={e => setValues({ ...values, staffRatio: e.target.value })}
                >
                  {staffRatio?.length > 0 ? (
                    staffRatio?.map((item: any) => (
                      <MenuItem key={item.id} value={item.name}>
                        {item.name} - {item.description}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No options available</MenuItem>
                  )}
                </CustomTextField>
              </Grid>
              <Grid size={{ xs: 12, md: 12 }}>
                <CustomTextField
                  select
                  fullWidth
                  className='mbe-3'
                  label='Frequency'
                  value={values?.frequency}
                  id='frequency-schedule'
                  onChange={e => setValues({ ...values, frequency: e.target.value })}
                >
                  <MenuItem key={1} value={'daily'}>
                    Daily
                  </MenuItem>
                  <MenuItem key={2} value={'weekly'}>
                    Weekly
                  </MenuItem>
                  <MenuItem key={3} value={'monthly'}>
                    Monthly
                  </MenuItem>
                </CustomTextField>
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
            {calendarStore.selectedEvent && (
              <div>
                <Checkbox checked={bulkEditChecked} onChange={handleBulkEditChange} />
                <FormLabel>Edit all schedules for the matching start time and end time</FormLabel>
              </div>
            )}
            <div className='flex gap-4 justify-end'>
              {calendarStore.selectedEvent && calendarStore.selectedEvent.title.length ? (
                <>
                  <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                    CANCEL
                  </Button>
                  <Button type='submit' variant='contained' disabled={!isEdited || isAddEventLoading}>
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
      <Dialog
        open={isDeleteModalShow}
        onClose={handleDeleteModalClose}
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        maxWidth='md'
      >
        <DialogCloseButton onClick={handleDeleteModalClose} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <form onSubmit={handleSubmit(handleDeleteSchedule)}>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            <div>
              <h2 className='text-xl font-semibold mt-10 mb-6'>Delete Schedule</h2>
            </div>
            <div>
              <Typography className='mb-3 font-semibold'>Are you sure you want to delete this schedule?</Typography>
            </div>
            <div>
              <div>
                <Checkbox checked={bulkDeleteChecked} onChange={handleBulkDeleteChange} />
                <FormLabel>Delete all schedules for the matching start time and end time</FormLabel>
              </div>
            </div>
            <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
              <Button variant='outlined' color='secondary' onClick={handleDeleteModalClose}>
                NO
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={deleteButtonLoading}
                startIcon={deleteButtonLoading ? <CircularProgress color='inherit' size={24} /> : null}
              >
                YES
              </Button>
            </div>
          </div>
        </form>
      </Dialog>
    </>
  )
}

export default AddEventModal

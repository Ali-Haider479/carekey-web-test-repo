'use client'

import { useState, useEffect, forwardRef } from 'react'
import Card from '@mui/material/Card'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Grid2 as Grid,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import ActionButton from '@/@core/components/mui/ActionButton'
import ReactTable from '@/@core/components/mui/ReactTable'
import { calculateHoursWorked, calculateStartAndEndDate, formatToLocalTime } from '@/utils/helperFunctions'
import { dark } from '@mui/material/styles/createPalette'
import CustomAlert from '@/@core/components/mui/Alter'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { FormProvider, useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import ControlledTextArea from '@/@core/components/custom-inputs/ControlledTextArea'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { setHours, setMinutes, setSeconds } from 'date-fns'
import api from '@/utils/api'
import { Computer, PhoneIphone } from '@mui/icons-material'
// Updated interfaces to match your data structure
interface Caregiver {
  id: number
  firstName: string
  lastName: string
  middleName: string
  gender: string
  dateOfBirth: string
  caregiverUMPI: string
  payRate: number
  additionalPayRate: number
  caregiverLevel: string
}

interface Client {
  id: number
  firstName: string
  lastName: string
  middleName: string
  gender: string
  dateOfBirth: string
  pmiNumber: string
  clientCode: string
  clientServices: any
}

interface EditDetailsPayload {
  id: number
  tsApprovalStatus: string
  userId: number
  clockInDate: Date
  clockInTime: Date
  clockOutDate: Date
  clockOutTime: Date
  editedClockInDate: Date
  editedClockInTime: Date
  editedClockOutDate: Date
  editedClockOutTime: Date
  clockOut: Date
  dateOfService: string
  serviceName: string
  updatedBy: string
  updatedAt: string
  notes: any
  reason: any
}

interface Signature {
  id: number
  clientSignStatus: string
  tsApprovalStatus: string
  duration: string
  caregiverSignature: string
  clientSignature: string
  caregiver: Caregiver
  client: Client
  timeLog: any[]
  tenant: any
}

interface SignatureStatusTableProps {
  data: []
  isLoading: boolean
  fetchInitialData: any
  setSelectedRows: any
  selectedRows: any
  payPeriod: any
}

interface PickerProps {
  label?: string
  error?: boolean
  className?: string
  id?: string
  registername?: string
  placeholder?: string
}

const ReceivedTimesheetTable = (
  { data, isLoading, fetchInitialData, setSelectedRows, selectedRows, payPeriod }: SignatureStatusTableProps,
  user: any
) => {
  const methods = useForm<any>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      clockInDate: '',
      clockOutDate: '',
      clockInTime: '',
      clockOutTime: '',
      editedClockInDate: '',
      editedClockInTime: '',
      editedClockOutDate: '',
      editedClockOutTime: ''
    }
  })

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = methods

  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [editedValues, setEditedValues] = useState<{ [key: string]: any }>({})
  // const [currentEditedData, setCurrentEditedData] = useState<any>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()
  // const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [isModalShow, setIsModalShow] = useState(false)
  const [modalData, setModalData] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>()
  const [isEditing, setIsEditing] = useState(false)
  const [weekRange, setWeekRange] = useState<any>({})
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState<any[]>([])
  const [serviceType, setServiceType] = useState<any>()
  const [deleteReason, setDeleteReason] = useState<string>('')
  const [hoursWorkedError, setHoursWorkedError] = useState<boolean>(false)
  const clockInDateString = new Date(watch('clockInDate'))
  const clockOutDateString = new Date(watch('clockOutDate'))
  const editedClockInDateString = watch('editedClockInDate') === '' ? undefined : new Date(watch('editedClockInDate'))
  const editedClockOutDateString =
    watch('editedClockOutDate') === '' ? undefined : new Date(watch('editedClockOutDate'))
  const tsApprovalStatus = watch('tsApprovalStatus')
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const fetchClientServiceType = async () => {
    try {
      if (!modalData?.client?.id) return
      const response = await api.get(`/client/${modalData.client?.id}/services`)
      const serviceAuthServicesRes = await api.get(`/client/${modalData.client?.id}/service-auth/services`)
      setServiceType([...response.data, ...serviceAuthServicesRes.data])
    } catch (error) {
      console.error('Error fetching client service type:', error)
    }
  }

  useEffect(() => {
    // Skip validation on initial render or when not editing
    if (!modalData || !isEditing || tsApprovalStatus === undefined) return

    // Store previous value to check if it actually changed
    const prevStatus = modalData.tsApprovalStatus

    // Only run validation when the status actually changes from the initial value
    if (tsApprovalStatus !== prevStatus) {
      // Check if signature is pending
      if (modalData?.signature?.signatureStatus === 'Pending') {
        setAlertOpen(true)
        setAlertProps({
          message: 'Please approve the signature before changing status.',
          severity: 'error'
        })
        // Reset to previous value
        setValue('tsApprovalStatus', prevStatus)
        return
      }

      // Check if service auth is missing
      if (!modalData?.client?.serviceAuth || modalData?.client?.serviceAuth?.length === 0) {
        setAlertOpen(true)
        setAlertProps({
          message: 'Please complete the service authorization before changing status.',
          severity: 'error'
        })
        // Reset to previous value
        setValue('tsApprovalStatus', prevStatus)
        return
      }

      // Check if service auth is expired
      if (
        modalData?.client?.serviceAuth?.length > 0 &&
        new Date(modalData.client.serviceAuth[0].endDate) < new Date()
      ) {
        setAlertOpen(true)
        setAlertProps({
          message: 'The service authorization has expired. Please update the end date before changing status.',
          severity: 'error'
        })
        // Reset to previous value
        setValue('tsApprovalStatus', prevStatus)
        return
      }
    }
  }, [tsApprovalStatus, modalData, isEditing])

  useEffect(() => {
    if (payPeriod.endDate === null) {
      if (Object.keys(payPeriod).length > 0) {
        const range = calculateStartAndEndDate(payPeriod)
        setWeekRange(range)
      }
    }
    if (modalData !== null) {
      const range = calculateStartAndEndDate(modalData?.payPeriodHistory)
      setWeekRange(range)
    }
  }, [payPeriod, modalData])

  const currentDate = new Date().toISOString().split('T')[0]

  const toggleEditing = () => {
    setIsEditing(!isEditing)
  }

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, user: any) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedUser(user)
  }

  const getAvailableServices = async () => {
    try {
      const activities = await api.get(`/activity`)
      setActivities(activities.data)
    } catch (error) {
      console.error('Error getting activities: ', error)
    }
  }

  useEffect(() => {
    getAvailableServices()
  }, [])

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedUser(null)
  }

  const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
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

  const parseTimeStringToDate = (timeString: string): Date | null => {
    if (!timeString) return null

    let hours: number,
      minutes: number,
      seconds: number = 0
    const date = new Date()

    // Handle "hh:mm aa" format (e.g., "08:40 AM")
    if (timeString.includes(' ')) {
      const [time, period] = timeString.split(' ')
      const [h, m] = time.split(':')
      hours = parseInt(h, 10)
      minutes = parseInt(m, 10)

      if (isNaN(hours) || isNaN(minutes)) return null

      // Convert to 24-hour format
      if (period) {
        if (period.toLowerCase() === 'pm' && hours !== 12) {
          hours += 12
        } else if (period.toLowerCase() === 'am' && hours === 12) {
          hours = 0
        }
      }
    } else {
      // Handle "HH:mm:ss" format (e.g., "08:40:00")
      const [h, m, s = '00'] = timeString.split(':')
      hours = parseInt(h, 10)
      minutes = parseInt(m, 10)
      seconds = parseInt(s, 10)

      if (isNaN(hours) || isNaN(minutes)) return null
    }

    date.setHours(hours)
    date.setMinutes(minutes)
    date.setSeconds(seconds)
    date.setMilliseconds(0)

    return isNaN(date.getTime()) ? null : date
  }

  const handleOpenModal = (user: any, mode: 'edit' | 'view') => {
    setModalData(user)
    setIsModalShow(true)
    setIsEditing(mode === 'edit') // Set isEditing based on mode

    // Reset any deleting state
    setDeletingId(null)
    setIsDeleting(false)
    setRowsToDelete([])

    // Split clockIn into date and time
    let clockInDate = ''
    let clockInTime = ''
    if (user.clockIn) {
      const [datePart, timePart] = user.clockIn.split('T')
      clockInDate = datePart
      clockInTime = timePart
    }

    // Split clockOut into date and time
    let clockOutDate = ''
    let clockOutTime = ''
    if (user.clockOut) {
      const [datePart, timePart] = user.clockOut.split('T')
      clockOutDate = datePart
      clockOutTime = timePart
    }

    const localClockInTime = new Date(user.clockIn).toISOString()
    const localClockOutTime = new Date(user.clockOut).toISOString()

    // Set form values
    setValue('id', user.id)
    setValue('tsApprovalStatus', user.tsApprovalStatus || 'Pending')
    setValue('clockInDate', localClockInTime.split('T')[0])
    setValue('clockInTime', localClockInTime.split('T')[1])
    setValue('clockOutDate', localClockOutTime.split('T')[0])
    setValue('clockOutTime', localClockOutTime.split('T')[1])
    setValue('hoursWorked', calculateHoursWorked(user.clockIn, user.clockOut) || user.hrsWorked || '')
    setValue('dateOfService', user.dateOfService ? new Date(user.dateOfService).toISOString().split('T')[0] : '')
    setValue('serviceName', user.serviceName || '')
    setValue('updatedBy', user.updatedBy?.userName || 'N/A')
    setValue('updatedAt', user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : '')
    setValue('notes', user.notes || '')
    setValue('reason', user.reason || '')

    // Reset anchorEl and selectedUser
    setAnchorEl(null)
    setSelectedUser(null)
  }

  const handleViewDetails = (user: any, mode: 'edit' | 'view') => {
    setModalData(user)
    setIsModalShow(true)
    mode === 'edit' && setIsEditing(true)
    setDeletingId(null)
    setIsDeleting(false)
    setRowsToDelete([])

    console.log('User details in handleViewDetails:', user)

    // Helper function to convert UTC ISO string to local date and time parts
    const convertUTCToLocal = (utcString: string | null | undefined) => {
      if (!utcString || isNaN(new Date(utcString).getTime())) {
        return { date: '', time: '' }
      }
      const utcDate = new Date(utcString)
      const timezoneOffset = utcDate.getTimezoneOffset() * 60 * 1000
      const localDate = new Date(utcDate.getTime() - timezoneOffset).toISOString()
      const datePart = localDate.split('T')[0]
      const timePart = localDate.split('T')[1]
      return { date: datePart, time: timePart }
    }

    const { date: clockInDate, time: clockInTime } = convertUTCToLocal(user.clockIn)
    const { date: clockOutDate, time: clockOutTime } = convertUTCToLocal(user.clockOut)
    const { date: editedClockInDate, time: editedClockInTime } = convertUTCToLocal(user?.editedClockIn || null)
    const { date: editedClockOutDate, time: editedClockOutTime } = convertUTCToLocal(user?.editedClockOut || null)

    // Calculate hours worked using UTC times to avoid timezone issues in calculation
    const hoursWorked =
      user.editedClockIn && user.editedClockOut
        ? calculateHoursWorked(user.editedClockIn, user.editedClockOut)
        : user.clockIn && user.clockOut
          ? calculateHoursWorked(user.clockIn, user.clockOut)
          : user.hrsWorked || ''

    // Set form values
    setValue('id', user.id)
    setValue('tsApprovalStatus', user.tsApprovalStatus || 'Pending')
    setValue('clockInDate', clockInDate)
    setValue('clockInTime', clockInTime)
    setValue('clockOutDate', clockOutDate)
    setValue('clockOutTime', clockOutTime)
    setValue('editedClockInDate', editedClockInDate ? editedClockInDate : clockInDate)
    setValue('editedClockInTime', editedClockInTime)
    setValue('editedClockOutDate', editedClockOutDate ? editedClockOutDate : clockOutDate)
    setValue('editedClockOutTime', editedClockOutTime)
    setValue('hoursWorked', hoursWorked)
    setValue('dateOfService', user.dateOfService ? new Date(user.dateOfService).toISOString().split('T')[0] : '')
    setValue('serviceName', user?.clientService?.id || '')
    setValue('updatedBy', user.updatedBy?.userName || 'N/A')
    setValue('updatedAt', user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : '')
    setValue('notes', user?.notes || '')
    setValue('reason', user?.reason || '')

    handleCloseMenu()
    setAnchorEl(null)
    setSelectedUser(null)
  }

  const handleModalClose = () => {
    setHoursWorkedError(false)
    setIsModalShow(false)
    setIsEditing(false)
    setServiceType(null)
    setModalData(null)
    reset()
    handleCloseMenu()
    setAnchorEl(null)
    setSelectedUser(null)
  }

  useEffect(() => {
    if (modalData?.client?.id) {
      fetchClientServiceType()
    }
  }, [modalData?.client?.id])

  const onSubmit = async (formData: EditDetailsPayload) => {
    try {
      const userId = authUser?.id

      const formatTimeToISO = (dateStr: any, timeStr: any): string => {
        if (!dateStr || !timeStr) return ''

        // Handle case where dateStr is a Date object (e.g., from a date picker)
        let formattedDateStr: string
        if (dateStr instanceof Date) {
          formattedDateStr = dateStr.toISOString().split('T')[0] // Extracts "YYYY-MM-DD"
        } else {
          formattedDateStr = dateStr // Assume it's already in "YYYY-MM-DD" format
        }

        // Parse the time string (e.g., "08:40 AM" or "08:40:00")
        let hours: number
        let minutes: number
        let seconds: number = 0
        if (timeStr.includes(' ')) {
          const [time, period] = timeStr.split(' ')
          const [h, m] = time.split(':')
          hours = parseInt(h, 10)
          minutes = parseInt(m, 10)
          if (period.toLowerCase() === 'pm' && hours !== 12) {
            hours += 12
          } else if (period.toLowerCase() === 'am' && hours === 12) {
            hours = 0
          }
        } else {
          // Handle "HH:mm:ss" format (e.g., "08:40:00") as a fallback
          const [h, m, s = '00'] = timeStr.split(':')
          hours = parseInt(h, 10)
          minutes = parseInt(m, 10)
          seconds = parseInt(s, 10)
        }

        // Create a new Date object with the combined date and time
        const combinedDate = new Date(
          `${formattedDateStr}T${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.000Z`
        )

        const localTime = new Date(combinedDate)
        const timezoneOffset = localTime.getTimezoneOffset() * 60 * 1000 // Offset in milliseconds
        const convertedUTCTime = new Date(localTime.getTime() + timezoneOffset)

        // Return the ISO string
        return convertedUTCTime.toISOString()
      }

      const clockIn = formatTimeToISO(formData.editedClockInDate, formData.editedClockInTime) || modalData.editedClockIn
      const clockOut =
        formatTimeToISO(formData.editedClockOutDate, formData.editedClockOutTime) || modalData.editedClockOut

      const hoursWorked = Number(calculateHoursWorked(clockIn, clockOut))

      console.log('Hours worked calculation ---->> ', hoursWorked)

      if (hoursWorked > 24) {
        setHoursWorkedError(true)
        return
      }

      const payload: any = {
        id: formData.id
      }

      let hasChanges = false

      // Check if tsApprovalStatus changed
      const tsStatusChanged = formData.tsApprovalStatus !== modalData.tsApprovalStatus
      if (tsStatusChanged) {
        payload.tsApprovalStatus = formData.tsApprovalStatus
        hasChanges = true
      }

      const originalClockIn = modalData?.editedClockIn || ''
      const originalClockOut = modalData?.editedClockOut || ''

      // Split original clockIn into date and time for comparison
      const [originalClockInDate = '', originalClockInTime = ''] = originalClockIn.split('T')
      const [originalClockOutDate = '', originalClockOutTime = ''] = originalClockOut.split('T')

      // Determine if clockIn or clockOut fields have changed
      const clockInDateChanged = formData.editedClockInDate !== originalClockInDate
      const clockInTimeChanged = formData.editedClockInTime !== originalClockInTime
      const clockOutDateChanged = formData.editedClockOutDate !== originalClockOutDate
      const clockOutTimeChanged = formData.editedClockOutTime !== originalClockOutTime

      if (clockInDateChanged || clockInTimeChanged) {
        payload.editedClockIn = formatTimeToISO(formData.editedClockInDate, formData.editedClockInTime)
        hasChanges = true
      }

      if (clockOutDateChanged || clockOutTimeChanged) {
        payload.editedClockOut = formatTimeToISO(formData.editedClockOutDate, formData.editedClockOutTime)
        hasChanges = true
      }
      // Check if notes or reason changed
      if (formData.notes !== modalData.notes) {
        payload.notes = formData.notes
        hasChanges = true
      }

      if (formData.reason !== modalData.reason) {
        payload.reason = formData.reason
        hasChanges = true
      }

      // Add service name if changed
      if (formData.serviceName !== modalData.serviceName) {
        payload.serviceName = formData.serviceName
        hasChanges = true
      }

      // SET THIS DATE OF SERVICE TO TRUE MANUALLY
      payload.dateOfService = formData.editedClockInDate ? formData.editedClockInDate : formData.clockInDate
      // Always include userId for tracking who made the change
      payload.userId = userId

      // If nothing changed, show a message and return
      if (!hasChanges) {
        setAlertOpen(true)
        setAlertProps({
          message: 'No changes detected to save.',
          severity: 'info'
        })
        return
      }
      await api.patch(`/time-log/update-timelog`, payload)

      if (tsStatusChanged && formData.tsApprovalStatus === 'Approved') {
        const hrs = calculateHoursWorked(payload.clockIn || modalData.clockIn, payload.clockOut || modalData.clockOut)
        const billedAmount = parseFloat(hrs) * modalData.client.serviceAuth[0].serviceRate

        const response = api.post(`/time-log/billing`, {
          timeLogId: formData.id,
          claimDate: null,
          billedAmount: Number(billedAmount.toFixed(2)),
          receivedAmount: 0,
          claimStatus: 'Pending',
          billedStatus: 'Pending'
        })
      } else if (
        tsStatusChanged &&
        (formData.tsApprovalStatus === 'Pending' || formData.tsApprovalStatus === 'Rejected')
      ) {
        await api.delete(`/time-log/remove-billing/${modalData?.billing?.id}`)
      }

      await fetchInitialData()
      setIsModalShow(false)
      setHoursWorkedError(false)
      setModalData(null)
      setIsEditing(false)
      reset()
    } catch (error) {
      console.error('Error saving modal data', error)
      setAlertOpen(true)
      setAlertProps({
        message: 'Failed to save changes. Please try again.',
        severity: 'error'
      })
    }
  }

  const handleSave = async (currentEditedData: any) => {
    const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
    const userId = authUser?.id
    const findUser = (data: any[], targetId: string | number): { user: any; isDummyRow: boolean } => {
      let currentUser = data.find((item: any) => item.id === targetId)
      if (currentUser) {
        return { user: currentUser, isDummyRow: !!currentUser.subRows }
      }

      for (const item of data) {
        if (item.subRows && Array.isArray(item.subRows)) {
          currentUser = item.subRows.find((subItem: any) => subItem.id === targetId)
          if (currentUser) {
            return { user: currentUser, isDummyRow: false }
          }
        }
      }
      return { user: null, isDummyRow: false }
    }

    const { user: currentUser, isDummyRow } = findUser(data, currentEditedData.id)

    if (!currentUser) {
      setAlertOpen(true)
      setAlertProps({
        message: 'User not found in the data.',
        severity: 'error'
      })
      handleCancelEdit()
      return
    }

    if (currentUser?.signature?.signatureStatus === 'Pending' || currentUser?.client?.serviceAuth?.length === 0) {
      setAlertOpen(true)
      setAlertProps({
        message:
          currentUser?.signature?.signatureStatus === 'Pending'
            ? 'Please approve the signature before editing.'
            : 'Please complete the service authorization before editing.',
        severity: 'error'
      })
      handleCancelEdit()
      return
    }

    if (
      currentUser?.client?.serviceAuth?.length > 0 &&
      new Date(currentUser.client.serviceAuth[0].endDate) < new Date()
    ) {
      setAlertOpen(true)
      setAlertProps({
        message: 'The service authorization has expired. Please update the end date before editing.',
        severity: 'error'
      })
      handleCancelEdit()
      return
    }

    if (currentUser?.billing && Object.keys(currentUser.billing).length > 0) {
      if (currentUser?.billing?.claimStatus?.includes('Approved')) {
        setAlertOpen(true)
        if (currentUser?.subRows?.length > 0 && currentUser?.billing?.dummyRow) {
          setAlertProps({
            message: 'Please update timelogs manually.',
            severity: 'error'
          })
          handleCancelEdit()
        } else {
          setAlertProps({
            message: 'Cannot update timelog because billing has already been approved.',
            severity: 'error'
          })
        }
        return
      }
    }

    try {
      const basePayload = {
        tsApprovalStatus: currentEditedData.tsApprovalStatus,
        userId
      }

      let updatePromises: Promise<any>[] = []
      let rowsToUpdate: any[] = []

      if (isDummyRow) {
        const selectedSubRowIds = selectedRows
          .filter(
            (row: any) =>
              row.id !== currentEditedData.id && currentUser.subRows.some((subRow: any) => subRow.id === row.id)
          )
          .map((row: any) => row.id)

        if (selectedSubRowIds.length === 0) {
          setAlertOpen(true)
          setAlertProps({
            message: 'Please select at least one sub-row to update.',
            severity: 'warning'
          })
          return
        }

        rowsToUpdate = currentUser.subRows.filter((subRow: any) => selectedSubRowIds.includes(subRow.id))

        const subRowUpdates = rowsToUpdate.map((subRow: any) => ({
          id: subRow.id,
          ...basePayload
        }))

        updatePromises = subRowUpdates.map((payload: any) => api.patch(`/time-log/update-ts-approval`, payload))
      } else {
        rowsToUpdate = [currentUser]
        updatePromises.push(
          api.patch(`/time-log/update-ts-approval`, {
            id: currentEditedData.id,
            ...basePayload
          })
        )
      }

      await Promise.all(updatePromises)

      // Handle billing creation or removal based on tsApprovalStatus
      if (currentEditedData.tsApprovalStatus === 'Approved') {
        const billingPromises = []

        for (const row of rowsToUpdate) {
          const hrs = calculateHoursWorked(row.clockIn, row.clockOut)
          const billedAmount = parseFloat(hrs) * row.client.serviceAuth[0].serviceRate

          billingPromises.push(
            api.post(`/time-log/billing`, {
              timeLogId: row.id,
              claimDate: null,
              billedAmount: Number(billedAmount.toFixed(2)),
              receivedAmount: 0,
              claimStatus: 'Pending',
              billedStatus: 'Pending'
            })
          )
        }

        await Promise.all(billingPromises)
      } else {
        // } else if (currentUser?.billing?.id) {
        const billingDeletePromises = []

        // Delete billing for all updated rows that have billing
        for (const row of rowsToUpdate) {
          if (row?.billing?.id) {
            billingDeletePromises.push(api.delete(`/time-log/remove-billing/${row.billing.id}`))
          }
        }

        if (billingDeletePromises.length > 0) {
          await Promise.all(billingDeletePromises)
        }
      }

      await fetchInitialData()
      setEditingId(null)
      setSelectedUser(null)
      setEditedValues({})
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving data', error)
      setAlertOpen(true)
      setAlertProps({
        message: 'Failed to save changes. Please try again.',
        severity: 'error'
      })
    }
  }

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setEditingId(user.id)
    setIsEditing(true)
    // setCurrentEditedData(user)
    // Reset any deleting state
    setDeletingId(null)
    setIsDeleting(false)
    setRowsToDelete([])
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setIsEditing(false)
    setSelectedUser(null)
    setSelectedRows([])
    setEditedValues({})
    setRowSelection({}) // Reset row selection)
  }

  const onDelete = async (rows: any[], reason: string) => {
    try {
      const tenantId = authUser?.tenant?.id
      if (rows?.[0].subRows?.length) {
        const deleteLogsIds = rows[0].subRows.map((el: any) => el.id)
        // Send the reason with the API call
        await api.patch(`/time-log/delete-log/${tenantId}`, {
          ids: deleteLogsIds,
          reason
        })
      } else {
        // Send the reason with the API call
        await api.patch(`/time-log/delete-log/${tenantId}`, {
          ids: [rows[0].id],
          reason
        })
      }
      await fetchInitialData()
    } catch (error) {
      console.error('Error in onDelete:', error)
      throw error
    }
  }

  const handleDelete = (user: any) => {
    setSelectedUser(user)
    setDeletingId(user.id)
    setIsDeleting(true)
    // Pre-select the current row
    setRowsToDelete([user])
    // Reset any editing state
    setEditingId(null)
    setIsEditing(false)
    setSelectedRows([])
    setDeleteReason('')
  }

  const handleConfirmDelete = async (reason: string) => {
    try {
      // Store the reason in state
      setDeleteReason(reason)
      // Call the onDelete function with the rows to delete and the reason
      await onDelete(rowsToDelete, reason)
      // Refresh the table data
      await fetchInitialData()
      // Reset delete state
      setDeletingId(null)
      setIsDeleting(false)
      setSelectedUser(null)
      setRowsToDelete([])
      setDeleteReason('') // Reset delete reason
      setRowSelection({}) // Reset row selection
      setAlertOpen(true)
      setAlertProps({
        message: 'Rows deleted successfully.',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error deleting rows:', error)
      setAlertOpen(true)
      setAlertProps({
        message: 'Failed to delete rows. Please try again.',
        severity: 'error'
      })
    }
  }

  // Handler for canceling delete
  const handleCancelDelete = () => {
    setDeletingId(null)
    setIsDeleting(false)
    setSelectedUser(null)
    setRowsToDelete([])
    setRowSelection({}) // Reset row selection
    setDeleteReason('')
  }

  const columns = [
    {
      id: 'clientName',
      label: 'CLIENT',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Typography className={`${dark ? 'text-[#8082FF]' : 'text-[#4B0082]'}`} color='primary'>
          {`${user?.client?.firstName} ${user?.client?.lastName}`}
        </Typography>
      )
    },
    {
      id: 'caregiverName',
      label: 'CAREGIVER',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Typography
          color='primary'
          className='text-[#71DD37]'
        >{`${user?.caregiver?.firstName} ${user?.caregiver?.lastName}`}</Typography>
      )
    },
    {
      id: 'serviceName',
      label: 'SERVICE',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        console.log(user)
        return (
          <Tooltip
            title={user?.clientService?.service?.name || user?.clientService?.serviceAuthService?.name || ''}
            placement='top'
          >
            <>
              <Typography color='primary' sx={{ width: '200px', wordWrap: 'break-word' }}>
                {user?.clientService?.service?.name?.slice(0, 16) ||
                  user?.clientService?.serviceAuthService?.name?.slice(0, 16) ||
                  '---'}
                {user?.clientService?.service?.name?.length > 16 ? '...' : ''}
                {user?.clientService?.serviceAuthService?.name?.length > 16 ? '...' : ''}
              </Typography>
              <Typography>
                {`PRO: ${user?.clientService?.service ? (user?.clientService?.service?.procedureCode ?? 'N/A') : (user?.clientService?.serviceAuthService?.procedureCode ?? 'N/A')} MOD: ${user?.clientService?.service && user?.clientService?.service?.modifierCode ? user?.clientService?.service?.modifierCode : user?.clientService?.serviceAuthService?.modifierCode ? user?.clientService?.serviceAuthService?.modifierCode : 'N/A'}`}
              </Typography>
            </>
          </Tooltip>
        )
      }
    },
    {
      id: 'timeDuration',
      label: 'HRS WORKED',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        if (!user?.clockIn || !user?.clockOut) {
          return <Typography className='font-normal text-base'>{user?.hrsWorked} Hrs</Typography>
        } else {
          const hoursWorked =
            user.editedClockIn && user.editedClockOut
              ? calculateHoursWorked(user.editedClockIn, user.editedClockOut)
              : calculateHoursWorked(user?.clockIn, user?.clockOut)
          return <Typography className='font-normal text-base '>{hoursWorked} Hrs</Typography>
        }
      }
    },
    {
      id: 'dateOfService',
      label: 'DATE OF SERVICE',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        const dateOfService = user?.dateOfService

        if (dateOfService) {
          // Try to parse it as a timestamp
          const parsedDate = new Date(dateOfService)

          // Check if the parsed date is valid (not "Invalid Date")
          if (!isNaN(parsedDate.getTime())) {
            return (
              <>
                <Typography className='font-normal text-base '>
                  {new Date(user?.dateOfService).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                  })}
                </Typography>
                <Typography className='font-normal text-base '>
                  {user?.editedClockIn?.length > 0
                    ? `In: ${new Date(user?.editedClockIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}`
                    : user?.clockIn?.length > 0
                      ? `In: ${new Date(user?.clockIn).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}`
                      : 'In: ---'}{' '}
                  {user?.editedClockOut?.length > 0
                    ? `Out: ${new Date(user?.editedClockOut).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}`
                    : user?.clockOut?.length > 0
                      ? `Out: ${new Date(user?.clockOut).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}`
                      : 'Out: ---'}
                </Typography>
              </>
            )
          }

          // If it's not a valid timestamp, return the raw string as is
          return <Typography className='font-normal text-base '>{dateOfService}</Typography>
        }

        // If dateOfService is null/undefined, return N/A
        return <Typography className='font-normal text-base '>N/A</Typography>
      }
    },
    {
      id: 'tsApprovalStatus',
      label: 'STATUS',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: (user: any) => (
        <Chip
          label={user?.tsApprovalStatus?.toUpperCase() || 'PENDING'}
          sx={{
            backgroundColor: user?.tsApprovalStatus === 'Approved' ? '#72E1281F' : '#FDB5281F',
            borderRadius: '50px',
            color: user?.tsApprovalStatus === 'Approved' ? '#71DD37' : '#FFAB00',
            '& .MuiChip-label': {
              padding: '0 10px'
            }
          }}
        />
      )
    },
    {
      id: 'manualStatus',
      label: 'MANUAL',
      minWidth: 170,
      align: 'center' as const,
      editable: true,
      sortable: true,
      render: (user: any) => {
        console.log('LOGGED VIA --->> ', user.loggedVia)
        return (
          <Tooltip title={user?.manualEntry === 'Mixed' ? 'Mixed' : user?.manualEntry === true ? 'Yes' : 'No'}>
            <Box
              className='font-normal text-base my-3'
              sx={theme => ({
                color:
                  user?.manualEntry === true
                    ? theme.palette.mode === 'light'
                      ? theme.palette.success.main
                      : theme.palette.success.dark
                    : theme.palette.mode === 'light'
                      ? theme.palette.warning.main
                      : theme.palette.warning.dark
              })}
            >
              {user?.manualEntry === 'Mixed' ? (
                <>
                  {user.loggedVia === 'mobile' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PhoneIphone />
                    </Box>
                  ) : user.loggedVia === 'desktop' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Computer />
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                      <Computer /> | <PhoneIphone />
                    </Box>
                  )}
                </>
              ) : user?.manualEntry === true && user.loggedVia === 'desktop' ? (
                <Computer />
              ) : (
                <PhoneIphone />
              )}
            </Box>
          </Tooltip>
        )
      }
    },
    {
      id: 'updatedBy',
      label: 'UPDATED BY',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        if (!user?.updatedBy || !user?.updatedAt) {
          return <Typography className='font-normal text-base'>---</Typography>
        } else {
          return (
            <>
              <Typography className='font-normal text-base'>{user?.updatedBy?.userName || 'N/A'}</Typography>
              <Typography className='font-normal text-base'>
                {new Date(user?.updatedAt).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric'
                })}
              </Typography>
            </>
          )
        }
      }
    },
    {
      id: 'actions',
      label: 'ACTIONS',
      minWidth: 170,
      align: 'center' as const,
      editable: false,
      render: (user: any) => (
        <ActionButton
          handleEdit={handleEdit}
          handleDelete={handleDelete} // Pass delete handler
          handleConfirmDelete={handleConfirmDelete} // Pass confirm delete handler
          handleCancelDelete={handleCancelDelete} // Pass cancel delete handler
          handleActionClick={handleActionClick}
          handleCloseMenu={handleCloseMenu}
          handleCancelEdit={handleCancelEdit}
          isEditing={isEditing}
          isDeleting={isDeleting} // Pass deleting state
          user={user}
          selectedUser={selectedUser}
          anchorEl={anchorEl}
          handleViewDetails={handleViewDetails}
          // disabled={!!user.subRows && user.subRows.length > 0} // Disable for dummy rows
        />
      )
    }
  ]

  if (isLoading) {
    return (
      <Card>
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      </Card>
    )
  }

  const handleEditChange = (updatedRow: any) => {
    // setCurrentEditedData(updatedRow)
    handleSave(updatedRow)
  }

  const handleSelect = (selectedRowsData: any) => {
    setSelectedRows(selectedRowsData)
  }

  return (
    <>
      <FormProvider {...methods}>
        {/* <CardHeader title='Received Timesheet' className='pb-4' /> */}
        <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />

        <div style={{ overflowX: 'auto', padding: '0px' }}>
          <Card>
            <ReactTable
              columns={columns}
              data={data}
              keyExtractor={user => user.id.toString()}
              enableRowSelect
              stickyHeader
              maxHeight={600}
              containerStyle={{ borderRadius: 2 }}
              editingId={editingId}
              // onSave={handleSave}
              onEditChange={handleEditChange}
              onSelectionChange={handleSelect}
              pageSize={25}
              enablePagination
            />
          </Card>
        </div>

        <Dialog
          open={isModalShow}
          onClose={handleModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { p: 2, minWidth: 800, overflowX: 'hidden' } }}
        >
          <DialogCloseButton
            onClick={() => handleModalClose()}
            disableRipple
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex flex-row justify-between items-center mb-2 mt-3 px-6'>
            <Typography className='text-xl font-semibold'>Timesheet Details</Typography>
            <Button variant='contained' onClick={toggleEditing}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
          <div className='flex items-center justify-center pt-[40px] pb-[5px] w-full px-5'>
            <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    label='Client Name'
                    name='clientName'
                    defaultValue={modalData ? `${modalData.client?.firstName} ${modalData.client?.lastName}` : ''}
                    type='text'
                    control={control}
                    disabled
                    placeHolder={'Client Name'}
                    isRequired={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomTextField
                    label='Caregiver Name'
                    name='caregiverName'
                    defaultValue={modalData ? `${modalData.caregiver?.firstName} ${modalData.caregiver?.lastName}` : ''}
                    type='text'
                    control={control}
                    disabled
                    placeHolder={'Caregiver Name'}
                    isRequired={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomDropDown
                    name={'serviceName'}
                    control={control}
                    label={'Service Name'}
                    isRequired={false}
                    disabled={!isEditing}
                    defaultValue={modalData?.clientService?.id}
                    optionList={serviceType?.map((item: any) => ({
                      key: item.id,
                      value: item.clientServiceId,
                      optionString: `${item.name} ${item?.dummyService ? '(Demo Service)' : '(S.A Service)'}`
                    }))}
                    // disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ControlledDatePicker
                    name={'clockInDate'}
                    error={errors.dateOfService}
                    control={control}
                    label={'Date of Service'}
                    defaultValue={''}
                    isRequired={true}
                    disabled={true}
                    rules={{
                      required: 'Date of service is required'
                    }}
                  />
                </Grid>
                <Typography>Original Worked Hours: </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <ControlledDatePicker
                      name={'clockInDate'}
                      error={errors.clockInDate}
                      control={control}
                      label={'Clock In Date'}
                      defaultValue={''}
                      isRequired={true}
                      disabled={true}
                      selected={clockInDateString}
                      endDate={clockOutDateString || undefined}
                      startDate={clockInDateString || undefined}
                      minDate={new Date(weekRange.startDate)}
                      maxDate={weekRange.endDate > currentDate ? new Date() : new Date(weekRange.endDate)}
                      rules={{
                        required: 'Clock In Date is required'
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <AppReactDatepicker
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      required
                      dateFormat='hh:mm aa'
                      id='clock-in-time-picker'
                      disabled={true}
                      selected={parseTimeStringToDate(watch('clockInTime'))}
                      onChange={(date: Date | null) => {
                        if (date) {
                          const timeString = date.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          })
                          setValue('clockInTime', timeString)
                          setValue('clockOutTime', null) // Set clockOutDate to clockInDate
                        }
                      }}
                      customInput={
                        <PickersComponent
                          label='Clock In Time'
                          registername='clockInTime'
                          error={!!errors.clockInTime}
                          id='clock-in-time'
                        />
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <ControlledDatePicker
                      name={'clockOutDate'}
                      error={errors.clockOutDate}
                      control={control}
                      label={'Clock Out Date'}
                      defaultValue={''}
                      isRequired={true}
                      disabled={true}
                      selected={clockOutDateString}
                      minDate={clockInDateString || undefined}
                      maxDate={weekRange.endDate > currentDate ? new Date() : new Date(weekRange.endDate)}
                      rules={{
                        required: 'Clock Out Date is required',
                        validate: (value: any) => {
                          if (!clockInDateString || !value) return true // Skip if either is empty
                          return new Date(value) >= clockInDateString
                            ? true
                            : 'Clock Out Date must be on or after Clock In Date'
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <AppReactDatepicker
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      dateFormat='hh:mm aa'
                      required
                      id='edited-clock-out-time-picker'
                      disabled
                      selected={parseTimeStringToDate(watch('clockOutTime'))}
                      minTime={(() => {
                        if (!clockInDateString || !clockOutDateString) return new Date()
                        const clockInTime: any = parseTimeStringToDate(watch('editedClockInTime'))
                        // Check if dates are the same
                        const isSameDate = clockInDateString.toDateString() === clockOutDateString.toDateString()

                        if (isSameDate) {
                          const minutes = clockInTime?.getMinutes()
                          const roundedMinutes = Math.ceil(minutes / 15) * 15
                          const nextInterval = new Date(
                            clockInDateString.getFullYear(),
                            clockInDateString.getMonth(),
                            clockInDateString.getDate(),
                            clockInTime?.getHours(),
                            clockInTime?.getMinutes(),
                            clockInTime?.getSeconds(),
                            clockInTime?.getMilliseconds()
                          )

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
                      maxTime={(() => {
                        if (!clockInDateString || !clockOutDateString) return new Date()
                        const isCurrentDate = clockOutDateString.toDateString() === new Date().toDateString()

                        if (isCurrentDate) {
                          const now = new Date()
                          const minutes = now.getMinutes()
                          const roundedMinutes = Math.floor(minutes / 15) * 15

                          const previousInterval = new Date(
                            clockOutDateString.getFullYear(),
                            clockOutDateString.getMonth(),
                            clockOutDateString.getDate(),
                            now.getHours(),
                            roundedMinutes,
                            0, // Set seconds to 0
                            0 // Set milliseconds to 0
                          )

                          return previousInterval
                        } else {
                          // If previous date, set to end of day
                          return setSeconds(setMinutes(setHours(new Date(clockOutDateString), 23), 59), 59)
                        }
                      })()}
                      onChange={(date: Date | null) => {
                        if (date) {
                          const timeString = date.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          })
                          setValue('editedClockOutTime', timeString)
                        }
                      }}
                      customInput={
                        <PickersComponent
                          label='Clock Out Time'
                          registername='clockOutTime'
                          error={!!errors.clockOutTime}
                          id='clock-out-time'
                        />
                      }
                    />
                  </Grid>
                  <Typography>Edited worked Hours: </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <ControlledDatePicker
                        name={'editedClockInDate'}
                        error={errors.editedClockInDate}
                        control={control}
                        label={'Clock In Date'}
                        defaultValue={''}
                        isRequired={false}
                        disabled={!isEditing}
                        selected={clockInDateString}
                        endDate={clockInDateString || undefined}
                        startDate={clockInDateString || undefined}
                        // minDate={new Date(weekRange.startDate)}
                        // maxDate={weekRange.endDate > currentDate ? new Date() : new Date(weekRange.endDate)}
                        maxDate={new Date()}
                        rules={{
                          required: false
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <AppReactDatepicker
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        required={false}
                        dateFormat='hh:mm aa'
                        id='clock-in-time-picker'
                        disabled={!isEditing}
                        selected={parseTimeStringToDate(watch('editedClockInTime'))}
                        onChange={(date: Date | null) => {
                          if (date) {
                            const timeString = date.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false
                            })
                            setValue('editedClockInTime', timeString)
                            setValue('editedClockOutTime', null) // Set clockOutDate to clockInDate
                          }
                        }}
                        customInput={
                          <PickersComponent
                            label='Clock In Time'
                            registername='editedClockInTime'
                            error={!!errors.editedClockInTime}
                            id='edited-clock-in-time'
                          />
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <ControlledDatePicker
                        name={'editedClockOutDate'}
                        error={errors.editedClockOutDate}
                        control={control}
                        label={'Clock Out Date'}
                        defaultValue={''}
                        isRequired={false}
                        disabled={!isEditing}
                        selected={editedClockOutDateString}
                        minDate={editedClockInDateString || undefined}
                        // maxDate={weekRange.endDate > currentDate ? new Date() : new Date(weekRange.endDate)}
                        maxDate={new Date()}
                        rules={{
                          required: false,
                          validate: (value: any) => {
                            if (!editedClockInDateString || !value) return true // Skip if either is empty
                            return new Date(value) >= editedClockInDateString
                              ? true
                              : 'Clock Out Date must be on or after Clock In Date'
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <AppReactDatepicker
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        dateFormat='hh:mm aa'
                        required={false}
                        id='edited-clock-out-time-picker'
                        disabled={!isEditing}
                        selected={parseTimeStringToDate(watch('editedClockOutTime'))}
                        minTime={(() => {
                          // Use edited clock-in and clock-out dates
                          if (!editedClockInDateString || !editedClockOutDateString) {
                            // Fallback to start of day if dates are not set
                            return setSeconds(setMinutes(setHours(new Date(), 0), 0), 0)
                          }
                          const clockInTime: any = parseTimeStringToDate(watch('editedClockInTime'))
                          // Check if edited clock-in and clock-out dates are the same
                          const isSameDate =
                            editedClockInDateString.toDateString() === editedClockOutDateString.toDateString()

                          if (isSameDate && clockInTime) {
                            const nextInterval = new Date(
                              editedClockInDateString.getFullYear(),
                              editedClockInDateString.getMonth(),
                              editedClockInDateString.getDate(),
                              clockInTime.getHours(),
                              clockInTime.getMinutes() + 15, // Add exactly 15 minutes
                              0,
                              0
                            )
                            return nextInterval
                          } else {
                            // If different date, start from beginning of day
                            return setSeconds(setMinutes(setHours(new Date(editedClockOutDateString), 0), 0), 0)
                          }
                        })()}
                        maxTime={(() => {
                          if (!editedClockOutDateString) {
                            // Fallback to end of day if date is not set
                            return setSeconds(setMinutes(setHours(new Date(), 23), 59), 59)
                          }
                          const isCurrentDate = editedClockOutDateString.toDateString() === new Date().toDateString()

                          if (isCurrentDate) {
                            const now = new Date()
                            const minutes = now.getMinutes()
                            const roundedMinutes = Math.floor(minutes / 15) * 15
                            const previousInterval = new Date(
                              editedClockOutDateString.getFullYear(),
                              editedClockOutDateString.getMonth(),
                              editedClockOutDateString.getDate(),
                              now.getHours(),
                              roundedMinutes,
                              0,
                              0
                            )
                            return previousInterval
                          } else {
                            // If not current date, set to end of day
                            return setSeconds(setMinutes(setHours(new Date(editedClockOutDateString), 23), 59), 59)
                          }
                        })()}
                        onChange={(date: Date | null) => {
                          if (date) {
                            const timeString = date.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false
                            })
                            setValue('editedClockOutTime', timeString)
                          }
                        }}
                        customInput={
                          <PickersComponent
                            label='Clock Out Time'
                            registername='editedClockOutTime'
                            error={!!errors.editedClockOutTime}
                            id='edited-clock-out-time'
                          />
                        }
                      />
                    </Grid>
                  </Grid>
                  {hoursWorkedError && (
                    <Typography className='text-error'>Error: hours worked cannot exceed 24 hours</Typography>
                  )}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label='Hours Worked'
                      name='hoursWorked'
                      type='text'
                      control={control}
                      error={errors.hoursWorked}
                      isRequired={false}
                      disabled
                      placeHolder={'Hours Worked'}
                      defaultValue={''}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomDropDown
                      name={'tsApprovalStatus'}
                      control={control}
                      label={'Approval Status'}
                      isRequired={false}
                      optionList={[
                        { key: 1, value: 'Pending', optionString: 'Pending' },
                        { key: 2, value: 'Approved', optionString: 'Approved' },
                        { key: 3, value: 'Rejected', optionString: 'Rejected' }
                      ]}
                      disabled={!isEditing}
                      defaultValue={modalData?.tsApprovalStatus || ''}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label='Updated By'
                      name='updatedBy'
                      type='text'
                      control={control}
                      error={errors.updatedBy}
                      isRequired={false}
                      disabled
                      placeHolder={'Updated By'}
                      defaultValue={''}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomTextField
                      label='Updated At'
                      name='updatedAt'
                      type='text'
                      control={control}
                      error={errors.updatedAt}
                      isRequired={false}
                      disabled
                      placeHolder={'Updated At'}
                      defaultValue={''}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      label='Notes'
                      name='notes'
                      type='text'
                      control={control}
                      isRequired={false}
                      placeHolder={'Notes'}
                      defaultValue={''}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      label='Reason'
                      name='reason'
                      type='text'
                      control={control}
                      isRequired={false}
                      placeHolder={'Reason'}
                      defaultValue={''}
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <div className='flex gap-4 justify-end mt-6 pb-5'>
                <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                  CANCEL
                </Button>
                <Button type='submit' variant='contained' className='bg-[#4B0082]'>
                  SAVE
                </Button>
              </div>
            </form>
          </div>
        </Dialog>
      </FormProvider>
    </>
  )
}

export default ReceivedTimesheetTable

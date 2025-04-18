'use client'

import { useState, useMemo, useEffect, forwardRef } from 'react'
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
import axios from 'axios'
import { calculateHoursWorked, formatDate, formatDateTime, formatToLocalTime } from '@/utils/helperFunctions'
import { dark } from '@mui/material/styles/createPalette'
import CustomAlert from '@/@core/components/mui/Alter'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { FormProvider, useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import ControlledTextArea from '@/@core/components/custom-inputs/ControlledTextArea'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import ServiceActivities from '@/@core/components/custom-inputs/ServiceAcitvitesDropDown'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import { Edit } from '@mui/icons-material'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { setHours, setMinutes, setSeconds } from 'date-fns'
import api from '@/utils/api'
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
}

interface PickerProps {
  label?: string
  error?: boolean
  className?: string
  id?: string
  registername?: string
  placeholder?: string
}

const ReceivedTimesheetTable = ({ data, isLoading, fetchInitialData }: SignatureStatusTableProps, user: any) => {
  const methods = useForm<any>({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
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
  const [currentEditedData, setCurrentEditedData] = useState<any>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [isModalShow, setIsModalShow] = useState(false)
  const [modalData, setModalData] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>()
  const [isEditing, setIsEditing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState<any[]>([])
  const clockInDate = watch('clockInDate')
  const clockInTime = watch('clockInTime')
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const toggleEditing = () => {
    if (isEditing) {
      console.log('inside edit cancel')
      reset()
    }
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

  const handleModalClose = () => {
    setIsModalShow(false)
    setIsEditing(false)
    reset()
    handleCloseMenu()
  }

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
    const [time, period] = timeString.split(' ')
    const [hours, minutes] = time.split(':')
    const date = new Date()
    let hoursNum = parseInt(hours, 10)

    // Convert to 24-hour format
    if (period) {
      if (period.toLowerCase() === 'pm' && hoursNum !== 12) {
        hoursNum += 12
      } else if (period.toLowerCase() === 'am' && hoursNum === 12) {
        hoursNum = 0
      }
    }

    date.setHours(hoursNum)
    date.setMinutes(parseInt(minutes, 10))
    date.setSeconds(0)
    return date
  }

  const handleViewDetails = (user: any) => {
    setModalData(user)
    setIsModalShow(true)

    // Split clockIn into date and time
    let clockInDate = ''
    let clockInTime = ''
    if (user.clockIn) {
      const [datePart, timePart] = user.clockIn.split('T')
      clockInDate = datePart // DD-MM-YYYY
      clockInTime = timePart // hh:mm:aa
      console.log('CLOCK IN DATE', clockInDate)
      console.log('CLOCK IN TIME', clockInTime)
    }

    // Split clockOut into date and time
    let clockOutDate = ''
    let clockOutTime = ''
    if (user.clockOut) {
      const [datePart, timePart] = user.clockOut.split('T')
      clockOutDate = datePart // DD-MM-YYYY
      clockOutTime = timePart // hh:mm:aa
    }

    const convertedClockInTime = formatToLocalTime(user.clockIn)
    const convertedClockOutTime = formatToLocalTime(user.clockOut)

    console.log('CONVERTED CLOCK IN TIME', convertedClockInTime)
    console.log('CONVERTED CLOCK OUT TIME', convertedClockOutTime)

    const UTCTimeClockIn = new Date(user.clockIn)
    const timezoneOffsetClockIn = UTCTimeClockIn.getTimezoneOffset() * 60 * 1000 // Offset in milliseconds
    console.log('UTC TIME', UTCTimeClockIn)
    const localClockInTime = new Date(UTCTimeClockIn.getTime() - timezoneOffsetClockIn).toISOString()

    console.log('LOCAL CLOCK IN TIME', localClockInTime)

    const UTCTimeClockOut = new Date(user.clockOut)
    const timezoneOffsetClockOut = UTCTimeClockOut.getTimezoneOffset() * 60 * 1000 // Offset in milliseconds
    const localClockOutTime = new Date(UTCTimeClockOut.getTime() - timezoneOffsetClockOut).toISOString()

    console.log('LOCAL CLOCKOUT TIME', localClockOutTime)

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
    handleCloseMenu()
  }

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

        // Handle "hh:mm aa" format (e.g., "08:40 AM")
        if (timeStr.includes(' ')) {
          const [time, period] = timeStr.split(' ')
          const [h, m] = time.split(':')
          hours = parseInt(h, 10)
          minutes = parseInt(m, 10)

          // Convert to 24-hour format
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

      const originalClockIn = modalData?.clockIn || ''
      const originalClockOut = modalData?.clockOut || ''

      // Split original clockIn into date and time for comparison
      const [originalClockInDate = '', originalClockInTime = ''] = originalClockIn.split('T')
      const [originalClockOutDate = '', originalClockOutTime = ''] = originalClockOut.split('T')

      // Determine if clockIn or clockOut fields have changed
      const clockInDateChanged = formData.clockInDate !== originalClockInDate
      const clockInTimeChanged = formData.clockInTime !== originalClockInTime
      const clockOutDateChanged = formData.clockOutDate !== originalClockOutDate
      const clockOutTimeChanged = formData.clockOutTime !== originalClockOutTime

      const clockIn =
        clockInDateChanged || clockInTimeChanged
          ? formatTimeToISO(formData.clockInDate, formData.clockInTime)
          : originalClockIn

      // Format clockOut only if it has changed
      const clockOut =
        clockOutDateChanged || clockOutTimeChanged
          ? formatTimeToISO(formData.clockOutDate, formData.clockOutTime)
          : originalClockOut

      console.log('CLOCK IN', clockIn)
      console.log('CLOCK OUT', clockOut)

      const payload = {
        id: formData.id,
        tsApprovalStatus: formData.tsApprovalStatus,
        userId,
        clockIn: clockIn,
        clockOut: clockOut,
        dateOfService: formData.dateOfService,
        serviceName: formData.serviceName,
        updatedBy: formData.updatedBy,
        updatedAt: formData.updatedAt,
        notes: formData.notes,
        reason: formData.reason
      }

      await api.patch(`/time-log/update-timelog`, payload)
      await fetchInitialData()
      setIsModalShow(false)
      setModalData(null)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving modal data', error)
      setAlertOpen(true)
      setAlertProps({
        message: 'Failed to save changes. Please try again.',
        severity: 'error'
      })
    }
  }

  const handleSave = async () => {
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
            row => row.id !== currentEditedData.id && currentUser.subRows.some((subRow: any) => subRow.id === row.id)
          )
          .map(row => row.id)

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

      const updateResponses = await Promise.all(updatePromises)

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

        const billingResponses = await Promise.all(billingPromises)
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
          const billingDeleteResponses = await Promise.all(billingDeletePromises)
          console.log('INSIDE CALL Billing delete responses:', billingDeleteResponses)
        } else {
          console.log('INSIDE CALL NO BILLING TO DELETE')
        }
      }

      await fetchInitialData()
      setEditingId(null)
      setSelectedUser(null)
      setEditedValues({})
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
    setCurrentEditedData(user)
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

  const onDelete = async (row: any) => {
    try {
      const tenantId = authUser?.tenant?.id
      console.log('DELETE TS', row)
      if (row?.[0].subRows?.length) {
        const deletelogsIds = row?.[0].subRows.map((el: any) => el.id)
        await api.patch(`/time-log/delete-log/${tenantId}`, deletelogsIds)
        console.log('DELETE Multiple', deletelogsIds)
      } else {
        console.log('DELETE SINGLE', [row[0].id])
        await api.patch(`/time-log/delete-log/${tenantId}`, [row[0].id])
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
  }

  const handleConfirmDelete = async () => {
    try {
      // Call the onDelete function with the IDs of rows to delete
      await onDelete(rowsToDelete)
      // await onDelete(rowsToDelete.map(row => row.id))
      // Refresh the table data
      await fetchInitialData()
      // Reset delete state
      setDeletingId(null)
      setIsDeleting(false)
      setSelectedUser(null)
      setRowsToDelete([])
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
      render: (user: any) => (
        <Tooltip title={user?.serviceName || ''} placement='top'>
          <Typography color='primary'>
            {user?.serviceName?.slice(0, 20) || '---'}
            {user?.serviceName?.length > 20 ? '...' : ''}
          </Typography>
        </Tooltip>
      )
    },
    {
      id: 'timeDuration',
      label: 'HRS WORKED',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        if (!user?.clockIn || !user?.clockOut) {
          return <Typography className='font-normal text-base '>{user?.hrsWorked} Hrs</Typography>
        } else {
          const hoursWorked = calculateHoursWorked(user?.clockIn, user?.clockOut)
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
                  {user?.clockIn?.length > 0
                    ? `In: ${new Date(user?.clockIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}`
                    : 'In: ---'}
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
      id: 'updatedBy',
      label: 'UPDATED BY',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        if (!user?.updatedBy || !user?.updatedAt) {
          return <Typography className='font-normal text-base'>---</Typography>
        } else {
          console.log('OYE JANI', user)
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
      label: 'ACTION',
      editable: false,
      render: (user: any) => (
        <ActionButton
          handleEdit={handleEdit}
          handleSave={handleSave}
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
    setCurrentEditedData(updatedRow)
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
          <ReactTable
            columns={columns}
            data={data}
            keyExtractor={user => user.id.toString()}
            enableRowSelect
            stickyHeader
            maxHeight={600}
            containerStyle={{ borderRadius: 2 }}
            editingId={editingId}
            onSave={handleSave}
            onEditChange={handleEditChange}
            onSelectionChange={handleSelect}
          />
        </div>
        <div>
          <Dialog
            open={isModalShow}
            onClose={handleModalClose}
            closeAfterTransition={false}
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
          >
            <DialogCloseButton onClick={() => handleModalClose()} disableRipple>
              <i className='bx-x' />
            </DialogCloseButton>
            <div className='flex items-center justify-center pt-[10px] pb-[5px] w-full px-5'>
              <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
                <div className='flex flex-row justify-between items-center'>
                  <Typography className='text-xl font-semibold mt-5 mb-6'>Timesheet Details</Typography>
                  <Button variant='contained' onClick={toggleEditing}>
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
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
                      defaultValue={
                        modalData ? `${modalData.caregiver?.firstName} ${modalData.caregiver?.lastName}` : ''
                      }
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
                      optionList={[
                        {
                          key: 1,
                          value: 'Personal Care Assistant (PCA)',
                          optionString: 'Personal Care Assistant (PCA)'
                        },
                        {
                          key: 2,
                          value: 'Individual Home Service (IHS)',
                          optionString: 'Individual Home Service (IHS)'
                        }
                      ]}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ControlledDatePicker
                      name={'dateOfService'}
                      error={errors.dateOfService}
                      control={control}
                      label={'Date of Service'}
                      defaultValue={''}
                      isRequired={false}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <ControlledDatePicker
                        name={'clockInDate'}
                        error={errors.clockInDate}
                        control={control}
                        label={'Clock In Date'}
                        defaultValue={''}
                        isRequired={false}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <AppReactDatepicker
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        dateFormat='hh:mm aa'
                        id='clock-in-time-picker'
                        disabled={!isEditing}
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
                        minDate={clockInDate || undefined} // Restrict to clockInDate or later
                        isRequired={false}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <AppReactDatepicker
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        dateFormat='hh:mm aa'
                        id='clock-out-time-picker'
                        disabled={!isEditing}
                        selected={parseTimeStringToDate(watch('clockOutTime'))}
                        minTime={
                          clockInDate &&
                          watch('clockOutDate') &&
                          new Date(clockInDate).toDateString() === new Date(watch('clockOutDate')).toDateString()
                            ? parseTimeStringToDate(clockInTime) || undefined
                            : undefined
                        }
                        maxTime={setSeconds(setMinutes(setHours(new Date(), 23), 59), 59)}
                        // filterTime={filterPassedTime}
                        onChange={(date: Date | null) => {
                          if (date) {
                            const timeString = date.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false
                            })
                            setValue('clockOutTime', timeString)
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
                  </Grid>
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
                    <CustomTextField
                      label='Approval Status'
                      name='tsApprovalStatus'
                      type='text'
                      control={control}
                      error={errors.tsApprovalStatus}
                      isRequired={false}
                      placeHolder={'Approval Status'}
                      defaultValue={''}
                      disabled
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
                  {/* <Grid size={{ xs: 12 }}>
                    <ServiceActivities
                      name={'serviceActivities'}
                      control={control}
                      label={'Select Activities'}
                      error={errors.serviceActivities}
                      defaultValue={[]}
                      activities={activities || []}
                      isRequired={false}
                    />
                  </Grid> */}
                  <Grid size={{ xs: 12 }}>
                    <ControlledTextArea
                      label='Notes'
                      name='notes'
                      control={control}
                      isRequired={false}
                      placeHolder={'Notes'}
                      defaultValue={''}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <ControlledTextArea
                      label='Reason'
                      name='reason'
                      control={control}
                      isRequired={false}
                      placeHolder={'Reason'}
                      defaultValue={''}
                      disabled={!isEditing}
                    />
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
        </div>
      </FormProvider>
    </>
  )
}

export default ReceivedTimesheetTable

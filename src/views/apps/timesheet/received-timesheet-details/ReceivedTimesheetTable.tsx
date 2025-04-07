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
import { calculateHoursWorked, formatDate, formatDateTime } from '@/utils/helperFunctions'
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
  clockInDate: string
  clockInTime: string
  clockOutDate: string
  clockOutTime: string
  clockOut: string
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
      const activities = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/activity`)
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

  const handleEdit = (user: any) => {
    setEditingId(user.id)
    // setSelectedUser(user)
    // // Initialize edited values with current values
    // setEditedValues({
    //   ...user,
    //   id: user.id // Ensure we keep the id
    // })
    // handleCloseMenu()
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
    let hours24 = parseInt(hours, 10)

    if (period?.toLowerCase() === 'pm' && hours24 !== 12) hours24 += 12
    if (period?.toLowerCase() === 'am' && hours24 === 12) hours24 = 0

    date.setHours(hours24, parseInt(minutes, 10), 0, 0)
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

    setValue('id', user.id)
    setValue('tsApprovalStatus', user.tsApprovalStatus || 'Pending')
    setValue('clockInDate', clockInDate)
    setValue('clockInTime', clockInTime)
    setValue('clockOutDate', clockOutDate)
    setValue('clockOutTime', clockOutTime)
    setValue('hoursWorked', calculateHoursWorked(user.clockInTime, user.clockOutTime) || user.hrsWorked || '')
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
      const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
      const userId = authUser?.id

      const formatTimeToISO = (dateStr: any, timeStr: any): any => {
        if (!dateStr || !timeStr) return ''

        // Parse the time string (e.g., "10:09 AM")
        const [time, period] = timeStr.split(' ')
        let [hours, minutes] = time.split(':')
        hours = parseInt(hours, 10)

        // Convert to 24-hour format
        // if (period.toLowerCase() === 'pm' && hours !== 12) hours += 12
        // if (period.toLowerCase() === 'am' && hours === 12) hours = 0

        // Pad hours and minutes with leading zeros if needed
        const hoursStr = hours.toString().padStart(2, '0')
        const minutesStr = minutes.padStart(2, '0')

        // Combine date and time in ISO format (assuming UTC with 'Z')
        return `${dateStr}T${hoursStr}:${minutesStr}:00.000Z`
      }

      const clockIn = formatTimeToISO(formData.clockInDate, formData.clockInTime)
      const clockOut = formatTimeToISO(formData.clockOutDate, formData.clockOutTime)

      // const clockIn =
      //   formData.clockInDate && formData.clockInTime
      //     ? `${formData.clockInDate}T${formData.clockInTime}`
      //     : formData.clockInDate || ''

      // // Combine clockOut date and time
      // const clockOut =
      //   formData.clockOutDate && formData.clockOutTime
      //     ? `${formData.clockOutDate}T${formData.clockOutTime}`
      //     : formData.clockOutDate || ''

      const payload = {
        id: formData.id,
        tsApprovalStatus: formData.tsApprovalStatus,
        userId,
        clockIn,
        clockOut,
        dateOfService: formData.dateOfService,
        serviceName: formData.serviceName,
        updatedBy: formData.updatedBy,
        updatedAt: formData.updatedAt,
        notes: formData.notes,
        reason: formData.reason
      }

      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/time-log/update-timelog`, payload)
      await fetchInitialData() // Refresh the table data
      setIsModalShow(false) // Close the modal
      setModalData(null) // Clear modal data
      setIsEditing(false) // Reset the editing state
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

        updatePromises = subRowUpdates.map((payload: any) =>
          axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/time-log/update-ts-approval`, payload)
        )
      } else {
        rowsToUpdate = [currentUser]
        updatePromises.push(
          axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/time-log/update-ts-approval`, {
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
            axios.post(`${process.env.NEXT_PUBLIC_API_URL}/time-log/billing`, {
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
            billingDeletePromises.push(
              axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/time-log/remove-billing/${row.billing.id}`)
            )
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

  const handleCancelEdit = () => {
    setEditingId(null)
    setSelectedUser(null)
    // setEditedValues({})
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
          label={user?.tsApprovalStatus.toUpperCase() || 'PENDING'}
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
          handleViewDetails={handleViewDetails}
          handleActionClick={handleActionClick}
          handleCloseMenu={handleCloseMenu}
          handleCancelEdit={handleCancelEdit}
          isEditing={editingId !== null}
          user={user}
          selectedUser={selectedUser}
          anchorEl={anchorEl}
          // disabled={!!user.subRows && user.subRows.length > 0}
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

  // Assuming your first file data is in originalTimeEntries
  // const transformedData = transformTimesheetData(data)
  // console.log('Date timesheet,data', transformedData)
  console.log('DATE AFTER SUBROWS', data)
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
                              hour12: true
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
                        onChange={(date: Date | null) => {
                          if (date) {
                            const timeString = date.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
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

'use client'
import React, { forwardRef, use, useEffect, useState } from 'react'
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
import axios from 'axios'
import { Close as CloseIcon } from '@mui/icons-material'
import { format, parseISO, set } from 'date-fns' // Core date-fns functions
import { toZonedTime } from 'date-fns-tz'
import api from '@/utils/api'

interface DefaultStateType {
  currentWeek: string
  dateOfService: Date | null
  caregiver: string | undefined
  client: string
  service: string
  notes: string
  manualEntry: boolean
  serviceName: string
  payPeriodHistoryId: number
  signatureId: number
  clockIn: Date | null
  clockOut: Date | null
  checkedActivityId: number
  reason: string
}

const defaultState: DefaultStateType = {
  currentWeek: '',
  caregiver: '',
  client: '',
  service: '',
  dateOfService: null,
  notes: '',
  manualEntry: true,
  serviceName: 'Physical Therapy',
  payPeriodHistoryId: 0,
  signatureId: 0,
  clockIn: null,
  clockOut: null,
  checkedActivityId: 0,
  reason: ''
}

interface PickerProps {
  label?: string
  error?: boolean
  className?: string
  id?: string
  registername?: string
  placeholder?: string
}

const ManualTimesheet = ({ clientList, caregiverList, serviceList, payPeriod }: any) => {
  const [values, setValues] = useState<DefaultStateType>(defaultState)
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false)
  const [weekRange, setWeekRange] = useState<any>({})
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [clientUsers, setClientUsers] = useState<any[]>([])
  const [serviceType, setServiceType] = useState<any[]>([])
  const [serviceActivities, setServiceActivities] = useState([])
  const [clientData, setClientData] = useState<any>()
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const combineDateAndTimeForGMT = (date: any, time: any) => {
    if (!date || !time) return null

    const datePart = new Date(date)
    const timePart = new Date(time)

    // Create a GMT date by setting hours/minutes in UTC context
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

  // Helper function to remove a specific item from the array
  const handleDelete = (itemToRemove: number) => {
    setSelectedItems(prev => prev.filter(item => item !== itemToRemove))
  }

  const handleChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value as number[]
    setSelectedItems(value)
  }

  console.log('Caregiver value', values.caregiver)

  const caregiverId = values.caregiver

  const fetchClientUsers = async () => {
    try {
      if (!caregiverId) return // Avoid fetching if caregiverId is not set
      const response = await api.get(`/user/clientUsers/${caregiverId}`)
      setClientUsers(response.data)
      console.log('Client Users ~~----~~---->', response.data)
    } catch (error) {
      console.error('Error fetching client users:', error)
    }
  }

  console.log('clientUsers in manual ====> ', clientUsers)

  const fetchClientData = async () => {
    try {
      if (!values.client) return // Avoid fetching if client is not set
      const response = await api.get(`/client/${values.client}`)
      setClientData(response.data)
    } catch (error) {
      console.error('Error fetching client data:', error)
    }
  }

  useEffect(() => {
    fetchClientData()
  }, [values.client])
  console.log('Client Data', clientData?.serviceActivityIds)

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

  useEffect(() => {
    fetchClientServiceType()
  }, [values.client])
  console.log('Service Type', serviceType)

  const activityIds = clientData?.serviceActivityIds
  console.log('Activity Ids', activityIds)

  // const clientServiceActivities = async () => {
  //   try {
  //     if (!values.client) return // Avoid fetching if service is not set
  //     const response: any = await api.get(`/activity/activities/${activityIds}`)
  //     console.log('response of activities -------------> ', response)
  //     setServiceActivities(response)
  //   } catch (error) {
  //     console.error('Error fetching client service activities:', error)
  //   }
  // }

  // console.log('Activities --------------> ', serviceActivities)

  // useEffect(() => {
  //   clientServiceActivities()
  // }, [values.client])

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

  useEffect(() => {
    if (Object.keys(payPeriod).length > 0) {
      const range = calculateStartAndEndDate(payPeriod)
      setWeekRange(range)
    }
  }, [payPeriod])

  console.log('Available Activities', activities)

  const calculateStartAndEndDate = (range: any) => {
    // Ensure correct parsing of the start date in UTC
    const [year, month, day] = range?.startDate?.split('-')
    const startDate = new Date(Date.UTC(year, month - 1, day)) // Use UTC to avoid time zone issues

    const endDate = new Date(startDate)
    endDate.setUTCDate(startDate.getUTCDate() + range.numberOfWeeks * 7) // Update in UTC as well

    return {
      startDate: startDate.toISOString().split('T')[0], // Get ISO date in YYYY-MM-DD format
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  console.log(weekRange)

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

  const onDiscard = () => {
    setValues(defaultState)
  }

  console.log('CLOCKIN', values.clockIn?.toISOString())
  console.log('CLOCKOUT', values.clockOut?.toISOString())
  console.log('DATEOFSERVICE', values.dateOfService)

  const onSubmit = async () => {
    try {
      const checkedActivityRes = await api.post(`/activity`, {
        activityIds: selectedItems
      })

      const payLoad = {
        clientSignature: '',
        caregiverSignature: '',
        duration: '',
        caregiverId: values.caregiver,
        clientId: values.client,
        tenantId: authUser?.tenant?.id,
        signatureStatus: 'Pending'
      }

      // Make the API call only if client does not exist in taken or pending
      const signResponse: any = await api.post(`/signatures`, payLoad)
      if (checkedActivityRes.status === 201) {
        const modifiedEvent = {
          dateOfService: values.dateOfService,
          manualEntry: true,
          clockIn: values.clockIn?.toISOString(),
          clockOut: values.clockOut?.toISOString(),
          tsApprovalStatus: 'Pending',
          notes: values.notes,
          reason: values.reason,
          serviceId: values.service,
          clientId: values.client,
          caregiverId: values.caregiver,
          checkedActivityId: checkedActivityRes.data.id,
          serviceName: values.serviceName,
          payPeriodHistoryId: payPeriod.id,
          signatureId: signResponse.data.id,
          tenantId: authUser?.tenant?.id
        }
        const updateSchedule = await api.post(`/time-log`, modifiedEvent)
      }
      // Reset form and show success message
      setValues(defaultState)
      setActivities([])
      setOpenSuccessSnackbar(true)
    } catch (error) {
      console.log('Error:', error)
    }
  }

  return (
    <>
      <Card className='w-full h-fit' sx={{ p: 2, borderRadius: 1, boxShadow: 2 }}>
        {/* Card Header */}
        <CardHeader
          title='Add Your Manually Timesheet Details'
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 500 } }}
        />

        {/* Card Content */}
        <CardContent>
          <Grid container spacing={4}>
            {/* Week Dropdown */}
            <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 6 }}>
              <TextField
                label={'Current Week'}
                value={`${weekRange.startDate} to ${weekRange.endDate}`}
                onChange={e => setValues({ ...values, currentWeek: `${weekRange.startDate} to ${weekRange.endDate}` })}
                disabled={true}
                size='small'
                fullWidth
              >{`${weekRange.startDate} to ${weekRange.endDate}`}</TextField>
            </Grid>

            <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size='small' variant='outlined'>
                <InputLabel id='week-select-label'>Select Caregiver</InputLabel>
                <Select
                  labelId='week-select-label'
                  value={values.caregiver}
                  label='Select Caregiver'
                  onChange={e => setValues({ ...values, caregiver: e.target.value })}
                >
                  {caregiverList.map((caregiver: any) => (
                    <MenuItem key={caregiver.id} value={caregiver.id}>
                      {`${caregiver.firstName} ${caregiver.lastName}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size='small' variant='outlined'>
                <InputLabel id='week-select-label'>Select Client</InputLabel>
                <Select
                  labelId='week-select-label'
                  value={values.client}
                  label='Select Client'
                  onChange={e => setValues({ ...values, client: e.target.value })}
                  disabled={!values.caregiver}
                >
                  {clientUsers.map((client: any) => (
                    <MenuItem key={client?.client?.id} value={client?.client?.id}>
                      {`${client?.client?.firstName} ${client?.client?.lastName}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size='small' variant='outlined'>
                <InputLabel id='week-select-label'>Select Service</InputLabel>
                <Select
                  labelId='week-select-label'
                  value={values.serviceName}
                  label='Select Service'
                  onChange={e => setValues({ ...values, serviceName: e.target.value })}
                >
                  {serviceType.map((service: any) => (
                    <MenuItem key={service.id} value={service.name}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 6 }}>
              <AppReactDatepicker
                selectsStart
                id='event-start-date'
                endDate={values.dateOfService !== null ? values.dateOfService : weekRange.endDate}
                selected={values.dateOfService}
                startDate={values.dateOfService !== null ? values.dateOfService : weekRange.startDate}
                showTimeSelect={!values.dateOfService}
                dateFormat={!values.dateOfService ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                minDate={weekRange.startDate} // Set the minimum selectable date
                maxDate={weekRange.endDate}
                customInput={
                  <PickersComponent label='Date Of Service' registername='dateOfService' id='event-start-date' />
                }
                onChange={(date: Date | null) =>
                  date !== null && setValues({ ...values, dateOfService: new Date(date) })
                }
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
                id='time-only-picker'
                onChange={(date: any | null) => {
                  if (date !== null) {
                    // Combine the selected end date with the selected end time
                    const combinedDate = combineDateAndTimeForGMT(values.dateOfService, date)
                    setValues({
                      ...values,
                      clockIn: date
                    })
                  }
                }}
                customInput={
                  <PickersComponent
                    label='Clock-In Time'
                    registername='clockIn'
                    className='mbe-3'
                    id='event-end-time'
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
                id='time-only-picker'
                onChange={(date: Date | null) => {
                  if (date !== null) {
                    const combinedDate = combineDateAndTimeForGMT(values.dateOfService, date)
                    // Combine the selected end date with the selected end time
                    setValues({
                      ...values,
                      clockOut: date
                    })
                  }
                }}
                customInput={
                  <PickersComponent
                    label='Clock-Out Time'
                    registername='clockOut'
                    className='mbe-3'
                    id='event-end-time'
                  />
                }
              />
            </Grid>

            <Box className='w-full pb-1'>
              <FormControl fullWidth className='relative'>
                <InputLabel size='small'>Select Activities</InputLabel>
                <Select
                  multiple
                  value={selectedItems}
                  onChange={handleChange} // Fixed: Pass the function directly
                  renderValue={() => ''}
                  label='Select Activities'
                  size='small'
                >
                  {activities?.map((svc: any) => (
                    <MenuItem key={svc.id} value={svc.id}>
                      {svc.title}
                    </MenuItem>
                  ))}
                </Select>

                {/* Render chips BELOW the select */}
                <Box className='flex flex-wrap gap-2 mt-2'>
                  {selectedItems.map(item => {
                    const service = activities.find(s => s.id === item)
                    return (
                      <Chip
                        key={item}
                        onDelete={() => handleDelete(item)}
                        label={service?.title}
                        deleteIcon={<CloseIcon sx={{ fontSize: '14px', color: '#8592A3' }} />}
                        className='mt-2 text-[#8592A3] text-sm py-1'
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
                    reason: e.target.value
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
                  setValues({
                    ...values,
                    notes: e.target.value
                  })
                }}
              />
            </Grid>

            {/* Buttons Section */}
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
              <Button variant='contained' color='primary' onClick={onSubmit}>
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

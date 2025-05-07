'use client'
import React, { forwardRef, useEffect, useState } from 'react'
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
import { Close as CloseIcon } from '@mui/icons-material'
import api from '@/utils/api'
import { setHours, setMinutes, setSeconds } from 'date-fns'

interface DefaultStateType {
  currentWeek: string
  dateOfService: any
  caregiver: string | undefined
  client: string
  service: string
  notes: string
  manualEntry: boolean
  serviceName: string
  payPeriodHistoryId: number
  signatureId: number
  clockIn: any
  clockOut: any
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

const ManualTimesheet = ({ caregiverList, payPeriod }: any) => {
  const [values, setValues] = useState<DefaultStateType>(defaultState)
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false)
  const [weekRange, setWeekRange] = useState<any>({})
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [clientUsers, setClientUsers] = useState<any>([])
  const [serviceType, setServiceType] = useState<any[]>([])
  const [serviceActivities, setServiceActivities] = useState<any>([])
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

  const fetchClientUsers = async () => {
    try {
      const filterCg = caregiverList.filter((ele: any) => ele.id === values.caregiver)
      const caregiverUserId = filterCg[0]?.user?.id
      if (!caregiverUserId) return // Avoid fetching if caregiverUserId is not set
      const response = await api.get(`/user/clientUsers/${caregiverUserId}`)
      setClientUsers(response.data)
    } catch (error) {
      console.error('Error fetching client users:', error)
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

  useEffect(() => {
    fetchClientServiceType()
    clientServiceActivities()
  }, [values.client])

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
    if (Object.keys(payPeriod).length > 0) {
      const range = calculateStartAndEndDate(payPeriod)
      setWeekRange(range)
    }
  }, [payPeriod])

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
    setSelectedItems([])
  }

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
        // Extract the date part from dateOfService
        const serviceDate = new Date(values.dateOfService)

        // Create new Date objects for clockIn and clockOut
        let newClockIn = new Date(values.clockIn)
        let newClockOut = new Date(values.clockOut)

        // Set the date part of clockIn and clockOut to match dateOfService
        // while keeping their original time values
        newClockIn.setFullYear(serviceDate.getFullYear(), serviceDate.getMonth(), serviceDate.getDate())
        newClockOut.setFullYear(serviceDate.getFullYear(), serviceDate.getMonth(), serviceDate.getDate())

        const modifiedEvent = {
          dateOfService: values?.dateOfService,
          manualEntry: true,
          clockIn: newClockIn.toISOString(),
          clockOut: newClockOut.toISOString(),
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
        await api.post(`/time-log`, modifiedEvent)
      }
      // Reset form and show success message
      setValues(defaultState)
      setSelectedItems([])
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
                    <MenuItem key={caregiver?.id} value={caregiver?.id}>
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
                // showTimeSelect={!values.dateOfService}
                dateFormat={'yyyy-MM-dd'}
                minDate={weekRange.startDate} // Set the minimum selectable date
                maxDate={weekRange.endDate}
                customInput={
                  <TextField
                    fullWidth
                    size='small'
                    label={'Date Of Service'}
                    placeholder='MM/DD/YYYY'
                    id='event-start-date'
                  />
                }
                onChange={(date: Date | null) => date !== null && setValues({ ...values, dateOfService: date })}
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
                      clockIn: date,
                      clockOut: null
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
                minTime={values.clockIn || new Date()}
                maxTime={setSeconds(setMinutes(setHours(new Date(), 23), 59), 59)}
                id='time-only-picker'
                onChange={(date: Date | null) => {
                  if (date !== null) {
                    const combinedDate = combineDateAndTimeForGMT(values.dateOfService, date)
                    // Combine the seleime end time
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
                  {serviceActivities?.map((svc: any) => (
                    <MenuItem key={svc.id} value={svc.id}>
                      {svc.title}
                    </MenuItem>
                  ))}
                </Select>

                {/* Render chips BELOW the select */}
                <Box className='flex flex-wrap gap-2 mt-2'>
                  {selectedItems.map(item => {
                    const service = serviceActivities.find((s: any) => s.id === item)
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
                    reason: e.target.value.trimStart()
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
                    notes: e.target.value.trimStart()
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

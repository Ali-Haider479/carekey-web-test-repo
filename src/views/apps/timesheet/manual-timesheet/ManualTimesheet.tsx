import React, { forwardRef, useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Alert
} from '@mui/material'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import CustomTextField from '@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import axios from 'axios'

interface DefaultStateType {
  currentWeek: string
  dateOfService: Date
  caregiver: string | undefined
  client: string
  service: string
  notes: string
  manualEntry: boolean
  serviceName: string
  payPeriodHistoryId: number
  signatureId: number
  clockIn: string
  clockOut: string
  checkedActivityId: number
}

const defaultState: DefaultStateType = {
  currentWeek: '',
  caregiver: '',
  client: '',
  service: '',
  dateOfService: new Date(),
  notes: '',
  manualEntry: true,
  serviceName: 'Physical Therapy',
  payPeriodHistoryId: 0,
  signatureId: 0,
  clockIn: '',
  clockOut: '',
  checkedActivityId: 0
}

interface PickerProps {
  label?: string
  error?: boolean
  className?: string
  id?: string
  registername?: string
}

const ManualTimesheet = ({ clientList, caregiverList, serviceList, payPeriod }: any) => {
  const [values, setValues] = useState<DefaultStateType>(defaultState)
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false)

  const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
    return (
      <CustomTextField
        inputRef={ref}
        fullWidth
        {...props}
        label={props.label || ''}
        className={props.className}
        placeholder='Date of Service'
        id={props.id}
        error={props.error}
      />
    )
  })

  const onDiscard = () => {
    setValues(defaultState)
  }

  const onSubmit = async () => {
    try {
      const modifiedEvent = {
        currentWeek: values.currentWeek,
        caregiverId: values.caregiver,
        clientId: values.client,
        serviceId: values.service,
        dateOfService: values.dateOfService,
        clockIn: new Date(),
        clockOut: '',
        notes: '',
        manualEntry: true,
        serviceName: 'Physical Therapy',
        payPeriodHistoryId: payPeriod.id,
        signatureId: null,
        checkedActivityId: 1
      }

      const updateSchedule = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/time-log`, modifiedEvent)

      // Reset form and show success message
      setValues(defaultState)
      setOpenSuccessSnackbar(true)

    } catch (error) {
      console.log('Error:', error)
    }
  }

  return (
    <>
      <Card className='w-full h-80' sx={{ p: 2, borderRadius: 1, boxShadow: 2 }}>
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
              <FormControl fullWidth size='small' variant='outlined'>
                <InputLabel id='week-select-label'>Current Week</InputLabel>
                <Select
                  labelId='week-select-label'
                  value={values.currentWeek}
                  label='Current Week'
                  onChange={e => setValues({ ...values, currentWeek: e.target.value })}
                >
                  <MenuItem value='Week 1'>Week 1</MenuItem>
                  <MenuItem value='Week 2'>Week 2</MenuItem>
                  <MenuItem value='Week 3'>Week 3</MenuItem>
                  <MenuItem value='Week 4'>Week 4</MenuItem>
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
                >
                  {clientList.map((client: any) => (
                    <MenuItem key={client.id} value={client.id}>
                      {`${client.firstName} ${client.lastName}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                <InputLabel id='week-select-label'>Select Service</InputLabel>
                <Select
                  labelId='week-select-label'
                  value={values.service}
                  label='Select Service'
                  onChange={e => setValues({ ...values, service: e.target.value })}
                >
                  {serviceList.map((service: any) => (
                    <MenuItem key={service.id} value={service.id}>
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
                endDate={values.dateOfService}
                selected={values.dateOfService}
                startDate={values.dateOfService}
                showTimeSelect={!values.dateOfService}
                dateFormat={!values.dateOfService ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                customInput={<PickersComponent registername='dateOfService' id='event-start-date' />}
                onChange={(date: Date | null) =>
                  date !== null && setValues({ ...values, dateOfService: new Date(date) })
                }
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
        autoHideDuration={3000}
        onClose={() => setOpenSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setOpenSuccessSnackbar(false)} severity='success' sx={{ width: '100%' }}>
          Time Log Created Successfully!
        </Alert>
      </Snackbar>
    </>
  )
}

export default ManualTimesheet

import React, { forwardRef, useState } from 'react'
import { Card, CardHeader, CardContent, TextField, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
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
}

const defaultState: DefaultStateType = {
  currentWeek: '',
  caregiver: '',
  client: '',
  service: '',
  dateOfService: new Date()
}

interface PickerProps {
  label?: string
  error?: boolean
  className?: string
  id?: string
  registername?: string
}

const ManualTimesheet = ({ clientList, caregiverList, serviceList }: any) => {
  const [values, setValues] = useState<DefaultStateType>(defaultState)
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

  const onSubmit = async () => {
    const modifiedEvent = {
      display: 'block',
      currentWeek: values.currentWeek,
      caregiverId: values.caregiver,
      clientId: values.client,
      serviceId: values.service,
      dateOfService: values.dateOfService
    }

    const updateSchedule = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/schedule`, modifiedEvent)
  }

  return (
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
                value={''}
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
                value={''}
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
                value={''}
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
                value={''}
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
              onChange={(date: Date | null) => date !== null && setValues({ ...values, dateOfService: new Date(date) })}
            />
          </Grid>

          <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 6 }}>
            <Button variant='outlined' color='secondary' onClick={onSubmit}>
              DISCARD
            </Button>
          </Grid>
          <Grid sx={{ pb: 2 }} size={{ xs: 12, md: 6 }}>
            <Button variant='outlined' color='secondary' onClick={onSubmit}>
              ADD LOG
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ManualTimesheet

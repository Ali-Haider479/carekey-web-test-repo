'use client'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputLabel,
  Select,
  Typography
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import ControlledTextArea from '@/@core/components/custom-inputs/ControlledTextArea'
import ServiceActivities from '@/@core/components/custom-inputs/ServiceAcitvitesDropDown'
import { clientServiceFormDataType } from './formTypes'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import axios from 'axios'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

type Props = {
  form?: any
  onFinish?: any
  defaultValues: any
}

const ServiceActivitiesForm = forwardRef<{ handleSubmit: any }, Props>(({ onFinish, defaultValues }, ref) => {
  const methods = useForm<clientServiceFormDataType>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: defaultValues || []
  })

  // Expose handleSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: (onValid: (data: clientServiceFormDataType) => void) => handleSubmit(onValid)
  }))

  const {
    control,
    formState: { errors },
    register,
    getValues,
    setValue,
    handleSubmit // Add this if you want to use form submission
  } = methods // Use methods instead of useFormContext

  const onSubmit = (data: clientServiceFormDataType) => {
    console.log('Submitted Data:', data)
    onFinish(data) // Pass form data to parent
  }

  const [serviceTypes, setServiceTypes] = useState<any[]>()
  const [activities, setActivities] = useState<any[]>()
  const [caregiversList, setCaregiversList] = useState<any>()
  const [assignmentDate, setAssignmentDate] = useState<Date | null>(null)
  const [unAssignmentDate, setUnAssignmentDate] = useState<Date | null>(null)
  const [lastCompletedDate, setLastCompletedDate] = useState<Date | null>(null)
  const [dueDate, setDueDate] = useState<Date | null>(null)

  const getAvailableServices = async () => {
    try {
      const activities = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/activity`)
      setActivities(activities.data)
    } catch (error) {
      console.error('Error getting activities: ', error)
    }
  }

  const getServiceTypes = async () => {
    try {
      const serviceTypesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/service`)
      console.log('Service Types --> ', serviceTypesResponse)
      setServiceTypes(serviceTypesResponse.data)
    } catch (error) {
      console.error('Error getting service types: ', error)
    }
  }

  const getCaregiversList = async () => {
    try {
      const caregiversListData = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregivers`)
      console.log('Caregivers List Data--> ', caregiversListData)
      setCaregiversList(caregiversListData)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  useEffect(() => {
    getServiceTypes()
    getAvailableServices()
    getCaregiversList()
  }, [])

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
        <Card>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Assign Caregiver</Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth className='relative'>
                  <InputLabel size='small'>Caregiver</InputLabel>
                  <Select
                    {...register('caregiverId', { required: false })}
                    name='caregiverId'
                    label='Caregiver'
                    size='small'
                  >
                    {caregiversList?.data?.map((item: any) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>
                          {item.firstName} {item.lastName}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <AppReactDatepicker
                  {...register('assignmentDate', { required: false })}
                  selected={getValues('assignmentDate') || assignmentDate}
                  onChange={date => {
                    console.log('Date:', date)
                    setValue('assignmentDate', date)
                    setAssignmentDate(date)
                  }} // Pass the date to react-hook-form
                  placeholderText='MM/DD/YYYY'
                  customInput={
                    <TextField
                      fullWidth
                      size='small'
                      name='assignmentDate'
                      label='Assignment Date'
                      placeholder='MM/DD/YYYY'
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <AppReactDatepicker
                  {...register('unassignmentDate', { required: false })}
                  selected={getValues('unassignmentDate') || unAssignmentDate}
                  onChange={date => {
                    console.log('Date:', date)
                    setValue('unassignmentDate', date)
                    setUnAssignmentDate(date)
                  }} // Pass the date to react-hook-form
                  placeholderText='MM/DD/YYYY'
                  customInput={
                    <TextField
                      fullWidth
                      size='small'
                      name='unassignmentDate'
                      label='Unassignment Date'
                      placeholder='MM/DD/YYYY'
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('scheduleHours', { required: false })}
                  label={'Scheduled Hours'}
                  placeholder={'Scheduled Hours'}
                  name={'scheduleHours'}
                  defaultValue={''}
                  type={'number'}
                  size='small'
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={4} sx={{ marginTop: 4 }}>
              <TextField
                {...register('assignmentNotes', { required: false })}
                label={'Assignment Notes'}
                placeholder={'Assignment Notes'}
                name={'assignmentNotes'}
                defaultValue={''}
                type={'text'}
                size='small'
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
          </CardContent>
        </Card>
        <Card className='mt-3'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Client Service Type</Typography>

            <Grid container spacing={5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomDropDown
                  name={'service'}
                  control={control}
                  error={errors.service}
                  label={'Select Service'}
                  optionList={
                    serviceTypes?.map((item: any) => {
                      return {
                        key: `${item.id}-${item.name}`,
                        value: item.id,
                        optionString: item.name
                      }
                    }) || []
                  }
                  defaultValue={''}
                />
              </Grid>
              <TextField
                {...register('serviceNotes', { required: false })}
                label={'Service Notes'}
                placeholder={'Service Notes'}
                name={'serviceNotes'}
                defaultValue={''}
                type={'text'}
                size='small'
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
          </CardContent>
        </Card>

        <Card className='mt-3'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Service Activities</Typography>

            <ServiceActivities
              name={'serviceActivities'}
              control={control}
              label={'Select Service'}
              error={errors.serviceActivities}
              defaultValue={[]}
              activities={activities || []}
            />
          </CardContent>
        </Card>

        <Card className='mt-3'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Care Plan Due</Typography>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-x-5 mb-3 mt-2'>
              <AppReactDatepicker
                {...register('lastCompletedDate', { required: false })}
                selected={getValues('lastCompletedDate') || lastCompletedDate}
                onChange={date => {
                  console.log('Date:', date)
                  setValue('lastCompletedDate', date)
                  setLastCompletedDate(date)
                }} // Pass the date to react-hook-form
                placeholderText='MM/DD/YYYY'
                customInput={
                  <TextField
                    fullWidth
                    size='small'
                    name='lastCompletedDate'
                    label='Last Completed Date'
                    placeholder='MM/DD/YYYY'
                  />
                }
              />
              <AppReactDatepicker
                {...register('dueDate', { required: false })}
                selected={getValues('dueDate') || dueDate}
                onChange={date => {
                  console.log('Date:', date)
                  setValue('dueDate', date)
                  setDueDate(date)
                }} // Pass the date to react-hook-form
                placeholderText='MM/DD/YYYY'
                customInput={
                  <TextField fullWidth size='small' name='dueDate' label='Due Date' placeholder='MM/DD/YYYY' />
                }
              />
              <TextField
                {...register('qpAssigned', { required: false })}
                label={'QP Assigned'}
                placeholder={'QP Assigned'}
                name={'qpAssigned'}
                defaultValue={''}
                type={'text'}
                size='small'
                fullWidth
              />
            </div>
            <TextField
              {...register('notes', { required: false })}
              label={'Notes'}
              placeholder={'Notes'}
              name={'notes'}
              defaultValue={''}
              type={'text'}
              size='small'
              fullWidth
              multiline
              rows={4}
            />
            <div className='col-span-1 md:col-span-3 mt-3'>
              <Typography variant='h6' color='textPrimary'>
                Service Type
              </Typography>
            </div>
            <div className='flex space-x-4'>
              <FormGroup row>
                <FormControlLabel control={<Checkbox onChange={() => {}} />} label='All' />
                <FormControlLabel control={<Checkbox onChange={() => {}} />} label='HSS' />
                <FormControlLabel control={<Checkbox onChange={() => {}} />} label='Waivered' />
              </FormGroup>
            </div>
            <Button className='mt-3' variant='contained'>
              CREATE NEW ACCOUNT
            </Button>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  )
})

export default ServiceActivitiesForm

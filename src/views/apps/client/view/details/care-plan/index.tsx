'use client'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import api from '@/utils/api'
import {
  Card,
  CardContent,
  Typography,
  TextField,
  FormGroup,
  FormControlLabel,
  Box,
  Button,
  CircularProgress,
  FormLabel,
  Checkbox,
  InputLabel,
  FormControl,
  FormHelperText,
  MenuItem,
  Select
} from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import DropdownWithChips from '@/@core/components/custom-inputs/DropdownWithChips'
import { useParams } from 'next/navigation'
import { generateCarePlanPDF } from './carePlanPDF'

interface ActivityNote {
  assistanceLevel?: string
  note?: string
}

interface ServiceType {
  id: number
  name: string
  service?: { id: number; name: string; procedureCode: string }
  serviceAuthService?: { name: string; procedureCode: string }
}

interface Activity {
  id: number
  title: string
  service?: { id: number }
}

interface CarePlanFormType {
  lastCompletedDate: Date | null
  dueDate: Date | null
  qpAssigned: string
  dischargePlans: string
  serviceType: string
  serviceAuth: string
  serviceActivities?: number[]
  frequency: 'daily' | 'weekly' | 'monthly' | ''
  otherTasks: string
  rehabPotential: string
  notes?: {
    [key: string]: ActivityNote // Changed to string index signature
  }
}

const initialFormState: CarePlanFormType = {
  lastCompletedDate: null,
  dueDate: null,
  qpAssigned: '',
  dischargePlans: '',
  serviceType: '',
  serviceAuth: '',
  serviceActivities: [],
  frequency: '',
  otherTasks: '',
  rehabPotential: '',
  notes: {}
}

const frequencyOptions = [
  { key: 1, value: 'daily', optionString: 'Daily' },
  { key: 2, value: 'weekly', optionString: 'Weekly' },
  { key: 3, value: 'monthly', optionString: 'Monthly' }
]

const assistanceLevelOptions = [
  { value: 'None', label: 'None' },
  { value: 'Minimal', label: 'Minimal' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'Maximal', label: 'Maximal' },
  { value: 'Total', label: 'Total' }
]

const rehabPotentialOptions = [
  { key: 1, value: 'excellent', optionString: 'Excellent' },
  { key: 1, value: 'good', optionString: 'Good' },
  { key: 2, value: 'fair', optionString: 'Fair' },
  { key: 3, value: 'poor', optionString: 'Poor' }
]

const CarePlan = () => {
  const { id } = useParams()
  const [qpsList, setQPsList] = useState<any>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [serviceAuthList, setServiceAuthList] = useState<any[]>([])

  const methods = useForm<CarePlanFormType>({
    defaultValues: initialFormState
  })

  const {
    control,
    formState: { errors },
    register,
    setValue,
    watch,
    handleSubmit,
    reset
  } = methods

  const selectedServiceTypeId = watch('serviceType')
  const selectedActivities = watch('serviceActivities') || []

  useEffect(() => {
    if (selectedServiceTypeId !== '') {
      const foundItem = serviceTypes.find(item => item.id === Number(selectedServiceTypeId))
      const filteredActivities = selectedServiceTypeId
        ? activities.filter(activity => activity?.title.includes(foundItem?.service?.name ?? ''))
        : activities
      setActivities(filteredActivities)
    }
  }, [selectedServiceTypeId])

  const getInitialData = async () => {
    try {
      const [serviceTypesResponse, qpsListData, activitiesResponse, serviceAuthRes] = await Promise.all([
        api.get(`/client/client-services-activities/${id}`),
        api.get('/caregivers/qp'),
        api.get('/activity'),
        api.get(`/client/${id}/service-auth`)
      ])
      setServiceTypes(serviceTypesResponse.data[0].clientServices)
      setQPsList(qpsListData.data)
      const filteredActivities = activitiesResponse?.data?.filter((item: any) =>
        serviceTypesResponse.data[0].serviceActivityIds.includes(item.id)
      )
      setActivities(filteredActivities)
      setServiceAuthList(serviceAuthRes.data)
    } catch (error) {
      console.error('Error fetching initial data: ', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getInitialData()
  }, [])

  const onFinish = async (data: CarePlanFormType) => {
    setSubmitting(true)
    try {
      console.log('Form submitted:', data)
      await api.post('/client/care-plan-form', { ...data, clientId: id })
      reset(initialFormState)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    reset(initialFormState)
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 250,
          width: '100%'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <Button
          variant='contained'
          type='button'
          onClick={() => {
            const formValues = methods.getValues()
            generateCarePlanPDF({
              formData: formValues,
              serviceType: serviceTypes,
              serviceAuth: serviceAuthList,
              qpsList: qpsList,
              activities: activities
            })
          }}
        >
          Download PDF
        </Button>
      </Box>
      <Card
        className='mt-3'
        component={'form'}
        onSubmit={handleSubmit(onFinish)}
        sx={{ display: 'flex', flexDirection: 'column' }}
      >
        <CardContent>
          <Box component={'div'} className='grid grid-cols-1 md:grid-cols-3 gap-x-5 mb-3 mt-2 gap-y-3'>
            <CustomDropDown
              name={'serviceType'}
              control={control}
              label='Service Type'
              error={errors.serviceType}
              optionList={
                serviceTypes?.map((item: any) => {
                  return {
                    key: `${item?.id}`,
                    value: item?.id,
                    optionString: item?.service
                      ? `${item?.service?.name}-${item?.service?.procedureCode}`
                      : `${item.serviceAuthService.name}-${item.serviceAuthService.procedureCode}`
                  }
                }) || []
              }
              isRequired={false}
              loading={loading}
            />
            <CustomDropDown
              name={'qpAssigned'}
              control={control}
              label={'Employee (QP)'}
              error={errors.qpAssigned}
              optionList={
                qpsList?.map((item: any) => {
                  return {
                    key: `${item?.id}-${item.firstName}`,
                    value: item?.id,
                    optionString: `${item.firstName} ${item.lastName}`
                  }
                }) || []
              }
              isRequired={false}
              loading={loading}
            />
            <CustomDropDown
              name={'serviceAuth'}
              control={control}
              label={'Service Auth'}
              error={errors.serviceAuth}
              optionList={
                serviceAuthList.map(item => {
                  return {
                    key: `${item?.id}`,
                    value: item?.id,
                    optionString: `${item?.procedureCode}, ${item?.modifierCode} (${formatDate(item?.startDate)}-${formatDate(item?.endDate)})`
                  }
                }) || []
              }
              isRequired={false}
            // loading={loading}
            />
            <AppReactDatepicker
              {...register('dueDate', { required: false })}
              selected={watch('dueDate')}
              onChange={date => {
                console.log('Date:', date)
                setValue('dueDate', date)
              }}
              placeholderText='MM/DD/YYYY'
              customInput={
                <TextField fullWidth size='small' name='dueDate' label='Due Date' placeholder='MM/DD/YYYY' />
              }
            />
            <AppReactDatepicker
              {...register('lastCompletedDate', { required: false })}
              selected={watch('lastCompletedDate')}
              onChange={date => {
                console.log('Date:', date)
                setValue('lastCompletedDate', date)
              }}
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
            <CustomDropDown
              name={'frequency'}
              control={control}
              label={'Frequency'}
              error={errors.frequency}
              optionList={frequencyOptions}
              isRequired={false}
            />
            <CustomDropDown
              name={'rehabPotential'}
              control={control}
              label={'Rehab Potential'}
              error={errors.rehabPotential}
              optionList={rehabPotentialOptions}
              isRequired={false}
            />
            <TextField
              {...register('otherTasks', { required: false })}
              label={'List Other Tasks'}
              placeholder={'Enter Other Tasks'}
              name={'otherTasks'}
              defaultValue={''}
              type={'text'}
              size='small'
              fullWidth
              multiline
              rows={3}
            />

            <TextField
              {...register('dischargePlans', { required: false })}
              label={'Discharge Plans'}
              placeholder={'Enter Discharge Plans'}
              name={'dischargePlans'}
              defaultValue={''}
              type={'text'}
              size='small'
              fullWidth
              multiline
              rows={3}
            />
          </Box>
          <DropdownWithChips label='Services' control={control} name={'serviceActivities'} activities={activities} />

          {selectedActivities.length > 0 && (
            <Box mt={3}>
              <Typography variant='h6' gutterBottom>
                Service Description
              </Typography>

              {selectedActivities.map((activityId: number) => {
                const activity = activities.find(act => act.id === activityId)
                return (
                  <Box
                    key={activityId}
                    mb={3}
                    p={2}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                      gap: 2
                    }}
                  >
                    <Typography variant='subtitle1' sx={{ gridColumn: '1 / -1' }}>
                      {activity?.title}
                    </Typography>

                    {/* Notes Field - Takes 2/3 of space (8 units in 12-unit grid) */}
                    <Box sx={{ gridColumn: { xs: '1 / -1', md: '1 / 2' } }}>
                      <Controller
                        name={`notes.${activityId}.note`}
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label='Notes' placeholder='Enter notes' fullWidth multiline rows={3} />
                        )}
                      />
                    </Box>

                    {/* Assistance Level - Takes 1/3 of space (4 units in 12-unit grid) */}
                    <Box sx={{ gridColumn: { xs: '1 / -1', md: '2 / 3' } }}>
                      <Controller
                        name={`notes.${activityId}.assistanceLevel`}
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth size='small'>
                            <InputLabel>Assistance Level</InputLabel>
                            <Select
                              {...field}
                              label='Assistance Level'
                              sx={{ height: '100%', minHeight: '56px' }} // Match height with notes field
                            >
                              {assistanceLevelOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>Select the required assistance level</FormHelperText>
                          </FormControl>
                        )}
                      />
                    </Box>
                  </Box>
                )
              })}
            </Box>
          )}
        </CardContent>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 5, gap: 2, mb: 3 }}>
          {/* <Button variant='outlined' onClick={handleCancel} disabled={submitting}>
          Cancel
        </Button> */}
          <Button
            variant='contained'
            type='submit'
            disabled={submitting}
            endIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </Card>
    </>
  )
}

export default CarePlan

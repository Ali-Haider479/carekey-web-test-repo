'use client'
import api from '@/utils/api'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  IconButton,
  Grid2 as Grid,
  Button,
  CircularProgress
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { useParams } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import { useForm, FormProvider, Controller, useFieldArray, useWatch } from 'react-hook-form'

type ServiceType = {
  id: string
  name: string
  note?: string
}

type ActivityType = {
  id: string
  serviceId: string
  title: string
}

type FormValues = {
  services: {
    id?: string // ClientServiceJoin ID
    service: string // Service ID
    serviceNotes: string
    serviceActivities: string[]
  }[]
}

const CareplanTab = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState<boolean>(false)
  const [clientServices, setClientServices] = useState<ServiceType[]>([])
  const [servicesResponse, setServicesResponse] = useState<any>([])
  const [servicesActivities, setServicesActivities] = useState<ActivityType[]>([])
  const [openSelect, setOpenSelect] = useState<{ [key: string]: boolean }>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saveChangesButtonLoading, setSaveChangesButtonLoading] = useState<boolean>(false)
  const prevServiceIdsRef = useRef<string[]>([]) // Tracks service IDs (cs.service.id)
  const prevClientServiceIdsRef = useRef<string[]>([]) // Tracks ClientServiceJoin IDs (cs.id)
  const prevSelectedServiceIdsRef = useRef<string[]>([])

  const methods = useForm<FormValues>({
    defaultValues: {
      services: []
    }
  })

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = methods
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services'
  })

  const watchedServices = useWatch({
    control,
    name: 'services',
    defaultValue: fields
  })

  const fetchClient = async () => {
    setLoading(true)
    try {
      const [servicesResponse, activitiesResponse, allServicesResponse] = await Promise.all([
        api.get(`/client/client-services-activities/${id}`),
        api.get(`/activity`),
        api.get(`/service`)
      ])
      setServicesResponse(servicesResponse)
      const clientData = servicesResponse.data[0]
      console.log('NEW CLIENT DATA', clientData)

      const servicesData = allServicesResponse.data.map((svc: any) => ({
        id: svc.id.toString(),
        name: svc.name,
        note: clientData.clientServices.find((cs: any) => cs.service.id === svc.id)?.note || ''
      }))

      const activitiesData = activitiesResponse.data.map((act: any) => ({
        id: act.id.toString(),
        serviceId: act.service.id.toString(),
        title: act.title
      }))

      setClientServices(servicesData)
      setServicesActivities(activitiesData)

      const serviceActivityIds = clientData.serviceActivityIds || []
      const formServices = clientData.clientServices.map((cs: any) => ({
        id: cs.id.toString(), // ClientServiceJoin ID
        service: cs.service.id.toString(), // Service ID
        serviceNotes: cs.note || '',
        serviceActivities: activitiesData
          .filter(
            (act: ActivityType) =>
              act.serviceId === cs.service.id.toString() && serviceActivityIds.includes(Number(act.id))
          )
          .map((act: ActivityType) => act.id)
      }))

      console.log('NEW FORM SERVICES', formServices)
      prevServiceIdsRef.current = formServices.map((svc: any) => svc.service)
      prevClientServiceIdsRef.current = formServices.map((svc: any) => svc.id)
      prevSelectedServiceIdsRef.current = formServices.map((svc: any) => svc.service)
      console.log('INITIAL PREV SERVICE IDS', prevServiceIdsRef.current)
      console.log('INITIAL PREV CLIENT SERVICE IDS', prevClientServiceIdsRef.current)

      reset({
        services: formServices.length > 0 ? formServices : [{ service: '', serviceNotes: '', serviceActivities: [] }]
      })
    } catch (error) {
      console.error('Error fetching client data:', error)
      setErrorMessage('Failed to fetch client data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fields.forEach((_, index) => {
      const selectedServiceId = watchedServices[index]?.service || ''
      const prevSelectedServiceId = prevSelectedServiceIdsRef.current[index] || ''

      if (selectedServiceId && selectedServiceId !== prevSelectedServiceId) {
        const serviceActivityIds = servicesResponse?.data[0]?.serviceActivityIds || []
        const availableActivities = servicesActivities.filter(act => act.serviceId === selectedServiceId)
        const updatedActivities = availableActivities
          .filter(act => serviceActivityIds.includes(Number(act.id)))
          .map(act => act.id)

        const currentActivities = watchedServices[index]?.serviceActivities || []
        if (JSON.stringify(currentActivities) !== JSON.stringify(updatedActivities)) {
          setValue(`services.${index}.serviceActivities`, updatedActivities, {
            shouldValidate: true,
            shouldDirty: true
          })
        }

        prevSelectedServiceIdsRef.current[index] = selectedServiceId
      }
    })
  }, [watchedServices, servicesActivities, setValue, fields])

  useEffect(() => {
    if (fields.length === 0) {
      append({ service: '', serviceNotes: '', serviceActivities: [] })
    }
  }, [append, fields.length])

  useEffect(() => {
    fetchClient()
  }, [id])

  const onSubmit = async (data: FormValues) => {
    setSaveChangesButtonLoading(true)
    try {
      setErrorMessage(null)
      const clientId = Number(id)
      if (isNaN(clientId)) {
        throw new Error('Invalid client ID')
      }

      console.log('PREV SERVICE IDS BEFORE FILTER', prevServiceIdsRef.current)
      console.log('PREV CLIENT SERVICE IDS BEFORE FILTER', prevClientServiceIdsRef.current)
      console.log('SUBMITTED DATA', data.services)

      // Identify new and existing services
      const newServices = data.services.filter(
        item => item.service && !prevClientServiceIdsRef.current.includes(item.id || '')
      )
      const existingServices = data.services.filter(
        item => item.service && item.id && prevClientServiceIdsRef.current.includes(item.id)
      )

      console.log(
        'NEW SERVICES',
        newServices,
        'EXISTING SERVICES',
        existingServices,
        'ALL SERVICES',
        data.services,
        'PREV SERVICE IDS',
        prevServiceIdsRef.current,
        'PREV CLIENT SERVICE IDS',
        prevClientServiceIdsRef.current
      )

      // Create new services
      if (newServices.length > 0) {
        console.log('INSIDE POST CALL', newServices)
        for (const item of newServices) {
          const createClientServiceBody = {
            note: item.serviceNotes || '',
            serviceId: Number(item.service),
            clientId: clientId,
            evvEnforce: true
          }
          await api.post(`/client/client-service`, createClientServiceBody)
        }
      }

      // Update existing services
      if (existingServices.length > 0) {
        console.log('INSIDE UPDATE CALL', existingServices)
        for (const item of existingServices) {
          const updateClientServiceBody = {
            note: item.serviceNotes || '',
            serviceId: Number(item.service),
            clientId: clientId
          }
          await api.put(`/client/client-service/${item.id}`, updateClientServiceBody)
        }
      }

      // Update activities
      const payload = {
        serviceActivityIds: data.services
          .flatMap(svc => svc.serviceActivities)
          .map(Number)
          .filter(num => !isNaN(num))
      }
      console.log('UPDATING ACTIVITIES', payload)
      await api.put(`/client/update-activities/${clientId}`, payload)

      // Refresh data after submission
      fetchClient()
    } catch (error: any) {
      console.error('Error updating services:', error)
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to update services')
    } finally {
      setSaveChangesButtonLoading(false)
    }
  }

  const handleDeleteActivity = (itemToRemove: string, onChange: (items: string[]) => void, selectedArray: string[]) => {
    const newValue = selectedArray.filter(val => val !== itemToRemove)
    onChange(newValue)
  }

  const selectedServiceIds = fields
    .map((field, index) => watchedServices[index]?.service)
    .filter(id => id !== '' && id !== undefined)

  const isAddDisabled = selectedServiceIds.length >= clientServices.length

  const addNewService = () => {
    if (!isAddDisabled) {
      append({ service: '', serviceNotes: '', serviceActivities: [] })
      prevSelectedServiceIdsRef.current.push('')
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent>
            {errorMessage && (
              <Box mb={2}>
                <Typography color='error'>{errorMessage}</Typography>
              </Box>
            )}
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography className='text-xl font-semibold'>Update Services and Activities</Typography>
              <Button startIcon={<AddIcon />} onClick={addNewService} disabled={isAddDisabled} variant='contained'>
                Add Service
              </Button>
            </Box>

            {loading ? (
              <Box
                component={'div'}
                sx={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <>
                {fields.map((field, index) => {
                  const selectedServiceId = watchedServices[index]?.service || ''
                  const availableActivities = servicesActivities.filter(act => act.serviceId === selectedServiceId)

                  return (
                    <React.Fragment key={field.id}>
                      <Box mb={4} p={2} borderRadius={2}>
                        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                          <Typography className='text-xl font-semibold'>Service Name</Typography>
                        </Box>

                        <Grid container spacing={5}>
                          <Grid size={{ xs: 12 }}>
                            <Controller
                              name={`services.${index}.service`}
                              control={control}
                              rules={{ required: 'Service is required' }}
                              render={({ field }) => (
                                <FormControl fullWidth error={!!errors.services?.[index]?.service}>
                                  <InputLabel size='small'>Select Service</InputLabel>
                                  <Select
                                    {...field}
                                    label='Select Service'
                                    size='small'
                                    value={field.value || ''}
                                    onChange={e => field.onChange(e.target.value)}
                                  >
                                    {clientServices.map(item => (
                                      <MenuItem
                                        key={`${item.id}-${item.name}`}
                                        value={item.id}
                                        disabled={selectedServiceIds.includes(item.id) && item.id !== field.value}
                                      >
                                        {item.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  {errors.services?.[index]?.service && (
                                    <FormHelperText>{errors.services[index]?.service?.message}</FormHelperText>
                                  )}
                                </FormControl>
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Controller
                              name={`services.${index}.serviceNotes`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label='Service Notes'
                                  placeholder='Service Notes'
                                  type='text'
                                  size='small'
                                  fullWidth
                                />
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Typography className='text-xl font-semibold mb-4'>Service Activities</Typography>
                            <Controller
                              name={`services.${index}.serviceActivities`}
                              control={control}
                              rules={{ required: 'At least one activity is required' }}
                              render={({ field: { value = [], onChange, ...field } }) => (
                                <FormControl fullWidth error={!!errors.services?.[index]?.serviceActivities}>
                                  <InputLabel size='small'>Select Activities</InputLabel>
                                  <Select
                                    {...field}
                                    multiple
                                    renderValue={() => ''}
                                    value={Array.isArray(value) ? value : []}
                                    label='Select Activities'
                                    size='small'
                                    onChange={e => onChange(e.target.value as string[])}
                                    open={openSelect[`${index}`] || false}
                                    onOpen={() => setOpenSelect(prev => ({ ...prev, [`${index}`]: true }))}
                                    onClose={() => setOpenSelect(prev => ({ ...prev, [`${index}`]: false }))}
                                  >
                                    {availableActivities.map(svc => (
                                      <MenuItem key={svc.id} value={svc.id}>
                                        {svc.title}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  {errors.services?.[index]?.serviceActivities && (
                                    <FormHelperText>
                                      {errors.services[index]?.serviceActivities?.message}
                                    </FormHelperText>
                                  )}
                                  <Box className='flex flex-wrap gap-2 mt-2'>
                                    {Array.isArray(value) &&
                                      value.map(itemId => {
                                        const selectedActivity = servicesActivities.find(s => s.id === itemId)
                                        return (
                                          <Chip
                                            key={itemId}
                                            label={selectedActivity?.title}
                                            onDelete={() => handleDeleteActivity(itemId, onChange, value)}
                                            deleteIcon={
                                              <CloseIcon className='text-sm text-[#8592A3] border-2 rounded' />
                                            }
                                            className='mt-2 text-[#8592A3] text-sm py-1'
                                            aria-label={`Remove ${selectedActivity?.title}`}
                                          />
                                        )
                                      })}
                                  </Box>
                                </FormControl>
                              )}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                      <Box className='w-full border-t border-[#4d4d4e] my-4' />
                    </React.Fragment>
                  )
                })}
              </>
            )}
          </CardContent>
          <Box display='flex' justifyContent='flex-end' p={2}>
            <Button
              startIcon={saveChangesButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
              disabled={saveChangesButtonLoading || loading}
              type='submit'
              variant='contained'
              color='primary'
              className='mr-4 mb-2'
            >
              Save Changes
            </Button>
          </Box>
        </Card>
      </form>
    </FormProvider>
  )
}

export default CareplanTab

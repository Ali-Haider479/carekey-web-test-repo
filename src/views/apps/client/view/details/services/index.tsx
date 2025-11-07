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
  CircularProgress,
  FormLabel,
  Checkbox,
  Autocomplete
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { useParams } from 'next/navigation'
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { useForm, FormProvider, Controller, useFieldArray, useWatch } from 'react-hook-form'
import { Delete } from '@mui/icons-material'
import CustomAlert from '@/@core/components/mui/Alter'

type ServiceType = {
  id: string
  name: string
  note?: string
  procedureCode?: string
  modifierCode?: string
  dummyService?: boolean
}

type ActivityType = {
  id: string
  serviceId: string | null
  title: string
  procedureCode: string
  modifierCode: string
}

type FormValues = {
  services: {
    id?: string // ClientServiceJoin ID
    service: string // Service ID or ServiceAuthService ID
    serviceNotes: string
    serviceActivities: string[]
    customActivities: boolean
    customActivitiesTextField: string
  }[]
}

const CareplanTab = () => {
  const { id } = useParams()
  const itemsPerPage = 50
  const [displayedServices, setDisplayedServices] = useState<ServiceType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const listboxRef = useRef<HTMLUListElement | null>(null) as React.MutableRefObject<HTMLUListElement | null>
  const [clientServices, setClientServices] = useState<ServiceType[]>([])
  const [servicesResponse, setServicesResponse] = useState<any>([])
  const [servicesActivities, setServicesActivities] = useState<ActivityType[]>([])
  const [openSelect, setOpenSelect] = useState<{ [key: string]: boolean }>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saveChangesButtonLoading, setSaveChangesButtonLoading] = useState<boolean>(false)
  const [customActivityButtonLoading, setCustomActivityButtonLoading] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()
  const prevServiceIdsRef = useRef<string[]>([]) // Tracks service IDs (cs.service.id or cs.serviceAuthService.id)
  const prevClientServiceIdsRef = useRef<string[]>([]) // Tracks ClientServiceJoin IDs (cs.id)
  const prevSelectedServiceIdsRef = useRef<string[]>([])

  const [isDataLoading, setIsDataLoading] = useState(false)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

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
    register,
    watch,
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

  const handleEnableChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(`services.${index}.customActivities`, event.target.checked)
  }

  const handleAddCustomActivity = async (index: number, value: string) => {
    setCustomActivityButtonLoading(true)
    if (!value.trim()) {
      setErrorMessage('Custom activity name cannot be empty')
      setCustomActivityButtonLoading(false)
      return
    }

    const selectedServiceId = watchedServices[index]?.service || ''
    const selectedService = clientServices.find(svc => svc.id === selectedServiceId)
    const isDummyService = selectedService?.dummyService ?? true

    console.log('Selected Service ----->> ', selectedService)

    try {
      const response = await api.post('/activity', {
        title: value.trim(),
        procedureCode: selectedService?.procedureCode,
        modifierCode: selectedService?.modifierCode || null,
        serviceId: isDummyService ? Number(selectedServiceId) || null : null
      })
      const accountHistoryPayLoad = {
        actionType: 'Custom Activity Added',
        details: `Custom Activity is added for Client (ID: ${id}) under (Activity ID: ${response.data.id.toString()})  by User (ID: ${authUser?.id})`,
        userId: authUser?.id,
        clientId: id
      }
      await api.post(`/account-history/log`, accountHistoryPayLoad)
      const newActivity: ActivityType = {
        id: response.data.id.toString(),
        title: response.data.title,
        procedureCode: response.data.procedureCode,
        modifierCode: response.data.modifierCode || null,
        serviceId: response.data.service ? response.data.service.id.toString() : null
      }
      // Update servicesActivities
      setServicesActivities(prev => {
        // Prevent duplicates
        if (prev.some(act => act.id === newActivity.id)) {
          return prev
        }
        return [...prev, newActivity]
      })
      // Add new activity to serviceActivities
      const currentActivities = watchedServices[index]?.serviceActivities || []
      if (currentActivities.length === 20) {
        setErrorMessage('You can only add up to 20 activities per service.')
        setValue(`services.${index}.customActivities`, false)
        setCustomActivityButtonLoading(false)
        return
      }
      if (!currentActivities.includes(newActivity.id)) {
        setValue(`services.${index}.serviceActivities`, [...currentActivities, newActivity.id], {
          shouldValidate: true,
          shouldDirty: true
        })
      }
      // Clear the text field
      setValue(`services.${index}.customActivitiesTextField`, '', {
        shouldValidate: true,
        shouldDirty: true
      })
      setValue(`services.${index}.customActivities`, false)
      setCustomActivityButtonLoading(false)
      setErrorMessage(null)
    } catch (error: any) {
      console.error('Error creating custom activity:', error)
      setErrorMessage(error.response?.data?.message || 'Failed to create custom activity')
    } finally {
      setCustomActivityButtonLoading(false)
    }
  }

  const fetchClient = async () => {
    setIsDataLoading(true)
    try {
      const [servicesResponse, activitiesResponse, allServicesResponse, serviceAuthServicesResponse] =
        await Promise.all([
          api.get(`/client/client-services-activities/${id}`),
          api.get(`/activity`),
          api.get(`/service/tenant/${authUser?.tenant?.id}`),
          api.get(`/service/service-auth/services`)
        ])
      console.log('Services response ---->> ', servicesResponse)
      const filteredServices = servicesResponse.data[0].clientServices.filter((item: any) => item.service !== null)
      const filteredServiceAuthServices = servicesResponse.data[0].clientServices.filter(
        (item: any) => item.serviceAuthService !== null
      )
      setServicesResponse(servicesResponse)
      const clientData = servicesResponse.data[0]
      console.log('NEW CLIENT DATA', clientData)

      // Combine filtered services and service auth services
      const validClientServices = [...filteredServices, ...filteredServiceAuthServices]

      console.log('Valid Client Services ----->> ', validClientServices)

      // Map services from /service
      const servicesData = allServicesResponse.data.map((svc: any) => ({
        id: svc.id.toString(),
        name: svc.name,
        note: validClientServices.find((cs: any) => cs.service?.id === svc.id)?.note || '',
        procedureCode: svc.procedureCode || '',
        modifierCode: svc.modifierCode || null,
        dummyService: true
      }))

      const serviceAuthServicesData = serviceAuthServicesResponse.data.map((svc: any) => ({
        id: svc.id.toString(),
        name: svc.name,
        note: validClientServices.find((cs: any) => cs.serviceAuthService?.id === svc.id)?.note || '',
        procedureCode: svc.procedureCode || '',
        modifierCode: svc.modifierCode || null,
        dummyService: false
      }))

      // Map valid client services, ensuring correct id (Service or ServiceAuthService ID)
      const validServicesData = validClientServices.map((item: any) => ({
        id: item.service?.id?.toString() || item.serviceAuthService?.id?.toString(),
        name: item.service?.name || item.serviceAuthService?.name,
        note: item.note || '',
        procedureCode:
          item?.service !== null ? item.service?.procedureCode : item.serviceAuthService?.procedureCode || '',
        modifierCode:
          item?.service !== null ? item.service?.modifierCode : item.serviceAuthService?.modifierCode || null,
        dummyService: item?.service !== null ? true : false
      }))

      // Combine and deduplicate services
      const combinedServices = [...servicesData, ...serviceAuthServicesData, ...validServicesData]
      const uniqueServices = Array.from(new Map(combinedServices.map(svc => [svc.id, svc])).values()) as ServiceType[]

      console.log('Combined Services ----->> ', combinedServices)
      console.log('Unique Services ---->> ', uniqueServices)

      setClientServices(uniqueServices)

      console.log('Activities response ---->> ', activitiesResponse.data)

      // Map all activities without filtering by service
      const allActivities = activitiesResponse.data.map((act: any) => ({
        id: act.id.toString(),
        serviceId: act.service ? act.service.id.toString() : null,
        title: act.title,
        procedureCode: act.procedureCode || '',
        modifierCode: act.modifierCode || null
      })) as ActivityType[]

      console.log('All Activities ---->> ', allActivities)

      setServicesActivities(allActivities)

      const serviceActivityIds = clientData.serviceActivityIds || []
      const formServices = validClientServices.map((cs: any) => {
        const serviceProcedureCode = cs.service?.procedureCode || cs.serviceAuthService?.procedureCode || ''
        const serviceModifierCode = cs.service?.modifierCode || cs.serviceAuthService?.modifierCode || null
        return {
          id: cs.id.toString(), // ClientServiceJoin ID
          service: cs.service?.id?.toString() || cs.serviceAuthService?.id?.toString(), // Service ID or ServiceAuthService ID
          serviceNotes: cs.note || '',
          serviceActivities: allActivities
            .filter(
              (act: ActivityType) =>
                act.procedureCode === serviceProcedureCode &&
                act.modifierCode === serviceModifierCode &&
                serviceActivityIds.includes(Number(act.id))
            )
            .map((act: ActivityType) => act.id),
          customActivities: false,
          customActivitiesTextField: ''
        }
      })

      console.log('NEW FORM SERVICES', formServices)
      prevServiceIdsRef.current = formServices.map((svc: any) => svc.service)
      prevClientServiceIdsRef.current = formServices.map((svc: any) => svc.id)
      prevSelectedServiceIdsRef.current = formServices.map((svc: any) => svc.service)
      console.log('INITIAL PREV SERVICE IDS', prevServiceIdsRef.current)
      console.log('INITIAL PREV CLIENT SERVICE IDS', prevClientServiceIdsRef.current)

      reset({
        services:
          formServices.length > 0
            ? formServices
            : [
                {
                  service: '',
                  serviceNotes: '',
                  serviceActivities: [],
                  customActivities: false,
                  customActivitiesTextField: ''
                }
              ]
      })
    } catch (error) {
      console.error('Error fetching client data:', error)
      setErrorMessage('Failed to fetch client data')
    } finally {
      setIsDataLoading(false)
    }
  }

  useEffect(() => {
    fields.forEach((_, index) => {
      const selectedServiceId = watchedServices[index]?.service || ''
      const prevSelectedServiceId = prevSelectedServiceIdsRef.current[index] || ''
      const selectedService = clientServices.find(svc => svc.id === selectedServiceId)
      console.log('Selected Service ---->> ', selectedServiceId, selectedService)
      const isDummyService = selectedService?.dummyService ?? true

      console.log('Service activities --->>', servicesActivities)

      if (selectedServiceId && selectedServiceId !== prevSelectedServiceId) {
        const serviceActivityIds = servicesResponse?.data[0]?.serviceActivityIds || []
        console.log('Service Activity IDs ---->> ', serviceActivityIds)
        const availableActivities = servicesActivities.filter(
          act =>
            act.procedureCode === selectedService?.procedureCode &&
            (act.modifierCode === selectedService?.modifierCode ||
              (act.modifierCode === null && selectedService?.modifierCode === null))
        )
        console.log('Available Activities for Service', selectedServiceId, '---->> ', availableActivities)
        const updatedActivities = availableActivities
          .filter(act => serviceActivityIds.includes(Number(act.id)))
          .map(act => act.id)

        console.log('Updated Activities for Service', selectedServiceId, '---->> ', updatedActivities)

        const currentActivities = watchedServices[index]?.serviceActivities || []
        console.log('Current activities for Service', selectedServiceId, '---->> ', currentActivities)
        if (JSON.stringify(currentActivities) !== JSON.stringify(updatedActivities)) {
          setValue(
            `services.${index}.serviceActivities`,
            updatedActivities
            //   {
            //   shouldValidate: true,
            //   shouldDirty: true
            // }
          )
        }

        prevSelectedServiceIdsRef.current[index] = selectedServiceId
      }
    })
  }, [watchedServices, servicesActivities, setValue, fields])

  useEffect(() => {
    if (fields.length === 0) {
      append({
        service: '',
        serviceNotes: '',
        serviceActivities: [],
        customActivities: false,
        customActivitiesTextField: ''
      })
    }
  }, [append, fields.length])

  useEffect(() => {
    fetchClient()
  }, [id])

  useEffect(() => {
    const filtered = clientServices.filter(
      service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.procedureCode && service.procedureCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (service.modifierCode && service.modifierCode.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    setDisplayedServices(filtered.slice(0, itemsPerPage))
    setPage(1)
  }, [searchTerm, clientServices])

  const handleListboxScroll = () => {
    const listbox = listboxRef.current
    if (!listbox) return

    const { scrollTop, scrollHeight, clientHeight } = listbox
    if (scrollTop + clientHeight < scrollHeight - 150) return // not near bottom

    const filtered = clientServices.filter(
      service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.procedureCode && service.procedureCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (service.modifierCode && service.modifierCode.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const nextPage = page + 1
    const start = page * itemsPerPage
    const end = nextPage * itemsPerPage
    const moreItems = filtered.slice(start, end)

    if (moreItems.length > 0) {
      const prevScrollTop = listbox.scrollTop
      const prevItemCount = displayedServices.length

      setDisplayedServices(prev => [...prev, ...moreItems])
      setPage(nextPage)

      // Restore scroll position after items added
      requestAnimationFrame(() => {
        if (listboxRef.current) {
          const addedHeight = moreItems.length * 48 // ~48px per item
          listboxRef.current.scrollTop = prevScrollTop + addedHeight
        }
      })
    }
  }

  const ListboxComponent = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>((props, ref) => {
    const { style, ...other } = props
    return (
      <ul
        {...other}
        key={`listbox-${searchTerm}-${page}`}
        ref={node => {
          listboxRef.current = node
          // Forward ref to MUI
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLUListElement | null>).current = node
        }}
        onScroll={handleListboxScroll}
        style={{
          ...(style as React.CSSProperties),
          maxHeight: 400,
          overflow: 'auto',
          padding: 0,
          margin: 0
        }}
      />
    )
  })

  const onSubmit = async (data: FormValues) => {
    setSaveChangesButtonLoading(true)
    try {
      setErrorMessage(null)
      const clientId = Number(id)
      if (isNaN(clientId)) {
        throw new Error('Invalid client ID')
      }

      const activeTimelogRes = await api.get(`/time-log/active-timelogs`)

      console.log('ACTIVE TIMELOGS FOUND ---->> ', activeTimelogRes.data)
      if (activeTimelogRes.data.length > 0) {
        // Extract clientService.id from active timelogs and convert to string for comparison
        const activeClientServiceIds = activeTimelogRes.data
          .map((log: any) => log.clientService?.id)
          .filter((id: any) => id != null)
          .map(String) // Convert to string to match prevClientServiceIdsRef.current format

        // Check if any of the previous client service IDs are in active timelogs
        const hasConflict = prevClientServiceIdsRef.current.some((id: string) => activeClientServiceIds.includes(id))

        console.log('Conflicting Client Service IDs ---->> ', activeClientServiceIds, hasConflict)

        if (hasConflict) {
          console.log('CANNOT UPDATE SERVICES DUE TO ACTIVE TIMELOGS ---->> ')
          setAlertOpen(true)
          setAlertProps({
            message: 'Cannot update or remove the client services as the client has an ongoing shift.',
            severity: 'error'
          })
          fetchClient()
          return
        }
      }

      console.log('PREV SERVICE IDS BEFORE FILTER', prevServiceIdsRef.current)
      console.log('PREV CLIENT SERVICE IDS BEFORE FILTER', prevClientServiceIdsRef.current)
      console.log('SUBMITTED DATA', data)

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
          console.log('NEW SERVICE TO BE CREATED ---->> ', item)
          const selectedService = clientServices.find(svc => svc.id === item.service)
          const isDummyService = selectedService?.dummyService ?? true

          if (isDummyService) {
            const createClientServiceBody = {
              note: item.serviceNotes || '',
              serviceId: Number(item.service),
              clientId: clientId,
              evvEnforce: true
            }
            console.log('Create client service body (dummyService): ', createClientServiceBody)
            await api.post(`/client/client-service`, createClientServiceBody)
          } else {
            const createClientServiceAuthBody = {
              note: item.serviceNotes || '',
              serviceAuthServiceId: Number(item.service),
              clientId: clientId,
              evvEnforce: true
            }
            console.log('Create client service auth body (non-dummyService): ', createClientServiceAuthBody)
            await api.post(`/client/client-service`, createClientServiceAuthBody)
          }
        }
      }

      // Update existing services
      if (existingServices.length > 0) {
        console.log('INSIDE UPDATE CALL', existingServices)
        for (const item of existingServices) {
          console.log('EXISTING SERVICE TO BE UPDATED ---->> ', item)
          const selectedService = clientServices.find(svc => svc.id === item.service)
          const isDummyService = selectedService?.dummyService ?? true

          if (isDummyService) {
            const updateClientServiceBody = {
              note: item.serviceNotes || '',
              serviceId: Number(item.service),
              clientId: clientId
            }
            console.log('Update client service body (dummyService): ', updateClientServiceBody)
            await api.put(`/client/client-service/${item.id}`, updateClientServiceBody)
          } else {
            const updateClientServiceAuthBody = {
              note: item.serviceNotes || '',
              serviceAuthServiceId: Number(item.service),
              clientId: clientId
            }
            console.log('Update client service auth body (non-dummyService): ', updateClientServiceAuthBody)
            await api.put(`/client/client-service/${item.id}`, updateClientServiceAuthBody)
          }
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
      const response = await api.put(`/client/update-activities/${clientId}`, payload)

      if (response.status === 200) {
        const accountHistoryPayLoad = {
          actionType: 'Client Services are Updated',
          details: `Client Service Updated for Client (ID: ${id}) by User (ID: ${authUser?.id})`,
          userId: authUser?.id,
          clientId: id
        }
        await api.post(`/account-history/log`, accountHistoryPayLoad)
      }

      // Refresh data after submission
      fetchClient()
    } catch (error: any) {
      console.error('Error updating services:', error)
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to update services')
    } finally {
      setLoading(false)
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
      append({
        service: '',
        serviceNotes: '',
        serviceActivities: [],
        customActivities: false,
        customActivitiesTextField: ''
      })
      prevSelectedServiceIdsRef.current.push('')
    }
  }

  return (
    <>
      {isDataLoading ? (
        <Box id='timesheet-content' className='flex justify-center items-center min-h-[250px] w-full'>
          <CircularProgress />
        </Box>
      ) : (
        <FormProvider {...methods}>
          <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
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
                      const selectedService = clientServices.find(svc => svc.id === selectedServiceId)
                      const availableActivities = servicesActivities.filter(
                        act =>
                          act.procedureCode === selectedService?.procedureCode &&
                          (act.modifierCode === selectedService?.modifierCode ||
                            (act.modifierCode === null && selectedService?.modifierCode === null))
                      )
                      const serviceAuthActivities = servicesActivities.filter(
                        act =>
                          act.procedureCode === selectedService?.procedureCode &&
                          (act.modifierCode === selectedService?.modifierCode ||
                            (act.modifierCode === null && selectedService?.modifierCode === null))
                      )
                      const isDummyService = selectedService?.dummyService ?? true
                      const customActivitiesEnabled = watch(`services.${index}.customActivities`)
                      const customActivityField = watch(`services.${index}.customActivitiesTextField`)

                      console.log('Selected Service --->> ', selectedServiceId, selectedService)
                      console.log('Custom Activities Enabled ---->> ', customActivitiesEnabled)

                      return (
                        <React.Fragment key={field.id}>
                          <Box mb={4} p={2} borderRadius={2}>
                            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                              <Typography className='text-xl font-semibold'>Service Name</Typography>
                              {fields.length > 1 && field.service === '' && (
                                <IconButton
                                  color='secondary'
                                  onClick={() => remove(index)}
                                  aria-label={`Remove service ${index + 1}`}
                                >
                                  <Delete />
                                </IconButton>
                              )}
                            </Box>

                            <Grid container spacing={5}>
                              <Grid size={{ xs: 12 }}>
                                <Controller
                                  name={`services.${index}.service`}
                                  control={control}
                                  rules={{ required: 'Service is required' }}
                                  render={({ field }) => (
                                    <Autocomplete
                                      size='small'
                                      options={clientServices}
                                      getOptionLabel={option =>
                                        option
                                          ? `${option?.name} (${option?.procedureCode || 'N/A'} - ${option?.modifierCode || 'N/A'})${option?.dummyService ? ' (Demo Service)' : ' (S.A Service)'}`
                                          : ''
                                      }
                                      getOptionDisabled={option =>
                                        selectedServiceIds.includes(option?.id) && option?.id !== field.value
                                      }
                                      isOptionEqualToValue={(option: any, value) => option?.id === value}
                                      value={clientServices.find(svc => svc?.id === field?.value) || null}
                                      onChange={(_, newValue) => {
                                        field.onChange(newValue?.id || '')
                                      }}
                                      onInputChange={(_, newInputValue) => {
                                        setSearchTerm(newInputValue)
                                      }}
                                      // ListboxComponent={ListboxComponent}
                                      // slotProps={{ listbox: { component: ListboxComponent } }}
                                      renderInput={params => (
                                        <TextField
                                          {...params}
                                          label='Select Service'
                                          error={!!errors.services?.[index]?.service}
                                          helperText={errors.services?.[index]?.service?.message}
                                        />
                                      )}
                                      renderOption={(props, option, { index }) => (
                                        <li {...props} key={`${option?.id}-${option?.name}-${index}`}>
                                          {option?.name} ({option?.procedureCode || 'N/A'} -{' '}
                                          {option?.modifierCode || 'N/A'})
                                          {option?.dummyService ? ' (Demo Service)' : ' (S.A Service)'}
                                        </li>
                                      )}
                                      noOptionsText={
                                        searchTerm === ''
                                          ? 'Type to search services...'
                                          : displayedServices.length === 0
                                            ? 'No services found'
                                            : 'Scroll down to load more...'
                                      }
                                    />
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
                                <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                                  <Typography className='text-xl font-semibold'>Service Activities</Typography>
                                  <Box display='flex' alignItems='center'>
                                    <FormLabel disabled={!watch(`services.${index}.service`)}>
                                      Custom Activities
                                    </FormLabel>
                                    <Checkbox
                                      {...register(`services.${index}.customActivities`)}
                                      checked={customActivitiesEnabled}
                                      onChange={(event: any) => handleEnableChange(index, event)}
                                      disabled={!watch(`services.${index}.service`)}
                                    />
                                  </Box>
                                </Box>
                                {customActivitiesEnabled && (
                                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                    <Controller
                                      name={`services.${index}.customActivitiesTextField`}
                                      control={control}
                                      rules={{
                                        required: customActivitiesEnabled ? 'Custom activity name is required' : false
                                      }}
                                      render={({ field }) => (
                                        <TextField
                                          {...field}
                                          label='Activity Name'
                                          placeholder='Activity Name'
                                          type='text'
                                          size='small'
                                          fullWidth
                                          error={!!errors.services?.[index]?.customActivitiesTextField}
                                          helperText={errors.services?.[index]?.customActivitiesTextField?.message}
                                        />
                                      )}
                                    />
                                    <Button
                                      startIcon={
                                        customActivityButtonLoading ? (
                                          <CircularProgress size={20} color='inherit' />
                                        ) : (
                                          <AddIcon />
                                        )
                                      }
                                      disabled={customActivityButtonLoading || !customActivityField}
                                      onClick={() => handleAddCustomActivity(index, customActivityField)}
                                      variant='contained'
                                      sx={{ mb: 2 }}
                                    >
                                      Add
                                    </Button>
                                  </Box>
                                )}
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
                                        {(isDummyService ? availableActivities : serviceAuthActivities).map(svc => (
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
                                            const activitySet = isDummyService
                                              ? availableActivities
                                              : serviceAuthActivities
                                            const selectedActivity = activitySet.find(s => s.id === itemId)
                                            return (
                                              selectedActivity && (
                                                <Chip
                                                  key={itemId}
                                                  label={selectedActivity.title}
                                                  onDelete={() => handleDeleteActivity(itemId, onChange, value)}
                                                  deleteIcon={
                                                    <CloseIcon className='text-sm text-[#8592A3] border-2 rounded' />
                                                  }
                                                  className='mt-2 text-[#8592A3] text-sm py-1'
                                                  aria-label={`Remove ${selectedActivity.title}`}
                                                />
                                              )
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
      )}
    </>
  )
}

export default CareplanTab

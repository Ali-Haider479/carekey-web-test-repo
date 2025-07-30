import React, { useEffect, useState } from 'react'
import { Controller, FieldErrors, useFieldArray, Control } from 'react-hook-form'
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
  Button
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'

type ServiceType = {
  id: string
  name: string
  procedureCode?: string
  modifierCode?: string
}

type ActivityType = {
  id: string
  serviceId: string
  title: string
}

type FormValues = {
  services: {
    service: string
    serviceNotes: string
    serviceActivities: string[]
  }[]
}

type Props = {
  control: any
  errors: FieldErrors<FormValues>
  serviceTypes: ServiceType[]
  activities: ActivityType[]
  isUpdate?: boolean
}

const handleDeleteActivity = (itemToRemove: string, onChange: (items: string[]) => void, selectedArray: string[]) => {
  const newValue = selectedArray.filter(val => val !== itemToRemove)
  onChange(newValue)
}

const ServiceAndActivities = ({ control, errors, serviceTypes, activities, isUpdate = false }: Props) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services'
  })
  const [openSelect, setOpenSelect] = useState<{ [key: string]: boolean }>({})

  // Initialize with one section on mount
  // useEffect(() => {
  //   if (fields.length === 0) {
  //     append({ service: '', serviceNotes: '', serviceActivities: [] })
  //   }
  // }, [append])

  // Get currently selected service IDs
  const selectedServiceIds = fields
    .map((field, index) => control._getWatch(`services.${index}.service`))
    .filter(id => id !== '')

  // Disable add button if no services are available
  const isAddDisabled = selectedServiceIds.length >= serviceTypes.length

  const addNewService = () => {
    if (!isAddDisabled) {
      append({ service: '', serviceNotes: '', serviceActivities: [] })
    }
  }

  return (
    <Card className='mt-3'>
      <CardContent>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Typography className='text-xl font-semibold'>
            {isUpdate ? 'Update Services and Activities' : 'Services and Activities'}
          </Typography>
          {/* <IconButton color='success' onClick={addNewService} aria-label='Add new service' disabled={isAddDisabled}>
            <AddIcon />
          </IconButton> */}
          <Button startIcon={<AddIcon />} onClick={addNewService} variant='contained'>
            Add Service
          </Button>
        </Box>

        {fields.map((field, index) => (
          <React.Fragment key={field.id}>
            <Box mb={4} p={2} borderRadius={2}>
              <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography className='text-xl font-semibold'>Service Name</Typography>
                {fields.length > 1 && (
                  <IconButton
                    color='secondary'
                    onClick={() => remove(index)}
                    aria-label={`Remove service ${index + 1}`}
                  >
                    <DeleteIcon />
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
                      <FormControl fullWidth error={!!errors.services?.[index]?.service}>
                        <InputLabel size='small'>Select Service</InputLabel>
                        <Select
                          {...field}
                          label='Select Service'
                          size='small'
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value)}
                        >
                          {serviceTypes.map(item => (
                            <MenuItem
                              key={`${item.id}-${item.name}`}
                              value={item.id}
                              // Disable if selected in another section
                              disabled={item.id !== field.value && selectedServiceIds.includes(item.id)}
                            >
                              {item.name} {item?.procedureCode} {item?.modifierCode ? '-' : ''} {item?.modifierCode}
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
                        // multiline
                        // rows={4}
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
                          {activities
                            .filter(act => act.serviceId === control._getWatch(`services.${index}.service`))
                            .map(svc => (
                              <MenuItem key={svc.id} value={svc.id}>
                                {svc.title}
                              </MenuItem>
                            ))}
                        </Select>
                        {errors.services?.[index]?.serviceActivities && (
                          <FormHelperText>{errors.services[index]?.serviceActivities?.message}</FormHelperText>
                        )}
                        <Box className='flex flex-wrap gap-2 mt-2'>
                          {Array.isArray(value) &&
                            value.map(itemId => {
                              const selectedActivity = activities.find(s => s.id === itemId)
                              return (
                                <Chip
                                  key={itemId}
                                  label={selectedActivity?.title}
                                  onDelete={() => handleDeleteActivity(itemId, onChange, value)}
                                  deleteIcon={<CloseIcon className='text-sm text-[#8592A3] border-2 rounded' />}
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
        ))}
      </CardContent>
    </Card>
  )
}

export default ServiceAndActivities

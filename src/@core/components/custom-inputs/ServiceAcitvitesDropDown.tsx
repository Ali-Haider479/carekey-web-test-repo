'use client' // <-- If using Next.js App Router

import React from 'react'
import { Controller, FieldError, FieldErrors } from 'react-hook-form'
import { Box, FormControl, InputLabel, Select, MenuItem, FormHelperText, Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

type Props = {
  name: string
  control: any
  defaultValue?: string[]
  label: string
  error?: FieldError | FieldErrors
  activities: { id: string; serviceId: string; title: string }[]
}

const handleDelete = (itemToRemove: string, onChange: (items: string[]) => void, selectedArray: string[]) => {
  const newValue = selectedArray.filter(val => val !== itemToRemove)
  onChange(newValue)
}

const ServiceActivities = ({ name, control, defaultValue, label, error, activities }: Props) => {
  return (
    <Box className='w-full pb-4'>
      <Controller
        name={name}
        control={control}
        defaultValue={''}
        rules={{ required: `${label} is required` }}
        render={({ field: { value = [], onChange, ...field } }) => (
          <FormControl fullWidth error={!!error} className='relative'>
            <InputLabel size='small'>{label}</InputLabel>
            <Select
              {...field}
              multiple
              renderValue={() => ''}
              value={Array.isArray(value) ? value : []} // ensure it's an array
              label={label}
              size='small'
              onChange={e => onChange(e.target.value as string[])}
            >
              {activities.map(svc => (
                <MenuItem key={svc.id} value={svc.title}>
                  {svc.title}
                </MenuItem>
              ))}
            </Select>

            {/* Show error text if there's a validation error */}
            {error && <FormHelperText>{`Please select a ${label}`}</FormHelperText>}

            <Box className='flex flex-wrap gap-2 mt-2'>
              {Array.isArray(value) &&
                value.map(item => {
                  const selectedActivity = activities.find(s => s.title === item)
                  return (
                    <Chip
                      key={item}
                      label={selectedActivity?.title}
                      onDelete={() => handleDelete(item, onChange, value)}
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
    </Box>
  )
}

export default ServiceActivities

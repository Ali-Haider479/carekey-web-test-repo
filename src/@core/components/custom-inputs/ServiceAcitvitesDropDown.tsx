'use client' // <-- If using Next.js App Router

import React from 'react'
import { Select, MenuItem, Chip, Box, FormControl, InputLabel, FormHelperText } from '@mui/material'
import { Controller } from 'react-hook-form'
import { Close as CloseIcon } from '@mui/icons-material'

// Props for the component
type Props = {
  name: string
  control: any // from react-hook-form
  defaultValue?: any
  label: string
  error?: any // field error
}

// Example list of available services
const services = [
  { key: 'hm', value: 'hm', optionString: 'HM' },
  { key: 'bathing', value: 'bathing', optionString: 'BATHING' },
  { key: 'cooking', value: 'cooking', optionString: 'COOKING' },
  {
    key: 'pca-supervisor',
    value: 'pca-supervisor',
    optionString: 'PCA SUPERVISOR'
  },
  {
    key: 'respite-in-home-15',
    value: 'respite-in-home-15',
    optionString: 'RESPITE-IN HOME (15 MIN)'
  },
  { key: 'ihfs', value: 'ihfs', optionString: 'IHFS' },
  {
    key: 'respite-in-home-daily',
    value: 'respite-in-home-daily',
    optionString: 'RESPITE-IN HOME (DAILY)'
  },
  {
    key: 'respite-out-home-15',
    value: 'respite-out-home-15',
    optionString: 'RESPITE-OUT HOME (15 MIN)'
  },
  {
    key: 'icls-in-person',
    value: 'icls-in-person',
    optionString: 'ICLS - IN PERSON'
  },
  { key: 'icls-remote', value: 'icls-remote', optionString: 'ICLS REMOTE' },
  {
    key: 'personal-support',
    value: 'personal-support',
    optionString: 'PERSONAL SUPPORT'
  }
]

// Helper function to remove a specific item from the array
const handleDelete = (itemToRemove: string, onChange: (items: string[]) => void, selectedArray: string[]) => {
  const newValue = selectedArray.filter(val => val !== itemToRemove)
  onChange(newValue)
}

const ServiceActivities = ({ name, control, defaultValue, label, error }: Props) => {
  return (
    <Box className='w-full pb-4'>
      <Controller
        name={name}
        control={control}
        // Make sure the default is an array (otherwise value.map can break)
        defaultValue={defaultValue ?? []}
        // Basic required rule
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
              // MUI <Select multiple> sends an array in e.target.value
              onChange={e => onChange(e.target.value as string[])}
            >
              {services.map(svc => (
                <MenuItem key={svc.key} value={svc.value}>
                  {svc.optionString}
                </MenuItem>
              ))}
            </Select>

            {/* Show error text if there's a validation error */}
            {error && <FormHelperText>{`Please select a ${label}`}</FormHelperText>}

            {/* Render chips BELOW the select */}
            <Box className='flex flex-wrap gap-2 mt-2'>
              {Array.isArray(value) &&
                value.map(item => {
                  const service = services.find(s => s.value === item)
                  return (
                    <Chip
                      key={item}
                      label={service?.optionString}
                      onDelete={() => handleDelete(item, onChange, value)}
                      deleteIcon={<CloseIcon className='text-sm text-[#8592A3] border-2 rounded' />}
                      className=' mt-2 text-[#8592A3] text-sm py-1'
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

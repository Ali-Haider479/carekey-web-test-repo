'use client' // <-- If using Next.js App Router

import React, { useState } from 'react'
import { Controller, FieldError, FieldErrors } from 'react-hook-form'
import { Box, FormControl, InputLabel, Select, MenuItem, FormHelperText, Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

type Props = {
  name: string
  control: any
  defaultValue?: string[]
  label: string
  error?: FieldError | FieldErrors
  isRequired?: boolean
  activities: { id: string; serviceId: string; title: string }[]
}

const handleDelete = (itemToRemove: string, onChange: (items: string[]) => void, selectedArray: string[]) => {
  const newValue = selectedArray.filter(val => val !== itemToRemove)
  onChange(newValue)
}

const ServiceActivities = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  const { isRequired = true } = props

  return (
    <Box className='w-full pb-4'>
      <Controller
        name={props.name}
        control={props.control}
        defaultValue={''}
        rules={{ required: isRequired ? `${props.label} is required` : false }}
        render={({ field: { value = [], onChange, ...field } }) => (
          <FormControl fullWidth error={!!props.error} className='relative'>
            <InputLabel size='small'>{props.label}</InputLabel>
            <Select
              {...field}
              multiple
              renderValue={() => ''}
              value={Array.isArray(value) ? value : []} // ensure it's an array
              label={props.label}
              size='small'
              onChange={e => {
                onChange(e.target.value as string[])
                setIsOpen(false)
              }}
              open={isOpen}
              onOpen={() => setIsOpen(true)}
              onClose={() => setIsOpen(false)}
            >
              {props.activities.map(svc => (
                <MenuItem key={svc.id} value={svc.id}>
                  {svc.title}
                </MenuItem>
              ))}
            </Select>

            {/* Show error text if there's a validation error */}
            {props.error && <FormHelperText>{`Please select a ${props.label}`}</FormHelperText>}

            <Box className='flex flex-wrap gap-2 mt-2'>
              {Array.isArray(value) &&
                value.map(itemId => {
                  const selectedActivity = props.activities.find(s => s.id === itemId)
                  return (
                    <Chip
                      key={itemId}
                      label={selectedActivity?.title}
                      onDelete={() => handleDelete(itemId, onChange, value)}
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

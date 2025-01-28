'use client' // <-- If using Next.js App Router

import React, { useState } from 'react'
import {
  Select,
  MenuItem,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Card,
  CardHeader,
  SelectChangeEvent
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

// Example list of available services
const services = [
  { key: 'rejected', value: 'Rejected', optionString: 'REJECTED' },
  { key: 'canceled', value: 'Canceled', optionString: 'CANCELED' },
  { key: 'confirmed', value: 'Confirmed', optionString: 'CONFIRMED' },
  { key: 'completed', value: 'Completed', optionString: 'COMPLETED' },
  { key: 'pending', value: 'Pending', optionString: 'PENDING' }
]

const RemittanceReportFilters = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Helper function to remove a specific item from the array
  const handleDelete = (itemToRemove: string) => {
    setSelectedItems(prev => prev.filter(item => item !== itemToRemove))
  }

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[]
    setSelectedItems(value)
  }

  return (
    <Card className='p-4'>
      <CardHeader title='Filters' />
      <Box className='w-full pb-4'>
        <FormControl fullWidth className='relative'>
          <InputLabel size='small'>EVV visits</InputLabel>
          <Select
            multiple
            value={selectedItems}
            onChange={handleChange} // Fixed: Pass the function directly
            renderValue={selected => (selected as string[]).join(', ')}
            label='EVV visits'
            size='small'
          >
            {services.map(svc => (
              <MenuItem key={svc.key} value={svc.value}>
                {svc.optionString}
              </MenuItem>
            ))}
          </Select>

          {/* Render chips BELOW the select */}
          <Box className='flex flex-wrap gap-2 mt-2'>
            {selectedItems.map(item => {
              const service = services.find(s => s.value === item)
              return (
                <Chip
                  key={item}
                  onDelete={() => handleDelete(item)}
                  label={service?.optionString}
                  deleteIcon={<CloseIcon sx={{ fontSize: '14px', color: '#8592A3' }} />}
                  className='mt-2 text-[#8592A3] text-sm py-1'
                />
              )
            })}
          </Box>
        </FormControl>
      </Box>
    </Card>
  )
}

export default RemittanceReportFilters

'use client'
import React from 'react'
import { Controller } from 'react-hook-form'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import { Box, CircularProgress, FormHelperText, InputLabel, Select, Typography } from '@mui/material'

type Option = {
  key: any
  value: any
  optionString: string
}

interface CustomDropDownProps {
  name: string
  control: any
  error?: any
  label: string
  optionList: Option[]
  defaultValue?: any
  isRequired?: boolean
  disabled?: boolean
  loading?: boolean
}

const CustomDropDown: React.FC<CustomDropDownProps> = ({
  name,
  control,
  label,
  optionList = [],
  loading = false,
  isRequired = true,
  defaultValue = '',
  error,
  disabled = false
}) => {
  const renderLabel = () => (
    <Box className='flex flex-row items-center'>
      {label && <Typography component='span'>{label}</Typography>}
      {isRequired && (
        <Typography component='span' className='text-red-500 ml-0.5'>
          *
        </Typography>
      )}
    </Box>
  )

  const renderMenuItems = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 56,
            width: '100%'
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )
    }

    if (optionList.length === 0) {
      return (
        <MenuItem key='no-options' value='' disabled>
          No options found
        </MenuItem>
      )
    }

    return optionList.map((item: Option) => (
      <MenuItem key={item.key} value={item.value}>
        {item.optionString}
      </MenuItem>
    ))
  }

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={{
        required: isRequired ? `${label} is required` : false
      }}
      render={({ field }) => (
        <FormControl fullWidth error={error} className='relative'>
          <InputLabel size='small'>{renderLabel()}</InputLabel>
          <Select
            {...field}
            label={renderLabel()}
            size='small'
            disabled={disabled}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 200
                }
              }
            }}
          >
            {renderMenuItems()}
          </Select>
          {error && <FormHelperText>{`Please select a ${label}`}</FormHelperText>}
        </FormControl>
      )}
    />
  )
}

export default CustomDropDown

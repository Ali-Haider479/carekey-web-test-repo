'use client'
import React, { useState } from 'react'
import { Controller } from 'react-hook-form'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import { FormHelperText, InputLabel, Select } from '@mui/material'

type Option = {
  key: any
  value: any
  optionString: string
}

type Props = {
  name: string
  control: any
  error?: any
  label: string
  optionList: Option[]
  defaultValue?: any
  sx?: any
  isRequired?: boolean
  disabled?: boolean
}

function CustomDropDown(props: Props) {
  const { isRequired = true } = props
  return (
    <Controller
      name={props.name}
      control={props.control}
      defaultValue={props.defaultValue}
      rules={{
        required: isRequired ? `${props.label} is required` : false // Apply required rule conditionally
      }}
      render={({ field }) => (
        <FormControl fullWidth error={!!props.error} className='relative' sx={props.sx}>
          <InputLabel size='small'>{props.label}</InputLabel>
          <Select
            {...field} // Spread field to bind value and onChange
            label={props.label}
            size='small'
            disabled={props.disabled}
          >
            {props?.optionList?.map((item: any) => (
              <MenuItem key={item.key} value={item.value}>
                {item.optionString}
              </MenuItem>
            ))}
          </Select>
          {props.error && <FormHelperText>{`please select a ${props.label}`}</FormHelperText>}
        </FormControl>
      )}
    />
  )
}

export default CustomDropDown

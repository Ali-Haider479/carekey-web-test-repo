'use client'
import React, { useState } from 'react'
import { Controller } from 'react-hook-form'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import { FormHelperText, InputLabel, Select, Typography } from '@mui/material'

type Option = {
  key: any
  value: any
  optionString: string
}

type Props = {
  name: string
  control?: any
  error?: any
  label: string
  optionList: Option[]
  defaultValue?: any
  sx?: any
  // value?: any
  // onChange?: any
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
          <InputLabel size='small'>
            {isRequired === true ? (
              <div className='flex flex-row'>
                <Typography>{props.label}</Typography>
                <Typography className='text-red-500 ml-1'>*</Typography>
              </div>
            ) : (
              props.label
            )}
          </InputLabel>
          <Select
            {...field} // Spread field to bind value and onChange
            label={
              isRequired === true ? (
                <div className='flex flex-row'>
                  <Typography>{props.label}</Typography>
                  <Typography className='text-red-500 ml-1'>*</Typography>
                </div>
              ) : (
                props.label
              )
            }
            size='small'
            // value={props.value}
            // onChange={props.onChange}
            disabled={props.disabled}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 200 // Adjust the height of the dropdown options
                }
              }
            }}
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

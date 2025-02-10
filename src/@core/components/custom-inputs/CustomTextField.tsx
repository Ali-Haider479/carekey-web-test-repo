'use client'
import TextField from '@mui/material/TextField'
import React from 'react'
import { Controller } from 'react-hook-form'

type Props = {
  label: string
  placeHolder: string
  name: string
  defaultValue: any
  type: any
  error: any
  control: any
  slotProps?: any
  disabled?: boolean
}

const CustomTextField = (props: Props) => {
  return (
    <div>
      <Controller
        name={props.name}
        control={props.control}
        defaultValue={props.defaultValue} // Set the default value
        rules={{ required: `${props.label} is required` }} // Validation rules
        render={({ field }) => (
          <TextField
            {...field}
            error={!!props.error}
            helperText={props.error && `please provide ${props.label}`}
            fullWidth
            size='small'
            label={props.label}
            placeholder={props.placeHolder}
            type={props.type}
            slotProps={props.slotProps}
            disabled={props.disabled}
          />
        )}
      />
    </div>
  )
}

export default CustomTextField

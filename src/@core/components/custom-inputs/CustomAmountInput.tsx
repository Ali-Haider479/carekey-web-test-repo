'use client'
import React from 'react'
import { TextField, InputAdornment } from '@mui/material'
import { Controller } from 'react-hook-form'

type Props = {
  name: string
  control: any
  label: string
  placeHolder: string
  defaultValue: any
  type: any
}

const CustomAmountInput = (props: Props) => {
  return (
    <div>
      <Controller
        name={props.name}
        control={props.control}
        defaultValue={props.defaultValue} // Set the default value
        rules={{
          required: `${props.label} is required`, // Required validation
          pattern: {
            value: /^\d*\.?\d{0,2}$/, // Allows numbers with up to 2 decimal places
            message: 'Please enter a valid amount'
          }
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            error={!!error} // Highlight the field if there's an error
            helperText={error ? error.message : ''} // Show validation error message
            fullWidth
            size='small'
            itemType='number'
            label={props.label} // Label for the field
            placeholder={props.placeHolder} // Placeholder text
            InputProps={{
              // Add dollar sign
              startAdornment: <InputAdornment position='start'>$</InputAdornment>,
              inputMode: 'decimal' // Use decimal keyboard on mobile
            }}
            type='number' // Ensure the type is text for proper input handling
          />
        )}
      />
    </div>
  )
}

export default CustomAmountInput

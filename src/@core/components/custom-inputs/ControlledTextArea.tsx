'use client'
import { TextField, Typography } from '@mui/material'
import React from 'react'
import { Controller } from 'react-hook-form'

type Props = {
  name: string
  control: any
  label: any
  placeHolder: string
  defaultValue: any
  disabled?: boolean
  isRequired?: boolean
}

const ControlledTextArea = (props: Props) => {
  const { isRequired = true } = props

  return (
    <Controller
      name={props.name}
      control={props.control}
      defaultValue={props.defaultValue} // Set the default value
      rules={{
        required: isRequired ? `${props.label} is required` : false, // Required validation
        minLength: {
          value: 10,
          message: `Please provide at least 10 characters for ${props.label}`
        }
      }}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          disabled={props.disabled}
          error={!!error} // Highlight the field if there's an error
          helperText={error ? error.message : ''} // Show validation error message
          onChange={e => {
            let value = e.target.value.trimStart()
            field.onChange(value) // Update the field value
          }}
          fullWidth
          size='small'
          label={
            isRequired === true ? (
              <div className='flex flex-row'>
                <Typography>{props.label}</Typography>
                <Typography className='text-red-500 ml-1'>*</Typography>
              </div>
            ) : (
              props.label
            )
          } // Label for the field
          placeholder={props.placeHolder} // Placeholder text
          multiline // Enables textarea
          rows={4} // Number of visible rows
          type='text' // Text input type (should be text for textarea)
        />
      )}
    />
  )
}

export default ControlledTextArea

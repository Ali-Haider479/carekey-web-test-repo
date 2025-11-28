'use client'
import { Typography } from '@mui/material'
import TextField from '@mui/material/TextField'
import React, { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

type Props = {
  label: string
  placeHolder: string
  name: string
  defaultValue: any
  type: any
  error?: any
  control: any
  slotProps?: any
  disabled?: boolean
  isRequired?: boolean
  minLength?: number
  maxLength?: number
  onBlur?: any
  isUMPI?: boolean
  onChange?: (e: any) => void
  value?: string | number | null
}

const ServiceAuthCustomTextField = (props: Props) => {
  const { isRequired = true } = props
  const { trigger, watch, setValue } = useFormContext()

  // Set defaultValue in form context when component mounts
  //   useEffect(() => {
  //     if (props.defaultValue) {
  //       setValue(props.name, props.defaultValue)
  //     }
  //   }, [props.defaultValue, props.name, setValue])

  const getErrorMessage = (error: any) => {
    if (!error) return ''
    if (error.message) return error.message
    if (isRequired) {
      return `Please provide ${props.label}`
    }
    return ''
  }

  return (
    <div>
      <Controller
        name={props.name}
        control={props.control}
        defaultValue={props.defaultValue || ''} // Ensure defaultValue is passed to Controller
        rules={{
          required: isRequired ? `${props.label} is required` : false,
          minLength: {
            value: props.minLength || 1,
            message: props.minLength ? `${props.label} should be at least ${props.minLength} characters` : ''
          },
          maxLength: {
            value: props.maxLength || 524288,
            message: props.maxLength ? `${props.label} cannot exceed ${props.maxLength} characters` : ''
          }
        }}
        render={({ field, fieldState }) => (
          //   console.log('field value', field.value, fieldState.error),
          <TextField
            {...field}
            value={props.value || ''}
            onChange={e => {
              let value = e.target.value.trimStart()
              field.onChange(value) // Update react-hook-form state
              if (props.onChange) props.onChange(e) // Call custom onChange if provided
              trigger(props.name)
            }}
            error={!!fieldState.error}
            helperText={getErrorMessage(fieldState.error)}
            fullWidth
            size='small'
            label={
              isRequired ? (
                <div className='flex flex-row'>
                  <Typography>{props.label}</Typography>
                  <Typography className='text-red-500 ml-1'>*</Typography>
                </div>
              ) : (
                props.label
              )
            }
            placeholder={props.placeHolder}
            type={props.type}
            slotProps={props.slotProps}
            disabled={props.disabled}
            onBlur={props.onBlur}
          />
        )}
      />
    </div>
  )
}

export default ServiceAuthCustomTextField

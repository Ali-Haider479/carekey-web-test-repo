'use client'
import { Typography } from '@mui/material'
import TextField from '@mui/material/TextField'
import React, { useState } from 'react'
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
  isPhoneNumber?: boolean
}

const CustomTextField = (props: Props, e: any) => {
  const { isRequired = true, isPhoneNumber = false } = props
  const { trigger, watch, setValue } = useFormContext()

  const password = watch('password')
  const phoneNumber = isPhoneNumber && watch(`${props.name}`)

  // Format US phone number as XXX XXX XXXX
  const formatPhoneNumber = (value: string) => {
    if (!isPhoneNumber) return value

    // Remove non-digits
    const digits = value.replace(/\D/g, '')

    // Format the phone number
    let formatted = ''
    if (digits.length > 0) {
      formatted += '(' + digits.substring(0, Math.min(3, digits.length))

      if (digits.length > 3) {
        formatted += ') ' + digits.substring(3, Math.min(6, digits.length))
      }

      if (digits.length > 6) {
        formatted += '-' + digits.substring(6, Math.min(digits.length))
      }
    }

    return formatted
  }
  const getErrorMessage = (error: any) => {
    if (!error) return ''

    // If error has a message property, use that (this will catch minLength/maxLength messages)
    if (error.message) return error.message

    // Email Validation
    if (props.type === 'email') {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      const value = error.ref?.value || ''
      if (!emailPattern.test(value)) {
        return 'Please enter a valid email address!.'
      } else {
        return ''
      }
    }

    // Phone number validation
    if (isPhoneNumber && isRequired) {
      const value = error.ref?.value || ''
      const digits = value.replace(/\D/g, '')
      if (!digits.length) {
        return `${props.label} is required`
      }
      if (digits.length !== 10) {
        return 'Please enter a valid 10-digit phone number'
      }
    }

    if (isPhoneNumber && !isRequired) {
      const value = error.ref?.value || ''
      const digits = value.replace(/\D/g, '')
      if (!digits.length) {
        return ''
      }
      if (digits.length !== 10) {
        return 'Please enter a valid 10-digit phone number'
      }
    }

    // Default error message for required field
    if (isRequired) {
      return `Please provide ${props.label}`
    }
  }

  return (
    <div>
      <Controller
        name={props.name}
        control={props.control}
        defaultValue={props.defaultValue}
        rules={{
          required: isRequired ? `${props.label} is required` : false,
          minLength: {
            value: props.minLength || 1,
            message: `${props.label} should be atleast ${props.minLength} characters`
          },
          maxLength: {
            value: props.maxLength || 30,
            message: `${props.label} cannot exceed ${props.maxLength} characters`
          },
          ...(props.type === 'email' && {
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: 'Please enter a valid email address'
            }
          }),
          ...(isPhoneNumber && {
            validate: {
              validPhoneNumber: (value: string) => {
                const digits = value?.replace(/\D/g, '')

                if (isRequired && !digits?.length) {
                  return `${props.label} is required`
                }
                if (digits?.length >= 1 && digits?.length < 10) {
                  return 'Please enter a valid 10 digit number'
                }
              }
            }
          }),
          ...(props.type === 'password' &&
            props.name === 'confirmPassword' && {
              validate: {
                matchesPassword: (value: string) => value === password || 'Passwords do not match'
              }
            })
        }}
        render={({ field, fieldState }) => {
          return (
            <TextField
              {...field}
              value={isPhoneNumber ? phoneNumber : field.value}
              onChange={e => {
                let value = e.target.value.trimStart()

                // Handle phone number input
                if (isPhoneNumber) {
                  // For phone numbers, only keep digits and limit to 10
                  const digits = value.replace(/\D/g, '').substring(0, 10)

                  // Set the raw digits as the actual form value
                  field.onChange(phoneNumber)

                  // Update the display value with formatting
                  // setDisplayValue(formatPhoneNumber(digits))
                  setValue(`${props.name}`, formatPhoneNumber(digits))
                } else {
                  // For normal fields, just set the value as is
                  field.onChange(value)
                }

                // Trigger validation immediately after value change
                trigger(props.name)
              }}
              error={!!fieldState.error}
              helperText={getErrorMessage(fieldState.error)}
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
              }
              placeholder={props.placeHolder}
              type={isPhoneNumber ? 'tel' : props.type}
              inputProps={{
                ...(isPhoneNumber
                  ? {
                      inputMode: 'numeric',
                      pattern: '[0-9]*'
                    }
                  : {})
              }}
              slotProps={props.slotProps}
              disabled={props.disabled}
              onBlur={props.onBlur}
            />
          )
        }}
      />
    </div>
  )
}

export default CustomTextField

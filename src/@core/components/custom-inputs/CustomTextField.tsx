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
  isPhoneNumber?: boolean
  isSocialSecurityNumber?: boolean
  isUMPI?: boolean
  isEIN?: boolean
  isClientCode?: boolean
  isZipCode?: boolean
}

const CustomTextField = (props: Props) => {
  const { isRequired = true, isPhoneNumber = false, isSocialSecurityNumber = false, isEIN = false } = props
  const { trigger, watch, setValue } = useFormContext()

  const password = watch('password')
  const phoneNumber = isPhoneNumber ? watch(props.name) : undefined
  const ssn = isSocialSecurityNumber ? watch(props.name) : undefined
  const einNumber = props.isEIN ? watch(props.name) : undefined

  // Set defaultValue in form context when component mounts
  useEffect(() => {
    if (props.defaultValue) {
      setValue(props.name, props.defaultValue)
    }
  }, [props.defaultValue, props.name, setValue])

  // Format US phone number as (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string) => {
    if (!isPhoneNumber) return value
    const digits = value.replace(/\D/g, '')
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

  // Format SSN as XXX-XX-XXXX
  const formatSSN = (value: string) => {
    if (!isSocialSecurityNumber) return value
    const digits = value.replace(/\D/g, '')
    let formatted = ''
    if (digits.length > 0) {
      formatted += digits.substring(0, Math.min(3, digits.length))
      if (digits.length > 3) {
        formatted += '-' + digits.substring(3, Math.min(5, digits.length))
      }
      if (digits.length > 5) {
        formatted += '-' + digits.substring(5, Math.min(digits.length))
      }
    }
    return formatted
  }

  const formatEIN = (value: string) => {
    const digits = value.replace(/\D/g, '')
    let formatted = ''
    if (digits.length > 0) {
      formatted += digits.substring(0, Math.min(2, digits.length))
      if (digits.length > 2) {
        formatted += '-' + digits.substring(2, Math.min(10, digits.length))
      }
    }
    return formatted
  }

  const getErrorMessage = (error: any) => {
    if (!error) return ''
    if (error.message) return error.message
    if (props.type === 'email') {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      const value = error.ref?.value || ''
      if (!emailPattern.test(value)) {
        return 'Please enter a valid email address.'
      }
    }
    if (isPhoneNumber) {
      const value = error.ref?.value || ''
      const digits = value.replace(/\D/g, '')
      if (isRequired && !digits.length) {
        return `${props.label} is required`
      }
      if (digits.length && digits.length !== 10) {
        return 'Please enter a valid 10-digit phone number'
      }
    }
    if (isSocialSecurityNumber) {
      const value = error.ref?.value || ''
      const digits = value.replace(/\D/g, '')
      if (isRequired && !digits.length) {
        return `${props.label} is required`
      }
      if (digits.length && digits.length !== 9) {
        return 'Please enter a valid 9-digit Social Security Number'
      }
    }
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
                if (digits?.length && digits?.length < 10) {
                  return 'Please enter a valid 10 digit number'
                }
                return true
              }
            }
          }),
          ...(isSocialSecurityNumber && {
            validate: {
              validSSN: (value: string) => {
                const digits = value?.replace(/\D/g, '')
                if (isRequired && !digits?.length) {
                  return `${props.label} is required`
                }
                if (digits?.length && digits?.length < 9) {
                  return 'Please enter a valid 9 digit Social Security Number'
                }
                return true
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
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            value={
              isPhoneNumber && phoneNumber !== undefined
                ? formatPhoneNumber(phoneNumber)
                : isEIN && einNumber !== undefined
                  ? formatEIN(einNumber)
                  : isSocialSecurityNumber && ssn !== undefined
                    ? formatSSN(ssn)
                    : field.value || ''
            }
            onChange={e => {
              let value = e.target.value.trimStart()
              if (isPhoneNumber) {
                const digits = value.replace(/\D/g, '').substring(0, 10)
                field.onChange(digits)
                setValue(props.name, formatPhoneNumber(digits))
              } else if (isSocialSecurityNumber) {
                const digits = value.replace(/\D/g, '').substring(0, 9)
                field.onChange(digits)
                setValue(props.name, formatSSN(digits))
              } else if (props.isZipCode) {
                const digits = value.replace(/\D/g, '').substring(0, 5)
                field.onChange(digits)
                setValue(props.name, digits)
              } else if (props.isUMPI) {
                const digits = value.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 16)
                field.onChange(digits)
                setValue(props.name, digits)
              } else if (props.isEIN) {
                const digits = value.replace(/\D/g, '').substring(0, 11)
                field.onChange(digits)
                setValue(props.name, digits)
              } else if (props.isClientCode) {
                const digits = value.replace(/\D/g, '').substring(0, 4)
                field.onChange(digits)
                setValue(props.name, digits)
              } else {
                field.onChange(value)
              }
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
            type={isPhoneNumber ? 'tel' : isSocialSecurityNumber ? 'text' : props.type}
            slotProps={props.slotProps}
            disabled={props.disabled}
            onBlur={props.onBlur}
          />
        )}
      />
    </div>
  )
}

export default CustomTextField

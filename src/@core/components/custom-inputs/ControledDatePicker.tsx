'use client'
import { Controller } from 'react-hook-form'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { TextField, Typography } from '@mui/material'

type Props = {
  name: string
  control: any
  error?: any
  label: string
  defaultValue: any
  isRequired?: boolean
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  startDate?: Date
  endDate?: Date
  selected?: Date
  rules?: any // Add rules prop to support validation
}

const ControlledDatePicker = (props: Props) => {
  const { isRequired = true, rules } = props

  return (
    <Controller
      name={props.name}
      control={props.control}
      defaultValue={props.defaultValue}
      // rules={{ required: isRequired ? `${props.label} is required` : false }}
      rules={rules ? rules : { required: isRequired ? `${props.label} is required` : false }} // Apply validation rules
      render={({ field, fieldState: { error } }) => (
        <AppReactDatepicker
          selected={field.value ? new Date(field.value) : null}
          onChange={date => field.onChange(date)} // Pass the date to react-hook-form
          placeholderText='MM/DD/YYYY'
          disabled={props.disabled}
          showYearDropdown
          showMonthDropdown
          endDate={props.endDate}
          startDate={props.startDate}
          minDate={props.minDate}
          maxDate={props.maxDate}
          dateFormat='MM/dd/yyyy'
          customInput={
            <TextField
              fullWidth
              error={!!error}
              helperText={error ? error.message : 'Please select a date'}
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
              placeholder='MM/DD/YYYY'
            />
          }
        />
      )}
    />
  )
}

export default ControlledDatePicker

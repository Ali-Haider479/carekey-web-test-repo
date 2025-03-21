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
}

const ControlledDatePicker = (props: Props) => {
  const { isRequired = true } = props
  const defaultDate = Date.now()
  let defaultFormattedDate: any = new Date(defaultDate)

  const year = defaultFormattedDate.getFullYear()
  const month = String(defaultFormattedDate.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const day = String(defaultFormattedDate.getDate()).padStart(2, '0')

  defaultFormattedDate = `${month}/${day}/${year}`

  return (
    <Controller
      name={props.name}
      control={props.control}
      defaultValue={props.defaultValue}
      rules={{ required: isRequired ? `${props.label} is required` : false }}
      render={({ field }) => (
        <AppReactDatepicker
          selected={field.value}
          onChange={date => field.onChange(date)} // Pass the date to react-hook-form
          placeholderText='MM/DD/YYYY'
          disabled={props.disabled}
          showYearDropdown
          showMonthDropdown
          minDate={props.minDate}
          maxDate={props.maxDate}
          customInput={
            <TextField
              fullWidth
              error={props.error}
              helperText={props.error && 'please select a date'}
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
              placeholder='MM/DD/YYYY'
            />
          }
        />
      )}
    />
  )
}

export default ControlledDatePicker

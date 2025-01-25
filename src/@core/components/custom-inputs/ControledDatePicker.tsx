'use client'
import { Controller } from 'react-hook-form'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { TextField } from '@mui/material'

type Props = {
  name: string
  control: any
  error: any
  label: string
  defaultValue: any
}

const ControlledDatePicker = (props: Props) => {
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
      rules={{ required: `${props.label} is required` }}
      render={({ field }) => (
        <AppReactDatepicker
          selected={field.value}
          onChange={date => field.onChange(date)} // Pass the date to react-hook-form
          placeholderText='MM/DD/YYYY'
          customInput={
            <TextField
              fullWidth
              error={props.error}
              helperText={props.error && 'please select a date'}
              size='small'
              label={props.label}
              placeholder='MM/DD/YYYY'
            />
          }
        />
      )}
    />
  )
}

export default ControlledDatePicker

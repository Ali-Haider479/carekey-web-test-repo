'use client'
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material'
import { Controller } from 'react-hook-form'

type Options = {
  key: number
  value: string
  label: string
}

type Props = {
  name: string
  label: string
  radioOptions: Options[]
}

const CustomRadioButton = (props: Props) => {
  return (
    <Controller
      name={props.name}
      rules={{ required: `${props.label} is required` }}
      render={({ field }) => (
        <FormControl className='!flex !flex-row items-center mt-1 ml-1'>
          <FormLabel id={`${props.name}-radio-group-label`} className=''>
            {props.label}
          </FormLabel>
          <RadioGroup
            {...field}
            value={field.value || props.radioOptions[0].value} // Ensure value is controlled
            aria-labelledby={`${props.name}-radio-group-label`}
            name={field.name}
            className='text-gray-500 !flex !flex-row ml-7'
          >
            {props.radioOptions.map((item: Options) => (
              <FormControlLabel
                key={item.key}
                value={item.value}
                control={<Radio size='small' />}
                label={item.label}
                className='w-20'
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}
    />
  )
}

export default CustomRadioButton

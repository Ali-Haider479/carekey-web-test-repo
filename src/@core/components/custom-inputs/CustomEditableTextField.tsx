import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { USStates } from '@/utils/constants'
import { MenuItem, TextField, Typography } from '@mui/material'

export const EditableField = ({
  label,
  value,
  isEdit,
  onChange,
  name,
  disabled,
  phoneNumberError,
  emailError,
  AddressError
}: any) => {
  const handleChange = (e: any) => {
    onChange(name, e.target.value)
  }

  const isPhoneField = ['primaryPhoneNumber', 'secondaryPhoneNumber', 'emergencyContactNumber'].includes(name)
  const isEmailField = ['emailAddress', 'emergencyEmailId'].includes(name)
  const isAddressField = ['address', 'city', 'zipCode'].includes(name)

  return (
    <div className='flex flex-col text-sm text-gray-500'>
      <div className='flex justify-between items-center'>
        <Typography>{label}:</Typography>
        {isEdit ? (
          <Typography>
            {label === 'Gender' && value === 'male'
              ? 'Male'
              : label === 'Gender' && value === 'female'
                ? 'Female'
                : value || ''}
          </Typography>
        ) : name.includes('state') ? (
          <TextField
            value={value || ''}
            variant='standard'
            className='outline-none w-1/2'
            onChange={handleChange}
            disabled={disabled}
            select
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: '200px',
                    width: '200px'
                  }
                }
              }
            }}
          >
            {USStates.map((state: any) => (
              <MenuItem key={state.key} value={state.value} sx={{}}>
                {state.optionString}
              </MenuItem>
            ))}
          </TextField>
        ) : name === 'dateOfBirth' || name === 'dischargeDate' ? (
          <AppReactDatepicker
            selected={value ? new Date(value) : null}
            onChange={(date: Date | null) => {
              onChange(name, date ? date.toISOString().split('T')[0] : '')
            }}
            maxDate={name === 'dateOfBirth' ? new Date() : undefined}
            dateFormat='MM/dd/yyyy'
            className='w-1/2 outline-none'
            showMonthDropdown
            showYearDropdown
            disabled={disabled}
            customInput={
              <TextField
                variant='standard'
                className='outline-none w-full'
                value={value || ''}
                onChange={handleChange}
                disabled={disabled}
              />
            }
          />
        ) : (
          <TextField
            value={
              label === 'Gender' && value === 'male'
                ? 'Male'
                : label === 'Gender' && value === 'female'
                  ? 'Female'
                  : value || ''
            }
            variant='standard'
            className='outline-none w-1/2'
            onChange={handleChange}
            disabled={disabled}
            inputProps={
              isPhoneField || name === 'payRate'
                ? {
                  inputMode: 'numeric',
                  pattern: '[0-9]*'
                }
                : {}
            }
          />
        )}
      </div>
      {isPhoneField && phoneNumberError && (
        <Typography className='text-error mt-1' sx={{ fontSize: '0.75rem' }}>
          Please enter a valid 10 digit number
        </Typography>
      )}
      {isEmailField && emailError && (
        <Typography className='text-error mt-1' sx={{ fontSize: '0.75rem' }}>
          Please enter a valid email address
        </Typography>
      )}
      {isAddressField && AddressError && (
        <Typography className='text-error mt-1' sx={{ fontSize: '0.75rem' }}>
          Please enter a valid {label}
        </Typography>
      )}
    </div>
  )
}

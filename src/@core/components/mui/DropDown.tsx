import { MenuItem, Typography } from '@mui/material'
import CustomTextField from './TextField'

type OptionListType = {
  key: any
  value: string | number
  displayValue: string
}

type DropDownProps = {
  value: string | number
  placeholder?: any
  setValue: any
  options: OptionListType[]
  className?: string
  disabled?: boolean
  onChange?: (event: React.ChangeEvent<{ value: unknown }>) => void
  size?: 'small' | 'medium'
}

const Dropdown = ({ value, setValue, options, className, disabled, onChange, size, placeholder }: DropDownProps) => {
  return (
    <CustomTextField
      select
      id='select-item'
      placeholder={placeholder}
      className={className || 'w-full'}
      value={value}
      onChange={onChange || (e => setValue(e.target.value as string | number))}
      disabled={disabled}
      slotProps={{ select: { displayEmpty: true } }}
      size={size || 'small'}
    >
      {options?.length > 0 ? (
        options?.map(item => (
          <MenuItem key={item.key} value={item.value}>
            {item.displayValue}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>No options available</MenuItem>
      )}
    </CustomTextField>
  )
}

export default Dropdown

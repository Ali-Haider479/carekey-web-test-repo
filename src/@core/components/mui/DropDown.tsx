import { MenuItem, Typography } from '@mui/material'
import CustomTextField from './TextField'

type OptionListType = {
  key: number
  value: string | number
  displayValue: string
}

type DropDownProps = {
  value: string | number
  setValue: any
  options: OptionListType[]
  className?: string
  disabled?: boolean
  onChange?: (event: React.ChangeEvent<{ value: unknown }>) => void
  size?: 'small' | 'medium'
}

const Dropdown = ({ value, setValue, options, className, disabled, onChange, size }: DropDownProps) => {
  return (
    <CustomTextField
      select
      id='select-item'
      placeholder='status'
      className={className || 'w-full'}
      value={value}
      onChange={onChange || (e => setValue(e.target.value as string | number))}
      disabled={disabled}
      slotProps={{ select: { displayEmpty: true } }}
      size={size || 'small'}
    >
      {options.map(item => (
        <MenuItem key={item.key} value={item.value}>
          {item.displayValue}
        </MenuItem>
      ))}
    </CustomTextField>
  )
}

export default Dropdown

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
  onChange?: any
}

const Dropdown = ({ value, setValue, options, className, disabled, onChange }: DropDownProps) => {
  return (
    <CustomTextField
      select
      id='select-item'
      placeholder='status'
      className={className?.length ? className : 'w-full'}
      value={value}
      onChange={onChange ? onChange : e => setValue(e.target.value)}
      disabled={disabled}
      slotProps={{
        select: { displayEmpty: true }
      }}
    >
      {options?.map((item: OptionListType) => (
        <MenuItem key={item.key} value={item.value}>
          {item.displayValue}
        </MenuItem>
      ))}
    </CustomTextField>
  )
}

export default Dropdown

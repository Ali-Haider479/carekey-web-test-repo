import { MenuItem, Typography } from '@mui/material'
import CustomTextField from './TextField'

type OptionListType = {
  key: number
  value: string
  displayValue: string
}

type DropDownProps = {
  value: string
  setValue: any
  options: OptionListType[]
  className?: string
}

const Dropdown = ({ value, setValue, options, className }: DropDownProps) => {
  return (
    <CustomTextField
      select
      id='select-item'
      placeholder='status'
      className={className?.length ? className : 'w-full'}
      value={value}
      onChange={e => setValue(e.target.value)}
      slotProps={{
        select: { displayEmpty: true }
      }}
    >
      {options.map((item: OptionListType) => (
        <MenuItem key={item.key} value={item.value}>
          {item.displayValue}
        </MenuItem>
      ))}
    </CustomTextField>
  )
}

export default Dropdown

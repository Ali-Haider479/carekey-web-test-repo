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
}

const Dropdown = ({ value, setValue, options }: DropDownProps) => {
  return (
    <CustomTextField
      select
      fullWidth
      id='select-item'
      placeholder='status'
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

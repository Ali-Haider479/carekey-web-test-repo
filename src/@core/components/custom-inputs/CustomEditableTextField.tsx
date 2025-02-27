import { TextField, Typography } from '@mui/material'

export const EditableField = ({ label, value, isEdit, onChange, name, disabled }: any) => {
  const handleChange = (e: any) => {
    onChange(name, e.target.value)
  }

  return (
    <div className='flex justify-between text-sm text-gray-500 items-center'>
      <Typography>{label}:</Typography>
      {isEdit ? (
        <Typography>{value || '---'}</Typography>
      ) : (
        <TextField
          defaultValue={value || '---'}
          variant='standard'
          className='outline-none'
          onChange={handleChange}
          disabled={disabled}
        />
      )}
    </div>
  )
}

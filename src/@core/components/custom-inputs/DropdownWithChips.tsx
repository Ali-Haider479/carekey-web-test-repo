import React, { useState } from 'react'
import { Controller, Control, FieldError } from 'react-hook-form'
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Box, Chip, SelectChangeEvent } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

type Activity = {
  id: string | number
  title: string
}

type DropdownWithChipsProps = {
  name: string
  control: Control<any>
  label: string
  activities: Activity[]
  errors?: { [key: string]: FieldError | undefined }
  requiredMessage?: string
}

const DropdownWithChips: React.FC<DropdownWithChipsProps> = ({
  name,
  control,
  label,
  activities,
  errors,
  requiredMessage = 'At least one activity is required'
}) => {
  const [open, setOpen] = useState(false)

  const handleDeleteActivity = (
    itemId: string | number,
    onChange: (...event: any[]) => void,
    value: (string | number)[]
  ) => {
    const updated = value.filter(id => id !== itemId)
    onChange(updated)
  }

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: requiredMessage }}
      render={({ field: { value = [], onChange, ...field } }) => (
        <FormControl fullWidth error={!!errors?.[name]} sx={{ mb: 3 }}>
          <InputLabel size='small'>{label}</InputLabel>
          <Select
            {...field}
            multiple
            renderValue={() => ''}
            value={Array.isArray(value) ? value : []}
            label={label}
            size='small'
            onChange={e => {
              onChange((e as SelectChangeEvent<any>).target.value)
              // Don't close here - let the user see what they selected
            }}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250
                }
              },
              // Close when clicking outside
              onClick: e => {
                e.stopPropagation()
                setOpen(false)
              }
            }}
          >
            {activities.map(activity => (
              <MenuItem
                key={activity.id}
                value={activity.id}
                onClick={() => {
                  // Close after a small delay to allow the selection to process
                  setTimeout(() => setOpen(false), 100)
                }}
              >
                {activity.title}
              </MenuItem>
            ))}
          </Select>

          {errors?.[name] && <FormHelperText error>{errors[name]?.message}</FormHelperText>}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {Array.isArray(value) &&
              value.map(itemId => {
                const selectedActivity = activities.find(a => a.id === itemId)
                if (!selectedActivity) return null

                return (
                  <Chip
                    key={itemId}
                    label={selectedActivity.title}
                    onDelete={() => handleDeleteActivity(itemId, onChange, value)}
                    deleteIcon={
                      <CloseIcon
                        sx={{
                          fontSize: '16px',
                          color: 'text.secondary'
                        }}
                      />
                    }
                    sx={{
                      color: 'text.secondary',
                      py: 0.5,
                      '& .MuiChip-deleteIcon': {
                        marginLeft: 0.5
                      }
                    }}
                  />
                )
              })}
          </Box>
        </FormControl>
      )}
    />
  )
}

export default DropdownWithChips

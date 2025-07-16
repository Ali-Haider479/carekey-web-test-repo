import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import React, { Dispatch, SetStateAction, useState } from 'react'

interface AddPayPeriodModalProps {
  isModalOpen: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  onSubmit: (data: { startDate: Date; weeks: number }) => void
}

const EditPayPeriodModal = ({ isModalOpen, setIsModalOpen, onSubmit }: AddPayPeriodModalProps) => {
  const [noOfWeeks, setNoOfWeeks] = useState<number>(1)
  const [startDate, setStartDate] = useState<Date | null>(new Date())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (startDate) {
      onSubmit({ startDate, weeks: noOfWeeks })
      setIsModalOpen(false)
    }
  }

  return (
    <Dialog
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      fullWidth
      maxWidth='sm'
      PaperProps={{
        sx: {
          minHeight: '450px',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 3 }}>
        Add New Pay Period
        <IconButton edge='end' color='inherit' onClick={() => setIsModalOpen(false)} aria-label='close'>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          component={'form'}
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            mt: 2
          }}
        >
          <Stack spacing={3} sx={{ flexGrow: 1 }}>
            <AppReactDatepicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              minDate={new Date()}
              dateFormat='MM/dd/yyyy'
              dropdownMode='select'
              popperPlacement='bottom-start'
              customInput={
                <TextField
                  label={'Start Date'}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '56px'
                    }
                  }}
                />
              }
            />

            <FormControl fullWidth>
              <InputLabel id='weeks-select-label'>Pay Period Length</InputLabel>
              <Select
                labelId='weeks-select-label'
                id='weeks-select'
                value={noOfWeeks}
                label='Pay Period Length'
                onChange={(e: SelectChangeEvent<number>) => setNoOfWeeks(Number(e.target.value))}
                fullWidth
              >
                <MenuItem value={1}>1 Week</MenuItem>
                <MenuItem value={2}>2 Weeks</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={() => setIsModalOpen(false)}>
          Cancel
        </Button>
        <Button type='submit' variant='contained' onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditPayPeriodModal

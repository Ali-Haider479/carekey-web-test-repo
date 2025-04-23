import React from 'react'
import { Box, Button, Dialog, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { Visibility } from '@mui/icons-material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import ControlledTextArea from '../custom-inputs/ControlledTextArea'
import { FormProvider, useForm } from 'react-hook-form'

const ActionButton = ({
  handleEdit,
  handleDelete,
  handleConfirmDelete,
  handleCancelDelete,
  handleActionClick,
  handleCloseMenu,
  handleCancelEdit,
  user,
  selectedUser,
  anchorEl,
  isEditing,
  isDeleting,
  handleViewDetails,
  disabled
}: any) => {
  const methods = useForm<any>({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = methods

  const isCurrentRowEditing = isEditing && selectedUser?.id === user.id
  const isCurrentRowDeleting = isDeleting && selectedUser?.id === user.id

  const [isDeleteModalShow, setIsDeleteModalShow] = React.useState(false)

  const handleDeleteModalClose = () => {
    setIsDeleteModalShow(false)
    handleCancelDelete() // Reset delete state when closing the modal
    reset()
  }

  const handleDeleteClick = () => {
    setIsDeleteModalShow(true)
    handleDelete(user) // Prepare the row for deletion
  }

  const onDeleteSubmit = (formData: any) => {
    handleConfirmDelete(formData.reason) // Pass the reason to handleConfirmDelete
    handleDeleteModalClose() // Close the modal after confirming
  }

  if (isCurrentRowEditing) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton
          onClick={() => handleCancelEdit()}
          color='error'
          size='small'
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.04)'
            }
          }}
        >
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>
    )
  }

  return (
    <>
      <IconButton onClick={e => handleActionClick(e, user)} size='small' disabled={disabled}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && selectedUser?.id === user.id && !isEditing && !isDeleting}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleViewDetails(user)} disabled={!!user.subRows && user.subRows.length > 0}>
          <Visibility sx={{ mr: 1 }} fontSize='small' />
          <Typography className='font-semibold'>View Details</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleEdit(user)}>
          <EditIcon sx={{ mr: 1 }} fontSize='small' />
          <Typography className='font-semibold'>Update Status</Typography>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon sx={{ mr: 1 }} fontSize='small' color='error' />
          <Typography className='font-semibold'>Delete</Typography>
        </MenuItem>
      </Menu>
      <FormProvider {...methods}>
        <Dialog
          open={isDeleteModalShow}
          onClose={handleDeleteModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
          <form onSubmit={handleSubmit(onDeleteSubmit)} autoComplete='off'>
            <DialogCloseButton onClick={handleDeleteModalClose} disableRipple>
              <i className='bx-x' />
            </DialogCloseButton>
            <div className='flex flex-col items-center justify-center pt-[20px] pb-[20px] px-5'>
              <Typography variant='h5' className='mb-4'>
                Confirm Deletion
              </Typography>
              <Typography className='mb-5'>Are you sure you want to delete this timesheet entry?</Typography>
              <ControlledTextArea
                name={'reason'}
                control={control}
                label={'Reason'}
                placeHolder={'Type a reason for deleting this timelog entry'}
                defaultValue={''}
              />
              <div className='flex gap-4 justify-end mt-5'>
                <Button variant='outlined' color='secondary' onClick={handleDeleteModalClose}>
                  CANCEL
                </Button>
                <Button type='submit' variant='contained' className='bg-red-500 hover:bg-red-600'>
                  DELETE
                </Button>
              </div>
            </div>
          </form>
        </Dialog>
      </FormProvider>
    </>
  )
}

export default ActionButton

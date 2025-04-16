import React from 'react'
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { Visibility } from '@mui/icons-material'

const ActionButton = ({
  handleEdit,
  handleSave,
  handleDelete, // New prop for initiating delete
  handleConfirmDelete, // New prop for confirming delete
  handleCancelDelete, // New prop for canceling delete
  handleActionClick,
  handleCloseMenu,
  handleCancelEdit,
  user,
  selectedUser,
  anchorEl,
  isEditing,
  isDeleting, // New prop to check if in delete mode
  handleViewDetails,
  disabled
}: any) => {
  const isCurrentRowEditing = isEditing && selectedUser?.id === user.id
  const isCurrentRowDeleting = isDeleting && selectedUser?.id === user.id

  if (isCurrentRowEditing) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton
          onClick={() => handleSave(user)}
          color='primary'
          size='small'
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(76, 175, 80, 0.04)'
            }
          }}
        >
          <CheckIcon fontSize='small' />
        </IconButton>
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

  if (isCurrentRowDeleting) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton
          onClick={() => handleConfirmDelete(user)}
          color='primary'
          size='small'
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(76, 175, 80, 0.04)'
            }
          }}
        >
          <CheckIcon fontSize='small' />
        </IconButton>
        <IconButton
          onClick={() => handleCancelDelete()}
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
        <MenuItem onClick={() => handleEdit(user)}>
          <EditIcon sx={{ mr: 1 }} fontSize='small' />
          <Typography className='font-semibold'>Edit</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleDelete(user)}>
          <DeleteIcon sx={{ mr: 1 }} fontSize='small' color='error' />
          <Typography className='font-semibold'>Delete</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleViewDetails(user)} disabled={!!user.subRows && user.subRows.length > 0}>
          <Visibility sx={{ mr: 1 }} fontSize='small' />
          <Typography className='font-semibold'>View Details</Typography>
        </MenuItem>
      </Menu>
    </>
  )
}

export default ActionButton

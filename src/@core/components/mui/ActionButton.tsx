import React from 'react'
import { Box, IconButton, Menu, MenuItem } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

const ActionButton = ({
  handleEdit,
  handleSave,
  handleActionClick,
  handleCloseMenu,
  handleCancelEdit,
  user,
  selectedUser,
  anchorEl,
  isEditing,
  disabled // Add this prop
}: any) => {
  const isCurrentRowEditing = isEditing && selectedUser?.id === user.id

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

  return (
    <>
      <IconButton onClick={e => handleActionClick(e, user)} size='small' disabled={disabled}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && selectedUser?.id === user.id && !isEditing}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleEdit(user)}>
          <EditIcon fontSize='small' sx={{ mr: 1 }} />
        </MenuItem>
      </Menu>
    </>
  )
}

export default ActionButton

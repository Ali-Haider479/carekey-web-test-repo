import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'
import React from 'react'

interface UnassignModalCG_QP_Props {
  openModal: boolean
  handleCancel: () => void
  handleSubmit: () => void
  mode: 'CG' | 'QP'
}

const UnassignModalCG_QP: React.FC<UnassignModalCG_QP_Props> = ({ openModal, handleCancel, handleSubmit, mode }) => {
  return (
    <Dialog
      open={openModal}
      onClose={handleCancel}
      aria-labelledby='delete-dialog-title'
      aria-describedby='delete-dialog-description'
    >
      <DialogTitle id='delete-dialog-title'>Confirm Unassign</DialogTitle>
      <DialogContent>
        <DialogContentText id='delete-dialog-description'>
          {`Are you sure you want to unassign this ${mode === 'CG' ? 'caregiver' : 'qualified professional'}?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color='primary'>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color='error' autoFocus>
          Unassign
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UnassignModalCG_QP

import React from 'react'
import { Alert, Snackbar } from '@mui/material'

type Props = {
  AlertProps: { message: string; status?: number; severity: any }
  openAlert: boolean
  setOpenAlert: any
}

export default function CustomAlert({ AlertProps, openAlert, setOpenAlert }: Props) {
  const handleClose = () => {
    setOpenAlert(false)
  }

  return (
    <div style={{ padding: '0px 20px 20px 20px' }} className='flex justify-center'>
      <Snackbar
        open={openAlert}
        autoHideDuration={10000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={AlertProps?.severity}>
          {AlertProps?.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

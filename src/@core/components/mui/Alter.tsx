import React from 'react'
import { Alert, Snackbar } from '@mui/material'

type Props = {
  AlertProps: {
    message: string
    status?: number
    severity: any
  }
  openAlert: boolean
  setOpenAlert: (open: boolean) => void
  style?: React.CSSProperties // Optional style prop
}

export default function CustomAlert({ AlertProps, openAlert, setOpenAlert, style }: Props) {
  const handleClose = () => {
    setOpenAlert(false)
  }

  // Default styles defined separately
  const defaultStyles: React.CSSProperties = {
    padding: '0px 20px 20px 20px'
  }

  // Use provided style if it exists, otherwise use defaultStyles
  const appliedStyles = style !== undefined ? style : defaultStyles

  return (
    <div style={appliedStyles} className='flex justify-center'>
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

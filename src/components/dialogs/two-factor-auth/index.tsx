'use client'

// React Imports
import { useState } from 'react'
import type { ChangeEvent } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

// Type Imports
import type { CustomInputHorizontalData } from '@core/components/custom-inputs/types'

// Component Imports
import CustomInputHorizontal from '@core/components/custom-inputs/Horizontal'
import CustomTextField from '@core/components/mui/TextField'
import DialogCloseButton from '../DialogCloseButton'

type TwoFactorAuthProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

const data: CustomInputHorizontalData[] = [
  {
    title: (
      <div className='flex items-center gap-1'>
        <i className='bx-cog text-xl' />
        <Typography variant='h6'>Authenticator Apps</Typography>
      </div>
    ),
    value: 'app',
    isSelected: true,
    content: 'Get code from an app like Google Authenticator or Microsoft Authenticator.'
  },
  {
    title: (
      <div className='flex items-center gap-1'>
        <i className='bx-message text-xl' />
        <Typography variant='h6'>SMS</Typography>
      </div>
    ),
    value: 'sms',
    content: 'We will send a code via SMS if you need to use your backup login method.'
  }
]

const SMSDialog = (handleAuthDialogClose: () => void) => {
  return (
    <>
      <DialogTitle variant='h5' className='flex flex-col gap-2 sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Verify Your Mobile Number for SMS
        <Typography component='span' className='flex flex-col'>
          Enter your mobile phone number with country code and we will send you a verification code.
        </Typography>
      </DialogTitle>
      <DialogContent className='overflow-visible pbs-0 pbe-6 sm:pli-16'>
        <CustomTextField fullWidth type='number' label='Mobile Number' placeholder='202 555 0111' />
      </DialogContent>
      <DialogActions className='pbs-0 sm:pbe-16 sm:pli-16'>
        <Button variant='tonal' type='reset' color='secondary' onClick={handleAuthDialogClose}>
          Cancel
        </Button>
        <Button color='success' variant='contained' type='submit' onClick={handleAuthDialogClose}>
          Submit
        </Button>
      </DialogActions>
    </>
  )
}

const AppDialog = (handleAuthDialogClose: () => void) => {
  return (
    <>
      <DialogTitle variant='h4' className='text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Add Authenticator App
      </DialogTitle>
      <DialogContent className='flex flex-col gap-6 pbs-0 sm:pli-16'>
        <div className='flex flex-col gap-2'>
          <Typography variant='h5'>Authenticator Apps</Typography>
          <Typography>
            Using an authenticator app like Google Authenticator, Microsoft Authenticator, Authy, or 1Password, scan the
            QR code. It will generate a 6 digit code for you to enter below.
          </Typography>
        </div>
        <div className='flex justify-center'>
          <img alt='qr-code' height={150} width={150} src='/images/misc/barcode.png' />
        </div>
        <div className='flex flex-col gap-4'>
          <Alert severity='warning' icon={false}>
            <AlertTitle>ASDLKNASDA9AHS678dGhASD78AB</AlertTitle>
            If you having trouble using the QR code, select manual entry on your app
          </Alert>
          <CustomTextField fullWidth label='Enter Authentication Code' placeholder='123 456' />
        </div>
      </DialogContent>
      <DialogActions className='pbs-0 sm:pbe-16 sm:pli-16'>
        <Button variant='tonal' type='reset' color='secondary' onClick={handleAuthDialogClose}>
          Cancel
        </Button>
        <Button color='success' variant='contained' type='submit' onClick={handleAuthDialogClose}>
          Submit
        </Button>
      </DialogActions>
    </>
  )
}

const TwoFactorAuth = ({ open, setOpen }: TwoFactorAuthProps) => {
  // Vars
  const initialSelectedOption: string = data.filter(item => item.isSelected)[
    data.filter(item => item.isSelected).length - 1
  ].value

  // States
  const [authType, setAuthType] = useState<string>(initialSelectedOption)
  const [showAuthDialog, setShowAuthDialog] = useState<boolean>(false)

  const handleClose = () => {
    setOpen(false)

    if (authType !== 'app') {
      setAuthType('app')
    }
  }

  const handleAuthDialogClose = () => {
    setShowAuthDialog(false)
    setShowAuthDialog(false)

    if (authType !== 'app') {
      setTimeout(() => {
        setAuthType('app')
      }, 250)
    }
  }

  const handleOptionChange = (prop: string | ChangeEvent<HTMLInputElement>) => {
    if (typeof prop === 'string') {
      setAuthType(prop)
    } else {
      setAuthType((prop.target as HTMLInputElement).value)
    }
  }

  return (
    <>
      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={handleClose} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          Select Authentication Method
          <Typography component='span' className='flex flex-col text-center'>
            You also need to select a method by which the proxy authenticates to the directory serve.
          </Typography>
        </DialogTitle>
        <DialogContent className='pbs-0 sm:pli-16'>
          <Grid container spacing={6}>
            {data.map((item, index) => (
              <CustomInputHorizontal
                key={index}
                type='radio'
                selected={authType}
                handleChange={handleOptionChange}
                data={item}
                gridProps={{ size: { xs: 12 }, sx: { '& > div': { borderWidth: 2 } } }}
                name='auth-method'
              />
            ))}
          </Grid>
        </DialogContent>
        <DialogActions className='pbs-0 sm:pbe-16 sm:pli-16 flex justify-center'>
          <Button
            variant='contained'
            onClick={() => {
              setOpen(false)
              setShowAuthDialog(true)
            }}
            className='capitalize'
          >
            Continue
          </Button>
          <Button variant='tonal' color='secondary' onClick={handleClose} className='capitalize'>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth='md'
        scroll='body'
        open={showAuthDialog}
        onClose={handleAuthDialogClose}
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={handleAuthDialogClose} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <form onSubmit={e => e.preventDefault()}>
          {authType === 'sms' ? SMSDialog(handleAuthDialogClose) : AppDialog(handleAuthDialogClose)}
        </form>
      </Dialog>
    </>
  )
}

export default TwoFactorAuth

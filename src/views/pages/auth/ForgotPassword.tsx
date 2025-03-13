'use client'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { styled, useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import Link from 'next/link'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import CustomAlert from '@/@core/components/mui/Alter'
import { useState } from 'react'
import CareKeyLogoDark from '@/@core/svg/LogoDark'
import CareKeyLogoLight from '@/@core/svg/LogoLight'
import ForgotPasswordPageSVG from '../../../../public/assets/icons/ForgotPasswordSVG'
import axios, { AxiosResponse } from 'axios'
import { Grid2 as Grid } from '@mui/material'

// Styled Custom Components
const ForgotPasswordIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 650,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const ForgotPassword = () => {
  // Hooks
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const theme = useTheme()
  const dark = theme.palette.mode === 'dark'

  // States
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response: AxiosResponse<{ message: string }> = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      setMessage(response.data.message)
      setError('')
      setAlertProps({ severity: 'success', message: response.data.message })
      setAlertOpen(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
      setMessage('')
      setAlertProps({ severity: 'error', message: err.response?.data?.message || 'Something went wrong' })
      setAlertOpen(true)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <ForgotPasswordPageSVG />
        <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          {dark ? <CareKeyLogoDark /> : <CareKeyLogoLight />}
          {/* <Link
            href={getLocalizedUrl('/', locale as Locale)}
            className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'
          >
            <Logo />
          </Link> */}
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Forgot Password 🔒</Typography>
            <Typography>Enter your email and we'll send you instructions to reset your password</Typography>
          </div>
          <Grid className='flex flex-col gap-6'>
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-6'>
              <CustomTextField
                size='medium'
                autoFocus
                fullWidth
                placeholder='Enter your email'
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Button fullWidth variant='contained' type='submit'>
                Send reset link
              </Button>
              <Typography className='text-center' color='primary.main'>
                <Link
                  href={getLocalizedUrl('/pages/auth/login-v2', locale as Locale)}
                  className='flex items-center justify-center gap-1'
                >
                  <DirectionalIcon ltrIconClass='bx-chevron-left' rtlIconClass='bx-chevron-right' className='text-xl' />
                  <span>Back to Login</span>
                </Link>
              </Typography>
            </form>
          </Grid>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

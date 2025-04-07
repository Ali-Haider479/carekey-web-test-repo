// pages/en/auth/reset-password-v2/[token].tsx
'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import classnames from 'classnames'
import { Typography, Button, useTheme, IconButton, InputAdornment } from '@mui/material'
import { useSettings } from '@/@core/hooks/useSettings'
import { getLocalizedUrl } from '@/utils/i18n'
import Link from 'next/link'
import CustomAlert from '@/@core/components/mui/Alter'
import ResetPasswordPageSVG from '../../../../public/assets/icons/ResetPasswordPageSVG'
import CareKeyLogoDark from '@/@core/svg/LogoDark'
import CareKeyLogoLight from '@/@core/svg/LogoLight'
import DirectionalIcon from '@/components/DirectionalIcon'
import CustomTextField from '@/@core/components/mui/TextField'
import Logo from '@components/layout/shared/Logo'
import { useRouter } from 'next/navigation'

interface ResetPasswordProps {
  token: string
  lang: string
}

const ResetPassword = ({ token, lang }: ResetPasswordProps) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()
  const theme = useTheme()
  const dark = theme.palette.mode === 'dark'

  // Handlers
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  // Verify token on page load
  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsLoading(true)
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-token`, // Adjust URL
          { token },
          { headers: { 'Content-Type': 'application/json' } }
        )
        setIsTokenValid(true)
      } catch (error: any) {
        setAlertProps({
          severity: 'error',
          message: error.response?.data?.message || 'Invalid or expired reset link'
        })
        setAlertOpen(true)
        setIsTokenValid(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [token])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setAlertProps({ severity: 'error', message: 'Passwords do not match' })
      setAlertOpen(true)
      return
    }

    if (newPassword.length < 8) {
      setAlertProps({ severity: 'error', message: 'Password must be at least 8 characters' })
      setAlertOpen(true)
      return
    }

    try {
      setIsLoading(true)
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, // Adjust URL
        { token, newPassword },
        { headers: { 'Content-Type': 'application/json' } }
      )

      setAlertProps({ severity: 'success', message: response.data.message })
      setAlertOpen(true)
      setTimeout(() => {
        // window.location.href = getLocalizedUrl('/pages/auth/login-v2', lang)
        router.replace('/pages/auth/CareKeyLogin')
      }, 2000)
    } catch (error: any) {
      setAlertProps({
        severity: 'error',
        message: error.response?.data?.message || 'Failed to reset password'
      })
      setAlertOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  if (!isTokenValid) {
    return (
      <div className='text-center'>
        <Typography variant='h5' color='error' gutterBottom>
          Invalid or expired reset link
        </Typography>
        <Link href={getLocalizedUrl('/pages/auth/login-v2', lang)}>
          <Button variant='contained'>Back to Login</Button>
        </Link>
        <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
      </div>
    )
  }

  return (
    <div className='flex bs-full justify-center items-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          { 'border-ie': settings.skin === 'bordered' }
        )}
      >
        <ResetPasswordPageSVG />
        <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='flex justify-center items-center bs-full !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
          <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
            {dark ? <CareKeyLogoDark /> : <CareKeyLogoLight />}
            {/* <Link
              href={getLocalizedUrl('/', lang)}
              className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'
            >
              <Logo />
            </Link> */}
            <div className='flex flex-col gap-1'>
              <Typography variant='h4'>Reset Password 🔒</Typography>
              <Typography>Your new password must be different from previously used passwords</Typography>
            </div>
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-6'>
              <CustomTextField
                autoFocus
                fullWidth
                label='New Password'
                placeholder='············'
                type={isPasswordShown ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                          <i className={isPasswordShown ? 'bx-hide' : 'bx-show'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
              <CustomTextField
                fullWidth
                label='Confirm Password'
                placeholder='············'
                type={isConfirmPasswordShown ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowConfirmPassword}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isConfirmPasswordShown ? 'bx-hide' : 'bx-show'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
              <Button fullWidth variant='contained' type='submit' disabled={isLoading}>
                {isLoading ? 'Setting...' : 'Set New Password'}
              </Button>
              <Typography className='flex justify-center items-center' color='primary.main'>
                <Link href={getLocalizedUrl('/pages/auth/CareKeyLogin', lang)} className='flex items-center gap-1'>
                  <DirectionalIcon ltrIconClass='bx-chevron-left' rtlIconClass='bx-chevron-right' />
                  <span>Back to Login</span>
                </Link>
              </Typography>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

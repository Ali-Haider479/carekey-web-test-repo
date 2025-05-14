'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'

// Third-Party Imports
import classnames from 'classnames'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import LoginPageSVG from '../../../../public/assets/icons/LoginPageSVG'
import { dark } from '@mui/material/styles/createPalette'
import CareKeyLogoDark from '@/@core/svg/LogoDark'
import CareKeyLogoLight from '@/@core/svg/LogoLight'
import { getSession, signIn } from 'next-auth/react'
import { CircularProgress, Grid2 as Grid } from '@mui/material'
import CustomAlert from '@/@core/components/mui/Alter'
import Logo from '@/@core/svg/Logo'

const CareKeyLogin = () => {
  const router = useRouter()
  // States
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)
  // Hooks
  const { lang: locale } = useParams()
  const { settings } = useSettings()

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const validateEmail = () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!email) {
      setError('Email is required.')
    } else if (!emailPattern.test(email)) {
      setError('Please enter a valid email address!.')
    } else {
      setError('')
    }
  }

  const handleLoginClick = async () => {
    console.log('Login button click values: ', email, password)

    if (!email || !password) {
      setAlertOpen(true)
      setAlertProps({
        message: 'Email and password are required.',
        severity: 'error'
      })
      return
    }

    try {
      setLoading(true)
      const res = await signIn('credentials', {
        redirect: false,
        email: email.toLowerCase(),
        password
      })

      console.log('Login Response:--------- ', res)

      if (res?.status === 200) {
        // Success Case
        // setAlertOpen(true)
        // setAlertProps({
        //   message: 'Login Successful!',
        //   severity: 'success'
        // })

        const session = await getSession()
        console.log('Session Login', session)
        console.log('Tenant Id', session?.user?.tenant?.id)
        if (session?.user?.userRoles?.title === 'Super Admin') {
          setAlertOpen(true)
          setAlertProps({
            message: 'Login Successful!',
            severity: 'success'
          })
          const role = session?.user?.userRoles?.title
          localStorage.setItem('AuthUser', JSON.stringify(session?.user))
          console.log('SESSION ROLEE', session?.user?.userRoles?.title)
          role.includes('Super Admin') || role.includes('Tenant Admin') ? router.push('/') : router.push('/en/apps/rcm')
        } else {
          if (session?.user?.tenant?.status === 'Active') {
            setAlertOpen(true)
            setAlertProps({
              message: 'Login Successful!',
              severity: 'success'
            })
            if (session?.user) {
              const role = session?.user?.userRoles?.title
              localStorage.setItem('AuthUser', JSON.stringify(session?.user))
              console.log('SESSION ROLEE', session?.user?.userRoles?.title)
              role.includes('Super Admin') || role.includes('Tenant Admin')
                ? router.push('/')
                : router.push('/en/apps/rcm')
            }
          } else {
            setAlertOpen(true)
            setAlertProps({
              message: 'Tenant is not Active. Please contact support.',
              severity: 'error'
            })
          }
        }
      } else {
        // Error Case
        setAlertOpen(true)
        const errorMessage =
          res?.status === 401 ? `Credentials provided are not valid. Please try again.\n${res?.error}` : `${res?.error}`

        setAlertProps({
          message: errorMessage,
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('Login Error: ', error)
      setAlertOpen(true)
      setAlertProps({
        message: 'An unexpected error occurred. Please try again later.',
        severity: 'error'
      })
    } finally {
      setLoading(false)
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
        <LoginPageSVG />
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
            <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}! 👋🏻`}</Typography>
            <Typography>Please sign-in to your account</Typography>
          </div>
          <Grid className='flex flex-col gap-6'>
            <CustomTextField
              size='medium'
              autoFocus
              fullWidth
              placeholder='Enter your email or username'
              onChange={handleEmailChange}
              onBlur={validateEmail}
            />
            {error && <Typography className='text-red-500 ml-2'>{error}</Typography>}
            <CustomTextField
              fullWidth
              size='medium'
              placeholder='············'
              type={isPasswordShown ? 'text' : 'password'}
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
              onChange={handlePasswordChange}
            />
            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              <FormControlLabel control={<Checkbox />} label='Remember me' />
              <Typography
                className='text-end'
                color='primary.main'
                component={Link}
                href={getLocalizedUrl('/auth/forgot-password', locale as Locale)}
              >
                Forgot password?
              </Typography>
            </div>
            <Button
              fullWidth
              variant='contained'
              type='submit'
              onClick={handleLoginClick}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color='inherit' /> : null}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Grid>
        </div>
      </div>
    </div>
  )
}

export default CareKeyLogin

'use client'

// React Imports
import { useEffect, useState } from 'react'

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
import { getSession, signIn, useSession } from 'next-auth/react'
import {
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  FormControl,
  FormLabel,
  Grid2 as Grid,
  Radio,
  RadioGroup,
  TextField
} from '@mui/material'
import CustomAlert from '@/@core/components/mui/Alter'
import Logo from '@/@core/svg/Logo'
import axios from 'axios'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import api from '@/utils/api'

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
  const [tenantSelectionModalOpen, setTenantSelectionModalOpen] = useState(false)
  const [tenants, setTenants] = useState<any[]>([])
  const [selectedTenant, setSelectedTenant] = useState<any>()
  const { data: session, update } = useSession()
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredTenants, setFilteredTenants] = useState<any[]>([])
  // Hooks
  const { lang: locale } = useParams()
  const { settings } = useSettings()

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTenants(tenants)
      return
    }

    const searchTermLower = searchTerm.toLowerCase()
    const filtered = tenants.filter(item => item?.companyName?.toLowerCase().includes(searchTermLower))

    setFilteredTenants(filtered)
  }, [searchTerm, tenants])

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
        setAlertOpen(true)
        setAlertProps({
          message: 'Login Successful!',
          severity: 'success'
        })

        const session = await getSession()
        console.log('Session Login', session)
        console.log('Tenant Id', session?.user?.tenant?.id)
        if (session?.user?.userRoles?.title === 'Super Admin') {
          console.log('SESSION ROLE', session?.user?.userRoles?.title)
          const tenantsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tenant`, {
            headers: { Authorization: `Bearer ${session.user.accessToken}` }
          })
          localStorage.setItem('AuthUser', JSON.stringify(session?.user))
          if (tenantsRes.status === 200 && tenantsRes.data.length > 0) {
            setTenants(tenantsRes.data)
            setTenantSelectionModalOpen(true)
          } else {
            const role = session?.user?.userRoles?.title
            console.log('SESSION ROLE', session?.user?.userRoles?.title)
            role.includes('Super Admin') || role.includes('Tenant Admin')
              ? router.push('/')
              : router.push('/en/apps/rcm')
          }
        } else if (session?.user?.userRoles?.title !== 'Super Admin' && !session?.user?.tenant) {
          console.log('SESSION ROLE', session?.user?.userRoles?.title)
          const tenantsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tenant`, {
            headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
          })
          localStorage.setItem('AuthUser', JSON.stringify(session?.user))
          if (tenantsRes.status === 200 && tenantsRes.data.length > 0) {
            setTenants(tenantsRes.data)
            setTenantSelectionModalOpen(true)
          } else {
            console.log('SESSION ROLE', session?.user?.userRoles?.title)
            router.push('/en/apps/caregiver/list')
          }
        } else {
          if (session?.user?.tenant?.status === 'Active' && session?.user) {
            const role = session?.user?.userRoles?.title
            localStorage.setItem('AuthUser', JSON.stringify(session?.user))
            console.log('SESSION ROLE', session?.user?.userRoles?.title)
            role.includes('Super Admin') || role.includes('Tenant Admin')
              ? router.push('/')
              : router.push('/en/apps/rcm')
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

  const handleCancelTenantSelection = () => {
    setSelectedTenant(null)
    setTenantSelectionModalOpen(false)
  }

  const handleSelectedTenant = async () => {
    try {
      if (!authUser?.accessToken) {
        throw new Error('No access token found')
      }

      const newTokenRes = await api.post(`/auth/super-admin/generate-tenant-token`, {
        token: authUser.accessToken,
        tenantId: selectedTenant.id
      })

      const expiresIn = newTokenRes.data.expiresIn
      const expires =
        typeof expiresIn === 'number'
          ? new Date(Date.now() + expiresIn * 1000).toISOString()
          : new Date(expiresIn).toISOString()
      await update({
        user: {
          ...session?.user,
          tenant: selectedTenant,
          accessToken: newTokenRes.data.accessToken,
          refreshToken: newTokenRes.data.refreshToken
        },
        expires
      })
      console.log('Session updated successfully')

      localStorage.setItem(
        'AuthUser',
        JSON.stringify({ ...authUser, tenant: selectedTenant, accessToken: newTokenRes.data.accessToken })
      )
      router.push('/')
      setTenantSelectionModalOpen(false)
    } catch (error) {
      console.error('Session update failed:', error)
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
      <Dialog
        open={tenantSelectionModalOpen}
        onClose={handleCancelTenantSelection}
        aria-labelledby='tenant-selection-modal'
        aria-describedby='tenant-selection-modal'
        sx={{
          '& .MuiDialog-paper': {
            width: '500px', // Fixed width for the dialog
            maxWidth: 'calc(100% - 32px)', // Prevents overflow on mobile
            maxHeight: '90vh', // Ensures dialog doesn't exceed viewport height
            overflow: 'hidden', // Hide overflow (handled internally)
            px: 4, // Horizontal padding
            py: 2, // Vertical padding
            position: 'relative' // For absolute positioning of close button
          }
        }}
      >
        {/* Close Button (positioned absolutely) */}
        <DialogCloseButton
          onClick={handleCancelTenantSelection}
          disableRipple
          sx={{
            position: 'absolute',
            top: 12,
            right: 12
          }}
        >
          <i className='bx-x' />
        </DialogCloseButton>

        {/* Title */}
        <DialogTitle sx={{ pt: 2, pb: 1, pl: 3 }}>Tenant Switching</DialogTitle>

        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: 2, px: 2, alignItems: 'center' }}>
          <Typography variant='h6'>Select Tenant</Typography>
          <TextField
            size='small'
            placeholder='Search by tenant name.'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='bx-search' />
                </InputAdornment>
              )
            }}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{ width: '50%', ml: 'auto' }}
          />
        </Box>

        {/* Radio Group (with scroll if needed) */}
        <FormControl
          sx={{
            width: '100%',
            px: 2,
            pb: 2,
            overflowY: 'auto',
            maxHeight: '40vh'
          }}
        >
          {tenants.length === 0 ? (
            <Typography variant='body2' sx={{ color: 'text.secondary', px: 2 }}>
              No tenants available. Create a tenant first.
            </Typography>
          ) : (
            <>
              {filteredTenants.length === 0 ? (
                <Typography variant='body2' sx={{ color: 'text.secondary', px: 2 }}>
                  No tenants available with such name
                </Typography>
              ) : (
                <RadioGroup
                  value={selectedTenant?.id || authUser?.tenant?.id} // This controls which radio is selected
                >
                  {filteredTenants.map(item => (
                    <FormControlLabel
                      key={item.id}
                      value={item.id} // This should be just the item.id
                      control={<Radio />}
                      label={item.companyName}
                      onChange={() => setSelectedTenant(item)}
                      sx={{
                        mb: 1,
                        '& .MuiTypography-root': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  ))}
                </RadioGroup>
              )}
            </>
          )}
        </FormControl>

        {/* Buttons (aligned to the right) */}
        <div className='flex mt-3 px-2 pb-2 w-full'>
          {authUser.userRoles?.title === 'Super Admin' && (
            <Button variant='contained' size='small' onClick={() => router.push('/')}>
              Continue as Super Admin
            </Button>
          )}
          <div className='flex gap-3 justify-end ml-auto'>
            <Button
              variant='outlined'
              size='small'
              color='secondary'
              onClick={handleCancelTenantSelection}
              sx={{ minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              size='small'
              onClick={handleSelectedTenant}
              disabled={!selectedTenant}
              sx={{ minWidth: 100 }}
            >
              OK
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default CareKeyLogin

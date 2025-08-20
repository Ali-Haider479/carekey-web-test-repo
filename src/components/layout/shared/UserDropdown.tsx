'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import SyncAltIcon from '@mui/icons-material/SyncAlt'

// Third-party Imports
import { signOut, useSession } from 'next-auth/react'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField
} from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import api from '@/utils/api'
import { truncate } from 'node:fs'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const [tenantSelectionModalOpen, setTenantSelectionModalOpen] = useState(false)
  const [tenants, setTenants] = useState<any[]>([])
  const [selectedTenant, setSelectedTenant] = useState<any>()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredTenants, setFilteredTenants] = useState<any[]>([])
  const { data: session, update } = useSession()
  const role = authUser?.userRoles?.title
  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTenants(tenants)
      return
    }

    const searchTermLower = searchTerm.toLowerCase()
    const filtered = tenants.filter(item => item?.companyName?.toLowerCase().includes(searchTermLower))

    setFilteredTenants(filtered)
  }, [searchTerm, tenants])

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(getLocalizedUrl(url, locale as Locale))
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      // Sign out from the app
      await signOut({ callbackUrl: process.env.NEXTAUTH_URL })
    } catch (error) {
      console.error(error)

      // Show above error in a toast like following
      // toastService.error((err as Error).message)
    }
  }

  const handleCancelTenantSelection = () => {
    setSelectedTenant(null)
    setTenantSelectionModalOpen(false)
  }

  const handleSelectedTenant = async (superAdmin: boolean = false) => {
    console.log('superAdmin Bool--->', superAdmin)
    try {
      const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

      if (!authUser?.accessToken) {
        throw new Error('No access token found')
      }

      const newTokenRes = await api.post(`/auth/super-admin/generate-tenant-token`, {
        token: authUser.accessToken,
        tenantId: superAdmin ? null : selectedTenant.id
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
      window.location.href = '/'
      setTenantSelectionModalOpen(false)
    } catch (error) {
      console.error('Session update failed:', error)
    }
  }

  const handleOpenSelectedTenantModal = async () => {
    const tenantsRes = await api.get('/tenant')
    if (tenantsRes.status === 200 && tenantsRes.data.length > 0) {
      setTenants(tenantsRes.data)
      setTenantSelectionModalOpen(true)
    }
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2.5'
      >
        <Avatar
          ref={anchorRef}
          alt={session?.user?.name || ''}
          src={session?.user?.image || ''}
          onClick={handleDropdownOpen}
          className='cursor-pointer'
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-5 gap-2' tabIndex={-1}>
                    <CustomAvatar size={40} alt={session?.user?.userName || ''} src={session?.user?.image || ''} />
                    <div className='flex items-start flex-col'>
                      <Typography variant='h6'>{session?.user?.userName || ''}</Typography>
                      <Typography variant='body2' color='text.disabled'>
                        {session?.user?.emailAddress || ''}
                      </Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  {/* onClick={e => handleDropdownClose(e, '/pages/user-profile')} */}
                  <MenuItem className='gap-3'>
                    <i className='bx-user' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem>
                  {(role?.includes('Tenant Admin') || role?.includes('Super Admin')) && (
                    <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/apps/user-management')}>
                      <i className='bx-cog' />
                      <Typography color='text.primary'>User Management</Typography>
                    </MenuItem>
                  )}

                  {(role?.includes('Super Admin') || authUser?.userRoles?.isSupport) && (
                    <MenuItem
                      className='gap-3'
                      onClick={e => {
                        handleDropdownClose(e)
                        handleOpenSelectedTenantModal()
                      }}
                    >
                      <SyncAltIcon />
                      <Typography color='text.primary'>Switch Tenant</Typography>
                    </MenuItem>
                  )}

                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3' onClick={handleUserLogout}>
                    <i className='bx-power-off' />
                    <Typography color='text.primary'>Logout</Typography>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
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
                <RadioGroup value={selectedTenant?.id || authUser?.tenant?.id}>
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
            <Button
              variant='contained'
              size='small'
              disabled={authUser?.tenant === null || authUser?.tenant === undefined}
              onClick={() => handleSelectedTenant(true)}
            >
              Switch to Super Admin
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
              onClick={() => handleSelectedTenant(false)}
              disabled={!selectedTenant}
              sx={{ minWidth: 100 }}
            >
              OK
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default UserDropdown

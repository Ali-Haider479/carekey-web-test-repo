'use client'
import ReactTable from '@/@core/components/mui/ReactTable'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  FormControl,
  FormControlLabel,
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material'
import { dark } from '@mui/material/styles/createPalette'
import React, { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import api from '@/utils/api'
import CustomAlert from '@/@core/components/mui/Alter'
import { set } from 'date-fns'
import { useForm } from 'react-hook-form'

type Permission = {
  id: number
  name: string
  description: string
}

type RolePermission = {
  id: number
  permission: Permission
}

type Role = {
  id: number
  title: string
  rolePermissions: RolePermission[]
}

type UserManagement = {
  id: number
  adminName: string
  emailAddress: string
  role: string
  privileges: string[]
  status: string
}

interface FormData {
  userName: string
  emailAddress: string
  password: string
  role: any
  customPermissions: number[] // Add this for storing selected permission IDs
}

interface FormErrors {
  [key: string]: string
}

interface UserManagementListProps {
  usersData: UserManagement[]
  fetchInitialData: () => void
  currentPage: number
  setCurrentPage: (page: number) => void
  rolesData: Role[] // Add rolesData prop
  setRolesData: (roles: Role[]) => void // Add setRolesData prop
  setRefreshRoles: (value: boolean) => void
  isLoading: boolean
}

const UserManagementList = ({
  usersData,
  fetchInitialData,
  currentPage,
  setCurrentPage,
  rolesData,
  setRolesData,
  setRefreshRoles,
  isLoading
}: UserManagementListProps) => {
  const theme = useTheme()
  console.log('THEME', theme)
  const [search, setSearch] = useState('')
  const [permissionData, setPermissionData] = useState<any>([])
  const [isModalShow, setIsModalShow] = useState(false)
  const [isSaveButtonLoading, setIsSaveButtonLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()
  const [customRole, setCustomRole] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<Permission[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    emailAddress: '',
    password: '',
    role: '',
    customPermissions: [] // Initialize empty array for custom permissions
  })

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const tenantId = authUser?.tenant?.id
  console.log('tenantId', tenantId)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const rolesUrl = tenantId ? `/role/${tenantId}` : `/role`
    try {
      await Promise.all([api.get(rolesUrl), api.get(`/permission`)]).then(([role, permission]) => {
        const roles = role.data.filter((role: any) => role.id !== 1)
        setRolesData(roles)
        setPermissionData(permission.data)
      })
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  // Update permissions when role changes
  useEffect(() => {
    if (!customRole && formData.role) {
      const selectedRole = rolesData.find(role => role.id === formData.role)
      if (selectedRole) {
        const permissions = selectedRole.rolePermissions.map(rp => rp.permission)
        setSelectedRolePermissions(permissions)
        // Reset custom permissions when selecting a predefined role
        setFormData(prev => ({ ...prev, customPermissions: [] }))
      }
    } else {
      setSelectedRolePermissions([])
    }
  }, [formData.role, rolesData, customRole])

  const handleClickShowPassword = () => setShowPassword(!showPassword)

  const handleBlur = (field: keyof FormData) => () => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))

    if (!formData[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: 'This field is required'
      }))
    }
  }

  const handleChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement | { value: string }>) => {
    const value = event.target.value
    // const restrictedRoles = ['Tenant Admin', 'Super Admin', 'Caregiver', 'Case Manager', 'Qualified Professional']
    // if (restrictedRoles.includes(value)) {
    //   setErrors(prev => ({
    //     ...prev,
    //     [field]: 'This role already exists'
    //   }))
    //   return
    // }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    Object.keys(formData).forEach(key => {
      if (!formData[key as keyof FormData]) {
        newErrors[key] = 'This field is required'
        isValid = false
      }
    })

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.emailAddress && !emailRegex.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Invalid email format'
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = 'This field is required'
      isValid = false
    } else if (formData.password.length < 8) {
      // newErrors.password = 'Password must be at least 8 characters long'
      // isValid = false
      setErrors(prev => ({
        ...prev,
        password: 'Password must be at least 8 characters long'
      }))
    }

    setErrors(newErrors)
    return isValid
  }

  console.log('Auth User Tenant ID', authUser?.tenant?.id)

  const handleSubmit = async (e: React.FormEvent) => {
    setIsSaveButtonLoading(true)
    e.preventDefault()
    if (!validateForm()) {
      return // Stop submission if validation fails
    }
    try {
      let payload

      if (customRole) {
        payload = {
          ...formData,
          tenantId: authUser?.tenant?.id,
          role: formData.role.toString(),
          customRole,
          accountStatus: 'Active',
          joinDate: new Date().toISOString(),
          emailAddress: formData.emailAddress.toLowerCase(),
          ...(!authUser.tenant ? { isSupport: true } : { isSupport: false })
        }
        console.log('IF SECTION PAYLOAD', payload)
      } else {
        payload = {
          ...formData,
          tenantId: authUser?.tenant?.id,
          role: Number(formData.role),
          customRole,
          accountStatus: 'Active',
          joinDate: new Date().toISOString(),
          emailAddress: formData.emailAddress.toLowerCase()
        }
        console.log('ELSE SECTION PAYLOAD', payload)
      }
      const response = await api.post(`/user/user-management`, payload)
      await fetchData()
      setIsModalShow(false)
      fetchInitialData()
      setFormData({
        userName: '',
        emailAddress: '',
        password: '',
        role: '',
        customPermissions: []
      })
      setRefreshRoles(true)
    } catch (error: any) {
      console.log('Inside catch block')
      console.log('ERROR', error)

      if (
        error.response?.data?.message?.includes('Email already exists') &&
        error.response?.data?.message?.includes('Role already exists')
      ) {
        setErrors(prev => ({
          ...prev,
          emailAddress: 'Email already exists',
          role: 'Role already exists'
        }))
      }

      if (error.response?.data?.message?.includes('Email already exists')) {
        setErrors(prev => ({
          ...prev,
          emailAddress: 'Email already exists'
        }))
      } else if (error.response?.data?.message?.includes('Role already exists')) {
        setErrors(prev => ({
          ...prev,
          role: 'Role already exists'
        }))
      } else {
        setAlertOpen(true)
        setAlertProps({
          message: 'An unexpected error occurred. Please try again later.',
          severity: 'error'
        })
      }
    } finally {
      setIsSaveButtonLoading(false)
    }
  }

  const handlePermissionChange = (event: SelectChangeEvent<number[]>) => {
    const selectedIds = event.target.value as number[]
    setFormData(prev => ({
      ...prev,
      customPermissions: selectedIds
    }))

    // Update the displayed permissions
    const selectedPermissions = permissionData.filter((permission: Permission) => selectedIds.includes(permission.id))
    setSelectedRolePermissions(selectedPermissions)
    setOpen(false)
  }

  const handleModalClose = () => {
    setIsModalShow(false)
    setFormData({
      userName: '',
      emailAddress: '',
      password: '',
      role: '',
      customPermissions: []
    })
    setSelectedRolePermissions([])
    setErrors({})
    setTouched({})
    setCustomRole(false)
  }
  // Your existing columns and sample data...

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: '#A081D6'
      }
    },
    '& .MuiInputLabel-root': {
      '&.Mui-focused': {
        color: '#5C2AAE'
      }
    }
  }
  /////////////////////////////////

  const handleRemovePermission = (permissionId: number) => {
    const updatedPermissions = formData.customPermissions.filter(id => id !== permissionId)
    setFormData(prev => ({
      ...prev,
      customPermissions: updatedPermissions
    }))

    // Update the displayed permissions
    const remainingPermissions = selectedRolePermissions.filter(permission => permission.id !== permissionId)
    setSelectedRolePermissions(remainingPermissions)
  }

  const columns = [
    {
      id: 'adminName',
      label: 'NAME',
      minWidth: 170,
      render: (params: any) => {
        return (
          <Typography className={`${dark ? 'text-[#7112B7]' : 'text-[#4B0082]'} text-sm font-normal`}>
            {params?.userName}
          </Typography>
        )
      }
    },
    {
      id: 'emailAddress',
      label: 'EMAIL ADDRESS',
      minWidth: 170
    },
    {
      id: 'role',
      label: 'ROLE',
      minWidth: 170,
      render: (params: any) => {
        return (
          <Typography className={`${dark ? 'text-[#7112B7]' : 'text-[#4B0082]'} text-sm font-normal`}>
            {params?.role?.title}
          </Typography>
        )
      }
    },
    {
      id: 'privileges',
      label: 'PRIVILEGES',
      minWidth: 170,
      render: (params: any) => {
        // Extract the first two permissions and the remaining ones
        const privileges = params?.role?.rolePermissions?.map((rolePermission: any) => rolePermission.permission.name)
        const firstTwoPrivileges = privileges?.slice(0, 2) // First two permissions
        const remainingPrivilegesCount = privileges?.length - 2 // Count of remaining permissions

        if (remainingPrivilegesCount > 0) {
          return (
            <Tooltip
              placement='top'
              arrow
              color='white'
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor: theme.palette.mode === 'dark' ? '#333447' : '#fafafc'
                  }
                },
                arrow: {
                  sx: {
                    color: theme.palette.mode === 'dark' ? '#333447' : '#fafafc'
                  }
                }
              }}
              title={
                <div>
                  <Typography
                    className={`${theme.palette.mode === 'dark' ? 'text-gray-400' : 'text-[#626970]'} font-semibold`}
                    font-semibold
                  >
                    Remaining Privileges:
                  </Typography>
                  {privileges?.slice(2).map((privilege: any, index: any) => (
                    <Typography
                      className={`${theme.palette.mode === 'dark' ? 'text-gray-400' : 'text-[#626970]'}`}
                      key={`tooltip-privilege-${index}`}
                    >
                      {privilege}
                    </Typography>
                  ))}
                </div>
              }
            >
              <Grid key={`privileges-${params.id}`} className='flex flex-row gap-2 mt-2'>
                {firstTwoPrivileges?.map((privilege: string, index: number) => (
                  <div
                    key={`privilege-${index}-${privilege}`}
                    className='px-1 border border-[#666CFF] border-opacity-[50%] rounded-sm'
                  >
                    <Typography className={`${dark ? 'text-[#7112B7]' : 'text-[#4B0082]'}`}>{privilege}</Typography>
                  </div>
                ))}
                {/* Show remaining privileges count if there are more than two */}
                {remainingPrivilegesCount > 0 && (
                  <div className='px-1 border border-[#666CFF] border-opacity-[50%] rounded-sm'>
                    <Typography className={`${dark ? 'text-[#7112B7]' : 'text-[#4B0082]'}`}>
                      + {remainingPrivilegesCount} more
                    </Typography>
                  </div>
                )}
              </Grid>
            </Tooltip>
          )
        } else {
          return (
            <Grid key={`privileges-${params.id}`} className='flex flex-row gap-2 mt-2'>
              {privileges?.map((privilege: string, index: number) => (
                <div
                  key={`privilege-${index}-${privilege}`}
                  className='px-1 border border-[#666CFF] border-opacity-[50%] rounded-sm'
                >
                  <Typography className={`${dark ? 'text-[#7112B7]' : 'text-[#4B0082]'}`}>{privilege}</Typography>
                </div>
              ))}
            </Grid>
          )
        }
      }
    },
    {
      id: 'accountStatus',
      label: 'STATUS',
      minWidth: 170,
      renderCell: (params: any) => {
        return (
          <Typography
            className={`${params.accountStatus === 'Active' ? 'bg-[#72E1281F] text-[#67C932]' : 'bg-[#FF4D491F] text-[#E8381A]'} rounded-2xl px-2 mt-3 w-[fit-content]`}
          >
            {params.accountStatus}
          </Typography>
        )
      }
    }
    // {
    //   id: 'action',
    //   label: 'ACTION',
    //   flex: 0.2,
    //   renderCell: (params: any) => {
    //     return (
    //       <IconButton>
    //         <MoreVert />
    //       </IconButton>
    //     )
    //   }
    // }
  ]

  const renderPermissionsSection = () => {
    if (customRole) {
      return (
        <Grid size={{ xs: 12, sm: 12 }}>
          <FormControl fullWidth className='relative'>
            <InputLabel>Select Permissions</InputLabel>
            <Select
              multiple
              fullWidth
              value={formData.customPermissions}
              label='Select Permissions'
              onChange={handlePermissionChange}
              // input={<OutlinedInput label='Select Permissions' placeholder='Select Permissions' />}
              onBlur={handleBlur('customPermissions')}
              error={touched.customPermissions && !!errors.customPermissions}
              // helperText={touched.customPermissions && errors.customPermissions}
              sx={textFieldSx}
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              required={true}
            >
              {permissionData.map((permission: Permission) => (
                <MenuItem key={permission.id} value={permission.id}>
                  {permission.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box className='flex flex-wrap gap-2 mt-2'>
            {selectedRolePermissions.map(permission => (
              <Chip
                key={permission.id}
                label={permission.name}
                onDelete={() => handleRemovePermission(permission.id)}
                deleteIcon={<CloseIcon className='text-sm text-[#4B0082] border-[1px] border-[#4B0082] rounded' />}
                className='mt-2 text-[#4B0082] bg-[#e3e4fb] text-sm py-1'
                // aria-label={`Remove ${selectedActivity?.title}`}
              />
            ))}
          </Box>
        </Grid>
      )
    } else {
      return (
        <Grid size={{ xs: 12, sm: 12 }}>
          {selectedRolePermissions.length > 0 && (
            <Typography variant='subtitle2' color='textSecondary' className='mb-2'>
              Role Permissions
            </Typography>
          )}
          <div className='flex flex-wrap gap-2'>
            {selectedRolePermissions.map(permission => (
              <Chip key={permission.id} label={permission.name} className='bg-[#e3e4fb] text-[#4B0082]' />
            ))}
          </div>
        </Grid>
      )
    }
  }

  return (
    <div>
      <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
      <Card>
        <Grid container spacing={2} alignItems='center' sx={{ mb: 2, p: 10 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder='Search name, email address'
              variant='outlined'
              size='small'
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                endAdornment: (
                  <span style={{ color: '#757575', marginLeft: '8px', marginTop: 8 }}>
                    <i className='bx-search' />
                  </span>
                )
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              onClick={() => setIsModalShow(true)}
              variant='contained'
              sx={{ backgroundColor: '#4B0082', color: '#fff', fontWeight: 'bold' }}
            >
              ADD USER
            </Button>
          </Grid>
        </Grid>
        <div style={{ overflowX: 'auto' }}>
          {isLoading ? (
            <div className='flex items-center justify-center p-10'>
              <CircularProgress />
            </div>
          ) : (
            <ReactTable
              columns={columns}
              data={usersData}
              keyExtractor={user => user.id.toString()}
              enablePagination
              pageSize={25}
              stickyHeader
              maxHeight={600}
              containerStyle={{ borderRadius: 2 }}
              page={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </Card>
      <div>
        <Dialog
          open={isModalShow}
          onClose={handleModalClose}
          closeAfterTransition={false}
          sx={{
            '& .MuiDialog-paper': {
              width: '100%',
              maxWidth: '87vh', // Adjust as needed
              maxHeight: '85vh', // Limit modal height to 80% of viewport height
              overflow: 'visible',
              borderRadius: '8px',
              padding: '3px'
            }
          }}
        >
          <DialogCloseButton onClick={handleModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center pt-[10px] pb-[5px] w-full px-5'>
            <form onSubmit={handleSubmit} autoComplete='off'>
              <div>
                <h2 className='text-xl font-semibold mt-10 mb-6'>Add User</h2>
              </div>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 12 }}>
                  <div className='flex items-center gap-3 justify-end'>
                    {/* <Typography>Custom Role</Typography> */}
                    <FormControlLabel
                      control={
                        <Switch
                          checked={customRole}
                          onChange={() => {
                            setCustomRole(!customRole)
                            setFormData({ ...formData, role: '' })
                          }}
                          name='gilad'
                        />
                      }
                      label='Custom Role'
                    />
                  </div>
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <TextField
                    fullWidth
                    required
                    label='Name'
                    placeholder='John'
                    value={formData.userName}
                    onChange={handleChange('userName')}
                    onBlur={handleBlur('userName')}
                    error={touched.userName && !!errors.userName}
                    helperText={touched.userName && errors.userName}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <TextField
                    fullWidth
                    required
                    type='email'
                    label='Email Address'
                    placeholder='admin@example.com'
                    value={formData.emailAddress}
                    onChange={handleChange('emailAddress')}
                    onBlur={handleBlur('emailAddress')}
                    error={touched.emailAddress && !!errors.emailAddress}
                    helperText={touched.emailAddress && errors.emailAddress}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <TextField
                    fullWidth
                    required
                    type={showPassword ? 'text' : 'password'}
                    label='Password'
                    placeholder='********'
                    value={formData.password}
                    onChange={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                    sx={textFieldSx}
                    inputProps={{
                      minLength: 8 // Add minimum length requirement
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                            edge='end'
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  {customRole ? (
                    <TextField
                      fullWidth
                      required
                      label='Role'
                      placeholder='Type Role'
                      value={formData.role}
                      onChange={handleChange('role')}
                      onBlur={handleBlur('role')}
                      error={touched.role && !!errors.role}
                      helperText={touched.role && errors.role}
                      sx={textFieldSx}
                    />
                  ) : (
                    <TextField
                      select
                      fullWidth
                      required
                      label='Role'
                      placeholder='Select Role'
                      value={formData.role}
                      onChange={handleChange('role')}
                      onBlur={handleBlur('role')}
                      error={touched.role && !!errors.role}
                      helperText={touched.role && errors.role}
                      sx={textFieldSx}
                    >
                      {rolesData
                        .filter(role => role.title !== 'Caregiver')
                        .map(role => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.title}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                </Grid>
                {renderPermissionsSection()}
              </Grid>
              <div className='flex gap-4 justify-end mt-5 mb-4'>
                <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                  CANCEL
                </Button>
                <Button
                  startIcon={isSaveButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
                  disabled={isSaveButtonLoading === true}
                  type='submit'
                  variant='contained'
                  className='bg-[#4B0082]'
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </Dialog>
      </div>
    </div>
  )
}

export default UserManagementList

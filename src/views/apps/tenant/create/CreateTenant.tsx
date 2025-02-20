'use client'

import { useState, FormEvent } from 'react'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { TextField, Button, InputAdornment, IconButton } from '@mui/material'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Visibility, VisibilityOff } from '@mui/icons-material'

type Props = {
  open: boolean
}

interface FormData {
  firstName: string
  lastName: string
  emailAddress: string
  password: string
  companyName: string
  billingEmail: string
  contactNumber: string
  address: string
  npiUmpiNumber: string
  taxonomyNumber: string
  einNumber: string
  faxNumber: string
}

interface FormErrors {
  [key: string]: string
}

const CreateTenant = (props: Props) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    emailAddress: '',
    password: '',
    companyName: '',
    billingEmail: '',
    contactNumber: '',
    address: '',
    npiUmpiNumber: '',
    taxonomyNumber: '',
    einNumber: '',
    faxNumber: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
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
    if (formData.billingEmail && !emailRegex.test(formData.billingEmail)) {
      newErrors.billingEmail = 'Invalid email format'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      console.log('Form submitted with data:', { roleId: 2, ...formData })
    } else {
      console.log('Form has errors')
      // Mark all fields as touched to show errors
      const allTouched: { [key: string]: boolean } = {}
      Object.keys(formData).forEach(key => {
        allTouched[key] = true
      })
      setTouched(allTouched)
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tenant`, { roleId: 2, ...formData })
      console.log('RESPONSE TENANT', response)
      const payload = {
        startDate: new Date(),
        endDate: null,
        tenantId: response?.data?.id,
        numberOfWeeks: 1
      }
      const payperiod = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/pay-period`, payload)
      console.log('Payperiod res', payperiod)
      router.replace(`/apps/accounts//tenant-list`)
    } catch (error) {
      console.log('ERROR', error)
    }
  }

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

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
      <Card>
        <CardHeader title='Tenant/Accounts' titleTypographyProps={{ sx: { fontSize: '24px' } }} />
        <CardContent>
          <div className='pb-24 p-0'>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  label='Admin First Name'
                  placeholder='John'
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  error={touched.firstName && !!errors.firstName}
                  helperText={touched.firstName && errors.firstName}
                  sx={textFieldSx}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  label='Admin Last Name'
                  placeholder='Doe'
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  error={touched.lastName && !!errors.lastName}
                  helperText={touched.lastName && errors.lastName}
                  sx={textFieldSx}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  type='email'
                  label='Admin Email Address'
                  placeholder='admin@example.com'
                  value={formData.emailAddress}
                  onChange={handleChange('emailAddress')}
                  onBlur={handleBlur('emailAddress')}
                  error={touched.emailAddress && !!errors.emailAddress}
                  helperText={touched.emailAddress && errors.emailAddress}
                  sx={textFieldSx}
                />
              </Grid>

              {/* Add similar TextField components for remaining fields */}
              {/* Password */}
              <Grid size={{ xs: 12, md: 4 }}>
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          aria-label='toggle password visibility'
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge='end'
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              {/* Company Name */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  label='Company Name'
                  placeholder='Tenant'
                  value={formData.companyName}
                  onChange={handleChange('companyName')}
                  onBlur={handleBlur('companyName')}
                  error={touched.companyName && !!errors.companyName}
                  helperText={touched.companyName && errors.companyName}
                  sx={textFieldSx}
                />
              </Grid>

              {/* Address */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  label='Company Address'
                  placeholder='123 innovation, suite 20'
                  value={formData.address}
                  onChange={handleChange('address')}
                  onBlur={handleBlur('address')}
                  error={touched.address && !!errors.address}
                  helperText={touched.address && errors.address}
                  sx={textFieldSx}
                />
              </Grid>

              {/* NPI/UMPI Number */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  label='NPI/UMPI Number'
                  placeholder='123456789'
                  value={formData.npiUmpiNumber}
                  onChange={handleChange('npiUmpiNumber')}
                  onBlur={handleBlur('npiUmpiNumber')}
                  error={touched.npiUmpiNumber && !!errors.npiUmpiNumber}
                  helperText={touched.npiUmpiNumber && errors.npiUmpiNumber}
                  sx={textFieldSx}
                />
              </Grid>

              {/* Taxonomy */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  label='Taxonomy'
                  placeholder='123456789'
                  value={formData.taxonomyNumber}
                  onChange={handleChange('taxonomyNumber')}
                  onBlur={handleBlur('taxonomyNumber')}
                  error={touched.taxonomyNumber && !!errors.taxonomyNumber}
                  helperText={touched.taxonomyNumber && errors.taxonomyNumber}
                  sx={textFieldSx}
                />
              </Grid>

              {/* EIN */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  label='EIN'
                  placeholder='123456789'
                  value={formData.einNumber}
                  onChange={handleChange('einNumber')}
                  onBlur={handleBlur('einNumber')}
                  error={touched.einNumber && !!errors.einNumber}
                  helperText={touched.einNumber && errors.einNumber}
                  sx={textFieldSx}
                />
              </Grid>

              {/* Company Email */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  type='email'
                  label='Company Email Address'
                  placeholder='user@company.com'
                  value={formData.billingEmail}
                  onChange={handleChange('billingEmail')}
                  onBlur={handleBlur('billingEmail')}
                  error={touched.billingEmail && !!errors.billingEmail}
                  helperText={touched.billingEmail && errors.billingEmail}
                  sx={textFieldSx}
                />
              </Grid>

              {/* Phone Number */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  label='Company Phone Number'
                  placeholder='+1 202 555 0111'
                  value={formData.contactNumber}
                  onChange={handleChange('contactNumber')}
                  onBlur={handleBlur('contactNumber')}
                  error={touched.contactNumber && !!errors.contactNumber}
                  helperText={touched.contactNumber && errors.contactNumber}
                  sx={textFieldSx}
                />
              </Grid>

              {/* Fax Number */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  required
                  label='Company FAX Number'
                  placeholder='+1 555 0111'
                  value={formData.faxNumber}
                  onChange={handleChange('faxNumber')}
                  onBlur={handleBlur('faxNumber')}
                  error={touched.faxNumber && !!errors.faxNumber}
                  helperText={touched.faxNumber && errors.faxNumber}
                  sx={textFieldSx}
                />
              </Grid>
            </Grid>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Grid container spacing={2} justifyContent='space-between' alignItems='center'>
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => {
                setFormData({
                  firstName: '',
                  lastName: '',
                  emailAddress: '',
                  password: '',
                  companyName: '',
                  billingEmail: '',
                  contactNumber: '',
                  address: '',
                  npiUmpiNumber: '',
                  taxonomyNumber: '',
                  einNumber: '',
                  faxNumber: ''
                })
                setErrors({})
                setTouched({})
              }}
            >
              Cancel
            </Button>
            <Button variant='contained' type='submit' sx={{ backgroundColor: '#4B0082' }}>
              Submit
            </Button>
          </Grid>
        </CardContent>
      </Card>
    </form>
  )
}

export default CreateTenant

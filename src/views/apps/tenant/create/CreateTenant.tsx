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
import { FormProvider, useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import CustomMaskedInput from '@/@core/components/custom-inputs/CustomMaskedInput'
import api from '@/utils/api'

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
  confirmPassword: string
}

interface FormErrors {
  [key: string]: string
}

const CreateTenant = (props: Props) => {
  // const [formData, setFormData] = useState<FormData>({
  //   firstName: '',
  //   lastName: '',
  //   emailAddress: '',
  //   password: '',
  //   companyName: '',
  //   billingEmail: '',
  //   contactNumber: '',
  //   address: '',
  //   npiUmpiNumber: '',
  //   taxonomyNumber: '',
  //   einNumber: '',
  //   faxNumber: '',
  //   confirmPassword: ''
  // })

  const methods = useForm<FormData>({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  const {
    control,
    formState: { errors },
    handleSubmit, // Add this if you want to use form submission
    watch,
    reset
  } = methods

  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const emailAddress = watch('emailAddress')
  const billingEmail = watch('billingEmail')

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const validateEmail = () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailPattern.test(emailAddress)) {
      setError('Please enter a valid email address!.')
    } else {
      setError('')
    }
  }

  const validateBillingEmail = () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailPattern.test(billingEmail)) {
      setError('Please enter a valid email address!.')
    } else {
      setError('')
    }
  }

  // const validateForm = (): boolean => {
  //   console.log('inside form validation')
  //   const newErrors: FormErrors = {}
  //   let isValid = true

  //   Object.keys(formData).forEach(key => {
  //     if (!formData[key as keyof FormData]) {
  //       newErrors[key] = 'This field is required'
  //       isValid = false
  //     }
  //   })

  //   // Email validation
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  //   if (formData.emailAddress && !emailRegex.test(formData.emailAddress)) {
  //     newErrors.emailAddress = 'Invalid email format'
  //     isValid = false
  //   }
  //   if (formData.billingEmail && !emailRegex.test(formData.billingEmail)) {
  //     newErrors.billingEmail = 'Invalid email format'
  //     isValid = false
  //   }

  //   return isValid
  // }

  const onSubmit = async (data: any) => {
    const tenantPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      emailAddress: data.emailAddress.toLowerCase(),
      password: data.password,
      companyName: data.companyName,
      billingEmail: data.billingEmail.toLowerCase(),
      contactNumber: data.contactNumber,
      address: data.address,
      npiUmpiNumber: data.npiUmpiNumber,
      taxonomyNumber: data.taxonomynumber,
      einNumber: data.einNumber,
      faxNumber: data.faxNumber
    }
    console.log('inside onSubmit', tenantPayload)
    // e.preventDefault()

    // if (validateForm()) {
    //   console.log('Form submitted with data:', { roleId: 2, ...formData })
    // } else {
    //   console.log('Form has errors')
    //   // Mark all fields as touched to show errors
    //   const allTouched: { [key: string]: boolean } = {}
    //   Object.keys(formData).forEach(key => {
    //     allTouched[key] = true
    //   })
    //   setTouched(allTouched)
    // }

    try {
      const tenantPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: data.emailAddress.toLowerCase(),
        password: data.password,
        companyName: data.companyName,
        billingEmail: data.billingEmail.toLowerCase(),
        contactNumber: data.contactNumber,
        address: data.address,
        npiUmpiNumber: data.npiUmpiNumber,
        taxonomyNumber: data.taxonomynumber,
        einNumber: data.einNumber,
        faxNumber: data.faxNumber,
        roleId: 2
      }
      const response = await api.post(`/tenant`, tenantPayload)
      console.log('RESPONSE TENANT', response)
      const payload = {
        startDate: new Date(),
        endDate: null,
        tenantId: response?.data?.id,
        numberOfWeeks: 1
      }
      const payperiod = await api.post(`/pay-period`, payload)
      console.log('Payperiod res', payperiod)
      router.replace(`/apps/accounts/tenant-list`)
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
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
        <Card>
          <CardHeader title='Tenant/Accounts' titleTypographyProps={{ sx: { fontSize: '24px' } }} />
          <CardContent>
            <div className='pb-24 p-0'>
              <Grid container spacing={5}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label={' Admin First Name'}
                    placeHolder={'John'}
                    name={'firstName'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.firstName}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label={' Admin Last Name'}
                    placeHolder={'John'}
                    name={'lastName'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.lastName}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label={' Admin Email Address'}
                    placeHolder={'John'}
                    name={'emailAddress'}
                    defaultValue={''}
                    type={'email'}
                    error={errors.emailAddress}
                    control={control}
                    onBlur={validateEmail}
                  />
                </Grid>
                {/* Add similar TextField components for remaining fields */}
                {/* Password */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label={'Password'}
                    placeHolder={'********'}
                    name={'password'}
                    defaultValue={''}
                    type={showPassword ? 'text' : 'password'}
                    error={errors.password}
                    control={control}
                    minLength={8}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onClick={handleClickShowPassword}
                              onMouseDown={e => e.preventDefault()}
                            >
                              <i className={showPassword ? 'bx-hide' : 'bx-show'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label={'Confrim Password'}
                    placeHolder={'********'}
                    name={'confirmPassword'}
                    defaultValue={''}
                    type={showConfirmPassword ? 'text' : 'password'}
                    error={errors.confirmPassword}
                    control={control}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onClick={handleClickShowConfirmPassword}
                              onMouseDown={e => e.preventDefault()}
                            >
                              <i className={showConfirmPassword ? 'bx-hide' : 'bx-show'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </Grid>
                {/* Company Name */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label={' Company Name'}
                    placeHolder={'Tenant'}
                    name={'companyName'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.companyName}
                    control={control}
                  />
                </Grid>
                {/* Address */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label={'Company Address'}
                    placeHolder={'123 innovation, suite 20'}
                    name={'address'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.address}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label={'NPI/UMPI Number'}
                    placeHolder={'A-123456789'}
                    name={'npiUmpiNumber'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.npiUmpiNumber}
                    control={control}
                    maxLength={10}
                    minLength={10}
                  />
                </Grid>
                {/* Taxonomy */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label={'Taxonomy'}
                    placeHolder={'123456'}
                    name={'taxonomyNumber'}
                    defaultValue={''}
                    type={'number'}
                    error={errors.taxonomyNumber}
                    control={control}
                  />
                </Grid>
                {/* EIN */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label={'EIN'}
                    placeHolder={'123456'}
                    name={'einNumber'}
                    defaultValue={''}
                    type={'number'}
                    error={errors.einNumber}
                    control={control}
                  />
                </Grid>
                {/* Company Email */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label={'Company Email Address'}
                    placeHolder={'abc@example.com'}
                    name={'billingEmail'}
                    defaultValue={''}
                    type={'email'}
                    error={errors.billingEmail}
                    control={control}
                    onBlur={validateBillingEmail}
                  />
                </Grid>
                {/* Phone Number */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label={'Company Phone Number'}
                    placeHolder={'(123) 456-7890'}
                    name={'contactNumber'}
                    defaultValue={''}
                    type={'number'}
                    isPhoneNumber={true}
                    error={errors.contactNumber}
                    control={control}
                  />
                </Grid>
                {/* Fax Number */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <CustomTextField
                    label={'Company Fax Number'}
                    placeHolder={'(123) 456-7890'}
                    name={'faxNumber'}
                    defaultValue={''}
                    type={'number'}
                    isPhoneNumber={true}
                    error={errors.faxNumber}
                    control={control}
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
                  reset({
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
                    faxNumber: '',
                    confirmPassword: ''
                  })
                  setTouched({})
                  router.replace('/apps/accounts/tenant-list')
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
    </FormProvider>
  )
}

export default CreateTenant

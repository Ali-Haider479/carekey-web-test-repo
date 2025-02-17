'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import CustomTextField from '@core/components/custom-inputs/CustomTextField'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import CustomDropDown from '@core/components/custom-inputs/CustomDropDown'
import { Button, Card, CardContent, IconButton, InputAdornment, InputLabel, Select } from '@mui/material'
import Grid from '@mui/material/Grid2'
import axios from 'axios'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import ControlledTextArea from '@/@core/components/custom-inputs/ControlledTextArea'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

type Props = {
  onFinish: any
  defaultValues: any
}

interface FormDataType {
  // Account Login Information
  userName?: string
  emailAddress?: string
  password?: string
  confirmPassword?: string
  additionalEmailAddress?: string
  accountStatus?: string

  // Assign Client
  clientId?: number
  assignmentDate?: Date | null
  unassignmentDate?: Date | null
  assignmentNotes?: string
  scheduleHours?: number

  // Mailing Address
  address?: string
  city?: string
  state?: string
  zipCode?: string
}
const LoginInfoComponent = forwardRef<{ handleSubmit: any }, Props>(({ onFinish, defaultValues }, ref) => {
  const methods = useForm<FormDataType>({
    // Optional: Add default validation settings
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: defaultValues
  })

  const {
    control,
    formState: { errors },
    register,
    getValues,
    setValue,
    handleSubmit // Add this if you want to use form submission
  } = methods // Use methods instead of useFormContext

  useImperativeHandle(ref, () => ({
    handleSubmit: (onValid: (data: FormDataType) => void) => handleSubmit(onValid)
  }))

  const onSubmit = (data: FormDataType) => {
    console.log('Submitted Data:', data)
    onFinish(data)
  }

  const [clientList, setClientList] = useState<any>()
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [assignmentDate, setAssignmentDate] = useState<Date | null>(null)
  const [unAssignmentDate, setUnAssignmentDate] = useState<Date | null>(null)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const fetchClients = async () => {
    const fetchedClients = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client`)
    console.log('List of all clients --> ', fetchedClients)
    setClientList(fetchedClients)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return (
    <FormProvider {...methods}>
      <Card className='mt-5 w-full'>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Account Login Information */}
            <h2 className='text-xl font-semibold mb-6'>Account Login Information</h2>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 4 }}>
                {/* Username */}
                <CustomTextField
                  label={'Username'}
                  placeHolder={'JohnDoe'}
                  name={'userName'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.userName}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                {/* Email Address */}
                <CustomTextField
                  label={'Email Address'}
                  placeHolder={'john.doe@example.com'}
                  name={'emailAddress'}
                  defaultValue={''}
                  type={'email'}
                  error={errors.emailAddress}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                {/* Password */}
                <CustomTextField
                  label={'Password'}
                  placeHolder={'.....'}
                  name={'password'}
                  defaultValue={''}
                  type={isPasswordShown ? 'text' : 'password'}
                  error={errors.password}
                  control={control}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <i className={isPasswordShown ? 'bx-hide' : 'bx-show'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                {/* Confirm Password */}
                <CustomTextField
                  label={'Confirm Password'}
                  placeHolder={'.....'}
                  name={'confirmPassword'}
                  defaultValue={''}
                  type={isConfirmPasswordShown ? 'text' : 'password'}
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
                            <i className={isConfirmPasswordShown ? 'bx-hide' : 'bx-show'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                {/* Additional Email */}
                <CustomTextField
                  label={'Additional Email Address'}
                  placeHolder={'Enter Additional Email Address'}
                  name={'additionalEmailAddress'}
                  defaultValue={''}
                  type={'email'}
                  error={errors.additionalEmailAddress}
                  control={control}
                  isRequired={false}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                {/* Account Status */}
                <CustomDropDown
                  name={'accountStatus'}
                  control={control}
                  error={errors.accountStatus}
                  label={'Account Status'}
                  optionList={[
                    { key: 1, value: 'Active', optionString: 'Active' },
                    { key: 2, value: 'Inactive', optionString: 'Inactive' }
                  ]}
                  defaultValue={''}
                />
              </Grid>
            </Grid>

            {/* Assign Client */}
            <h2 className='text-xl font-semibold mt-10 mb-6'>Assign Client</h2>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth className='relative' >
                  <InputLabel size='small'>Client</InputLabel>
                  <Select {...register('clientId', { required: false })} name='clientId' label='Client' size='small'>
                    {clientList?.data?.map((item: any) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>
                          {item.firstName} {item.lastName}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <AppReactDatepicker
                  {...register('assignmentDate', { required: false })}
                  selected={getValues('assignmentDate') || assignmentDate}
                  onChange={date => {
                    console.log('Date:', date)
                    setValue('assignmentDate', date)
                    setAssignmentDate(date)
                  }} // Pass the date to react-hook-form
                  placeholderText='MM/DD/YYYY'
                  customInput={
                    <TextField
                      fullWidth
                      size='small'
                      name='assignmentDate'
                      label='Assignment Date'
                      placeholder='MM/DD/YYYY'
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <AppReactDatepicker
                  {...register('unassignmentDate', { required: false })}
                  selected={getValues('unassignmentDate') || unAssignmentDate}
                  onChange={date => {
                    console.log('Date:', date)
                    setValue('unassignmentDate', date)
                    setUnAssignmentDate(date)
                  }} // Pass the date to react-hook-form
                  placeholderText='MM/DD/YYYY'
                  customInput={
                    <TextField
                      fullWidth
                      size='small'
                      name='unassignmentDate'
                      label='Unassignment Date'
                      placeholder='MM/DD/YYYY'
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('scheduleHours', { required: false })}
                  label={'Scheduled Hours'}
                  placeholder={'Scheduled Hours'}
                  name={'scheduleHours'}
                  defaultValue={''}
                  type={'number'}
                  size='small'
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={4} sx={{ marginTop: 4 }}>
              <TextField
                {...register('assignmentNotes', { required: false })}
                label={'Assignment Notes'}
                placeholder={'Assignment Notes'}
                name={'assignmentNotes'}
                defaultValue={''}
                type={'text'}
                size='small'
                fullWidth
                multiline
                rows={4}
              />
            </Grid>

            {/* Mailing Address */}
            <h2 className='text-xl font-semibold mt-10 mb-6'>Mailing Address</h2>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 4 }}>
                {/* Address */}
                <CustomTextField
                  label={'Address'}
                  placeHolder={'Enter Address'}
                  name={'address'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.address}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                {/* City */}
                <CustomTextField
                  label={'City'}
                  placeHolder={'Enter City'}
                  name={'city'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.city}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                {/* State */}
                <CustomTextField
                  label={'State'}
                  placeHolder={'Enter State'}
                  name={'state'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.state}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                {/* ZIP Code */}
                <CustomTextField
                  label={'Zip Code'}
                  placeHolder={'Enter Zip Code'}
                  name={'zipCode'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.zipCode}
                  control={control}
                />
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  )
})

export default LoginInfoComponent

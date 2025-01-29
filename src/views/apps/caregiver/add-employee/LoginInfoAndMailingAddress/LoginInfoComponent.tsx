'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import CustomTextField from '@core/components/custom-inputs/CustomTextField'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import CustomDropDown from '@core/components/custom-inputs/CustomDropDown'
import { Button, Card, CardContent, IconButton, InputAdornment } from '@mui/material'
import Grid from '@mui/material/Grid2'
import axios from 'axios'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import ControlledTextArea from '@/@core/components/custom-inputs/ControlledTextArea'

type Props = {
  onFinish: any
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
  assignmentDate: Date
  unassignmentDate: Date
  assignmentNotes: string
  scheduleHours: number

  // Mailing Address
  address?: string
  city?: string
  state?: string
  zipCode?: string
}
const LoginInfoComponent = forwardRef<{ handleSubmit: any }, Props>(({ onFinish }, ref) => {
  const methods = useForm<FormDataType>({
    // Optional: Add default validation settings
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  useImperativeHandle(ref, () => ({
    handleSubmit: (onValid: (data: FormDataType) => void) => handleSubmit(onValid)
  }))

  const {
    control,
    formState: { errors },
    handleSubmit // Add this if you want to use form submission
  } = methods // Use methods instead of useFormContext

  const onSubmit = (data: FormDataType) => {
    console.log('Submitted Data:', data)
    onFinish(data)
  }

  const [clientList, setClientList] = useState<any>()
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)

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
                <CustomDropDown
                  label='Select a client'
                  optionList={
                    clientList?.data?.map((item: any) => {
                      return {
                        key: `${item.id}-${item.firstName}`,
                        value: item.id,
                        optionString: `${item.firstName} ${item.lastName}`
                      }
                    }) || []
                  }
                  name={'clientId'}
                  control={control}
                  error={errors.clientId}
                  defaultValue={''}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <ControlledDatePicker
                  name={'assignmentDate'}
                  control={control}
                  error={errors.assignmentDate}
                  label={'Assignment Date'}
                  defaultValue={undefined}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <ControlledDatePicker
                  name={'unassignmentDate'}
                  control={control}
                  error={errors.unassignmentDate}
                  label={'Unassignment Date'}
                  defaultValue={undefined}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Scheduled Hours'}
                  placeHolder={'Scheduled Hours'}
                  name={'scheduleHours'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.scheduleHours}
                  control={control}
                />
              </Grid>
            </Grid>
            <Grid container spacing={4} sx={{ marginTop: 4 }}>
              <ControlledTextArea
                name={'assignmentNotes'}
                control={control}
                label={'Assignment Notes'}
                placeHolder={'Assignment Notes'}
                defaultValue={''}
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

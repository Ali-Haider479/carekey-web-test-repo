'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import CustomTextField from '@core/components/custom-inputs/CustomTextField'
import { FormProvider, useForm } from 'react-hook-form'
import CustomDropDown from '@core/components/custom-inputs/CustomDropDown'
import { Card, CardContent, Checkbox, FormLabel, IconButton, InputAdornment, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import axios from 'axios'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import ControlledTextArea from '@/@core/components/custom-inputs/ControlledTextArea'
import { USStates } from '@/utils/constants'
import api from '@/utils/api'

type Props = {
  onFinish: any
  defaultValues: any
  caregiverPersonalInfo: any
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
  enableAssignClient: boolean
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
  mailingAddressCheckbox: boolean
}
const LoginInfoComponent = forwardRef<{ handleSubmit: any }, Props>(
  ({ onFinish, defaultValues, caregiverPersonalInfo }, ref) => {
    const methods = useForm<FormDataType>({
      // Optional: Add default validation settings
      mode: 'onBlur',
      reValidateMode: 'onChange',
      defaultValues: { ...defaultValues, enableAssignClient: false }
    })

    const {
      control,
      formState: { errors },
      register,
      watch,
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

    console.log('Caregiver Personal Info', caregiverPersonalInfo)

    const [clientList, setClientList] = useState<any>()
    const [isPasswordShown, setIsPasswordShown] = useState(false)
    const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
    const [assignmentDate, setAssignmentDate] = useState<Date | null>(null)
    const [unAssignmentDate, setUnAssignmentDate] = useState<Date | null>(null)

    const assignClientEnabled = watch('enableAssignClient')

    const passwordCheck = watch('password')

    const confirmPasswordCheck = watch('confirmPassword')

    const mailingAddressCheckboxEnabled = watch('mailingAddressCheckbox')

    console.log('Mailing address checkbox status --->> ', mailingAddressCheckboxEnabled)

    const handleClickShowPassword = () => setIsPasswordShown(show => !show)

    const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

    const handleEnableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue('enableAssignClient', event.target.checked)

      // If disabling, clear all client-related fields
      if (!event.target.checked) {
        setValue('clientId', undefined)
        setValue('assignmentDate', undefined)
        setValue('unassignmentDate', undefined)
        setValue('scheduleHours', undefined)
        setValue('assignmentNotes', '')
      }
    }

    const handleEnableMailingAddressCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue('mailingAddressCheckbox', event.target.checked)

      if (event.target.checked) {
        setValue('address', caregiverPersonalInfo?.address)
        setValue('city', caregiverPersonalInfo?.city)
        setValue('state', caregiverPersonalInfo?.state)
        setValue('zipCode', caregiverPersonalInfo?.zipCode)
      }

      // If disabling, clear all client-related fields
      if (!event.target.checked) {
        setValue('address', '')
        setValue('city', '')
        setValue('state', '')
        setValue('zipCode', undefined)
      }
    }

    const fetchClients = async () => {
      const fetchedClients = await api.get(`/client`)
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
                {/* <Grid size={{ xs: 12, sm: 4 }}> */}
                {/* Username */}
                {/* <CustomTextField
                    label={'Username'}
                    placeHolder={'JohnDoe'}
                    name={'userName'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.userName}
                    control={control}
                  /> */}
                {/* </Grid> */}

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
                    minLength={8}
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
                    defaultValue={'Active'}
                  />
                </Grid>
              </Grid>

              {/* Assign Client */}
              <div className='flex flex-row justify-between mt-10'>
                <div>
                  <h2 className='text-xl font-semibold mb-6'>Assign Client</h2>
                </div>
                <div>
                  <FormLabel>Enable</FormLabel>
                  <Checkbox
                    {...register('enableAssignClient')}
                    checked={assignClientEnabled}
                    onChange={handleEnableChange}
                  />
                </div>
              </div>

              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomDropDown
                    name={'clientId'}
                    control={control}
                    label={'Client'}
                    error={errors.clientId}
                    optionList={
                      clientList?.data?.map((item: any) => {
                        return {
                          key: `${item?.id}-${item.firstName}`,
                          value: item.id,
                          optionString: `${item.firstName} ${item.lastName}`
                        }
                      }) || []
                    }
                    disabled={!assignClientEnabled}
                    isRequired={!assignClientEnabled ? false : true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <ControlledDatePicker
                    name={'assignmentDate'}
                    control={control}
                    label={'Assignment Date'}
                    defaultValue={undefined}
                    error={errors.assignmentDate}
                    disabled={!assignClientEnabled}
                    isRequired={!assignClientEnabled ? false : true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <ControlledDatePicker
                    name={'unassignmentDate'}
                    control={control}
                    label={'Unassignment Date'}
                    defaultValue={undefined}
                    error={errors.unassignmentDate}
                    disabled={!assignClientEnabled}
                    minDate={watch('assignmentDate') || undefined}
                    isRequired={false}
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
                    disabled={!assignClientEnabled}
                    isRequired={!assignClientEnabled ? false : true}
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
                  disabled={!assignClientEnabled}
                  isRequired={!assignClientEnabled ? false : true}
                />
              </Grid>

              {/* Mailing Address */}
              <div className='flex flex-row justify-between mt-10'>
                <div>
                  <Typography className='text-xl font-semibold mb-4'>Mailing Address</Typography>
                  {/* <h2 className='text-xl font-semibold mb-6'>Assign Caregiver</h2> */}
                </div>
                <div>
                  <FormLabel>Same as primary residential address</FormLabel>
                  <Checkbox
                    {...register('mailingAddressCheckbox')}
                    checked={mailingAddressCheckboxEnabled}
                    onChange={handleEnableMailingAddressCheckboxChange}
                  />
                </div>
              </div>
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
                    disabled={mailingAddressCheckboxEnabled}
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
                    disabled={mailingAddressCheckboxEnabled}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  {/* State */}
                  <CustomDropDown
                    name='state'
                    control={control}
                    error={errors.state}
                    label='State'
                    optionList={USStates.map((state: any) => ({
                      key: state.key,
                      value: state.value,
                      optionString: state.optionString
                    }))}
                    defaultValue={''}
                    disabled={mailingAddressCheckboxEnabled}
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
                    maxLength={5}
                    disabled={mailingAddressCheckboxEnabled}
                  />
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </FormProvider>
    )
  }
)

export default LoginInfoComponent

'use client'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import Grid from '@mui/material/Grid2'
import CustomTextField from '@core/components/custom-inputs/CustomTextField'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
// import AntdDatePickerFeatureMUI from "../shared/AntdDatePickerFeatureMUI";
import CustomRadioButton from '@core/components/custom-inputs/CustomRadioButton'
import { Card, CardContent, InputAdornment, InputLabel, Select, Typography } from '@mui/material'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { PersonalDetailsFormDataType } from './formTypes'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'

type Props = {
  form?: any
  onFinish?: any
  defaultValues: any
}

const PersonalDetailsForm = forwardRef<{ handleSubmit: any }, Props>(({ onFinish, defaultValues }, ref) => {
  const [dischargeDate, setDischargeDate] = useState<Date | null>(null)

  const methods = useForm<PersonalDetailsFormDataType>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: defaultValues || []
  })

  // Expose handleSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: (onValid: (data: PersonalDetailsFormDataType) => void) => handleSubmit(onValid)
  }))

  const {
    control,
    formState: { errors },
    register,
    getValues,
    setValue,
    handleSubmit // Add this if you want to use form submission
  } = methods // Use methods instead of useFormContext

  const onSubmit = (data: PersonalDetailsFormDataType) => {
    console.log('Submitted Data:', data)
    onFinish({ ...data, dateOfDischarge: dischargeDate }) // Pass form data to parent
  }
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Personal Details</Typography>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'First Name'}
                  placeHolder={'John'}
                  name={'firstName'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.firstName}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('middleName', { required: false })}
                  label={'Middle Name'}
                  placeholder={'D'}
                  name={'middleName'}
                  defaultValue={''}
                  type={'text'}
                  size='small'
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Last Name'}
                  placeHolder={'Doe'}
                  name={'lastName'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.lastName}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <ControlledDatePicker
                  name={'admissionDate'}
                  control={control}
                  error={errors.admissionDate}
                  label={'Admission Date'}
                  defaultValue={undefined}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <AppReactDatepicker
                  {...register('dateOfDischarge', { required: false })}
                  selected={getValues('dateOfDischarge') || dischargeDate}
                  onChange={date => {
                    console.log('Date:', date)
                    setValue('dateOfDischarge', date)
                    setDischargeDate(date)
                  }} // Pass the date to react-hook-form
                  placeholderText='MM/DD/YYYY'
                  customInput={
                    <TextField
                      fullWidth
                      size='small'
                      name='dateOfDischarge'
                      label='Discharge Date'
                      placeholder='MM/DD/YYYY'
                    />
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <ControlledDatePicker
                  name={'dateOfBirth'}
                  control={control}
                  error={errors.dateOfBirth}
                  label={'Date of Birth'}
                  defaultValue={undefined}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'PMI Number'}
                  placeHolder={'please enter PMI Number'}
                  name={'pmiNumber'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.pmiNumber}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomRadioButton
                  label='Gender'
                  name={'gender'}
                  radioOptions={[
                    {
                      key: 1,
                      value: 'male',
                      label: 'Male'
                    },
                    {
                      key: 2,
                      value: 'female',
                      label: 'Female'
                    }
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('socialSecurity', { required: false })}
                  label={'Social Security'}
                  placeholder={'please enter Social Security'}
                  name={'socialSecurity'}
                  defaultValue={undefined}
                  type={'number'}
                  size='small'
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Primary Phone Number'}
                  placeHolder={'please enter Primary Phone Number'}
                  name={'primaryPhoneNumber'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.primaryPhoneNumber}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('additionalPhoneNumber', { required: false })}
                  label={'Additional Phone Number'}
                  placeholder={'please enter Additional Phone Number'}
                  name={'additionalPhoneNumber'}
                  defaultValue={undefined}
                  type={'number'}
                  size='small'
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('emergencyContactName', { required: false })}
                  label={'Emergency Contact Name'}
                  placeholder={'please enter Emergency Contact Name'}
                  name={'emergencyContactName'}
                  defaultValue={undefined}
                  type={'text'}
                  size='small'
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('emergencyContactNumber', { required: false })}
                  label={'Emergency Contact Number'}
                  placeholder={'please enter Emergency Contact Number'}
                  name={'emergencyContactNumber'}
                  defaultValue={undefined}
                  type={'number'}
                  size='small'
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('emergencyEmail', { required: false })}
                  label={'Emergency Email ID'}
                  placeholder={'please enter Emergency Email ID'}
                  name={'emergencyEmail'}
                  defaultValue={''}
                  type={'email'}
                  size='small'
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth className='relative'>
                  <InputLabel size='small'>Shared Care</InputLabel>
                  <Select
                    {...register('sharedCare', { required: false })}
                    name='sharedCare'
                    label='Shared Care'
                    size='small'
                  >
                    <MenuItem value='none'>None</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('insuranceCode', { required: false })}
                  label={'Insurance Code'}
                  placeholder={'please enter Insurance Code'}
                  name={'insuranceCode'}
                  defaultValue={undefined}
                  type={'number'}
                  size='small'
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Client Code'}
                  placeHolder={'please enter Primary Client Code'}
                  name={'clientCode'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.clientCode}
                  control={control}
                  isRequired={false}
                  minLength={4}
                  maxLength={4}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('medicalSpendDown', { required: false })}
                  label={'Medical Spend Down'}
                  placeholder={'please enter Medical Spend Down'}
                  name={'medicalSpendDown'}
                  defaultValue={undefined}
                  type={'number'}
                  size='small'
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('medicalSpendDown2', { required: false })}
                  label={'Medical Spend Down'}
                  placeholder={'please enter Medical Spend Down'}
                  name={'medicalSpendDown2'}
                  defaultValue={undefined}
                  type={'number'}
                  size='small'
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('amount', {
                    required: false,
                    pattern: {
                      value: /^\d*\.?\d{0,2}$/, // Allows numbers with up to 2 decimal places
                      message: 'Please enter a valid amount'
                    }
                  })}
                  label={'Amount'}
                  placeholder={'12121'}
                  name={'amount'}
                  defaultValue={undefined}
                  itemType='number'
                  type={'number'}
                  size='small'
                  fullWidth
                  InputProps={{
                    // Add dollar sign
                    startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                    inputMode: 'decimal' // Use decimal keyboard on mobile
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth className='relative'>
                  <InputLabel size='small'>PCA Choice</InputLabel>
                  <Select
                    {...register('pcaChoice', { required: false })}
                    name='pcaChoice'
                    label='PCA Choice'
                    size='small'
                  >
                    <MenuItem value='none'>None</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card className='mt-3'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Primary Residential Address</Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Address'}
                  placeHolder={'please enter Address'}
                  name={'primaryResidentialAddress'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.primaryResidentialAddress}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'City'}
                  placeHolder={'please enter City'}
                  name={'primaryResidentialCity'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.primaryResidentialCity}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'State'}
                  placeHolder={'please enter State'}
                  name={'primaryResidentialState'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.primaryResidentialState}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'ZIP Code'}
                  placeHolder={'please enter ZipCode'}
                  name={'primaryResidentialZipCode'}
                  defaultValue={undefined}
                  type={'number'}
                  error={errors.primaryResidentialZipCode}
                  control={control}
                  maxLength={5}
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Mailing Address</Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Address'}
                  placeHolder={'please enter Address'}
                  name={'mailingAddress'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.mailingAddress}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'City'}
                  placeHolder={'please enter City'}
                  name={'mailingCity'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.mailingCity}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'State'}
                  placeHolder={'please enter State'}
                  name={'mailingState'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.mailingState}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'ZIP Code'}
                  placeHolder={'please enter ZipCode'}
                  name={'mailingZipCode'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.mailingZipCode}
                  control={control}
                  maxLength={5}
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Secondary Residential Address</Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('secondaryResidentialAddress', { required: false })}
                  label={'Address'}
                  placeholder={'please enter Address'}
                  name={'secondaryResidentialAddress'}
                  defaultValue={''}
                  type={'text'}
                  size='small'
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('secondaryResidentialCity', { required: false })}
                  label={'City'}
                  placeholder={'please enter City'}
                  name={'secondaryResidentialCity'}
                  defaultValue={''}
                  type={'text'}
                  size='small'
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('secondaryResidentialState', { required: false })}
                  label={'State'}
                  placeholder={'please enter State'}
                  name={'secondaryResidentialState'}
                  defaultValue={''}
                  type={'text'}
                  size='small'
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'ZIP Code'}
                  placeHolder={'please enter ZipCode'}
                  name={'secondaryResidentialZipCode'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.secondaryResidentialZipCode}
                  control={control}
                  isRequired={false}
                  maxLength={5}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card className='mt-3'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Client / Responsible Party</Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('clientResponsibilityPartyName', { required: false })}
                  label={'Name'}
                  placeholder={'please enter Name'}
                  name={'clientResponsibilityPartyName'}
                  defaultValue={''}
                  type={'text'}
                  size='small'
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('clientResponsibilityPartyEmailAddress', { required: false })}
                  label={'Email Address'}
                  placeholder={'please enter Email Address'}
                  name={'clientResponsibilityPartyEmailAddress'}
                  defaultValue={''}
                  type={'email'}
                  size='small'
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('clientResponsibilityPartyPhoneNumber', { required: false })}
                  label={'Phone Number'}
                  placeholder={'please enter Phone Number'}
                  name={'clientResponsibilityPartyPhoneNumber'}
                  defaultValue={undefined}
                  type={'number'}
                  size='small'
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  {...register('clientResponsibilityPartyFaxNumber', { required: false })}
                  label={'Fax Number'}
                  placeholder={'please enter Fax Number'}
                  name={'clientResponsibilityPartyFaxNumber'}
                  defaultValue={undefined}
                  type={'number'}
                  size='small'
                  fullWidth
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  )
})

export default PersonalDetailsForm

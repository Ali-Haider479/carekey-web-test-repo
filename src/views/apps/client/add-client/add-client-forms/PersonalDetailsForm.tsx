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
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import { USStates } from '@/utils/constants'

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
    watch,
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
                <CustomTextField
                  label={'Middle Name'}
                  placeHolder={'D'}
                  name={'middleName'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.middleName}
                  control={control}
                  isRequired={false}
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
                <ControlledDatePicker
                  name={'dateOfDischarge'}
                  control={control}
                  error={errors.dateOfDischarge}
                  label={'Discharge Date'}
                  defaultValue={undefined}
                  isRequired={false}
                  minDate={watch('admissionDate') || undefined}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <ControlledDatePicker
                  name={'dateOfBirth'}
                  control={control}
                  error={errors.dateOfBirth}
                  label={'Date of Birth'}
                  defaultValue={undefined}
                  maxDate={new Date()}
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
                <CustomTextField
                  label={'Social Security'}
                  placeHolder={'1234'}
                  name={'socialSecurity'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.socialSecurity}
                  control={control}
                  isRequired={false}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Email Id'}
                  placeHolder={'abc@example.com'}
                  name={'emailId'}
                  defaultValue={''}
                  type={'email'}
                  error={errors.emailId}
                  control={control}
                  isRequired={false}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Primary Phone Number'}
                  placeHolder={'1122334455'}
                  name={'primaryPhoneNumber'}
                  defaultValue={''}
                  type={'number'}
                  isPhoneNumber={true}
                  error={errors.primaryPhoneNumber}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Additional Phone Number'}
                  placeHolder={'1122334455'}
                  name={'additionalPhoneNumber'}
                  defaultValue={''}
                  type={'number'}
                  isPhoneNumber={true}
                  error={errors.additionalPhoneNumber}
                  control={control}
                  isRequired={false}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Emergency Contact Name'}
                  placeHolder={'John Doe'}
                  name={'emergencyContactName'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.emergencyContactName}
                  control={control}
                  isRequired={false}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Emergency Contact Number'}
                  placeHolder={'1122334455'}
                  name={'emergencyContactNumber'}
                  defaultValue={''}
                  type={'number'}
                  isPhoneNumber={true}
                  error={errors.emergencyContactNumber}
                  control={control}
                  isRequired={false}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Emergency Email Id'}
                  placeHolder={'john.doe@example.com'}
                  name={'emergencyEmail'}
                  defaultValue={''}
                  type={'email'}
                  error={errors.emergencyEmail}
                  control={control}
                  isRequired={false}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomDropDown
                  name={'sharedCare'}
                  control={control}
                  isRequired={false}
                  label={'Shared Care'}
                  optionList={[{ key: 1, value: 'none', optionString: 'None' }]}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Insurance Code'}
                  placeHolder={'1234'}
                  name={'insuranceCode'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.insuranceCode}
                  control={control}
                  isRequired={false}
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
                  minLength={4}
                  maxLength={4}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Medical Spend Down'}
                  placeHolder={'1234'}
                  name={'medicalSpendDown'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.medicalSpendDown}
                  control={control}
                  isRequired={false}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Medical Spend Down'}
                  placeHolder={'1234'}
                  name={'medicalSpendDown2'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.medicalSpendDown2}
                  control={control}
                  isRequired={false}
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
                <CustomDropDown
                  name={'pcaChoice'}
                  control={control}
                  isRequired={false}
                  label={'PCA Choice'}
                  optionList={[{ key: 1, value: 'none', optionString: 'None' }]}
                />
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
                <CustomDropDown
                  name='primaryResidentialState'
                  control={control}
                  error={errors.primaryResidentialState}
                  label='State'
                  optionList={USStates.map((state: any) => ({
                    key: state.key,
                    value: state.value,
                    optionString: state.optionString
                  }))}
                  defaultValue={''}
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
                <CustomDropDown
                  name='mailingState'
                  control={control}
                  error={errors.mailingState}
                  label='State'
                  optionList={USStates.map((state: any) => ({
                    key: state.key,
                    value: state.value,
                    optionString: state.optionString
                  }))}
                  defaultValue={''}
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
                <CustomTextField
                  label={'Address'}
                  placeHolder={'please enter Address'}
                  name={'secondaryResidentialAddress'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.secondaryResidentialAddress}
                  control={control}
                  isRequired={false}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'City'}
                  placeHolder={'please enter City'}
                  name={'secondaryResidentialCity'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.secondaryResidentialCity}
                  control={control}
                  isRequired={false}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomDropDown
                  name='secondaryResidentialState'
                  control={control}
                  error={errors.secondaryResidentialState}
                  label='State'
                  isRequired={false}
                  optionList={USStates.map((state: any) => ({
                    key: state.key,
                    value: state.value,
                    optionString: state.optionString
                  }))}
                  defaultValue={''}
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
                <CustomTextField
                  label={'Name'}
                  placeHolder={'John Doe'}
                  name={'clientResponsibilityPartyName'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.clientResponsibilityPartyName}
                  control={control}
                  isRequired={false}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Email'}
                  placeHolder={'john.doe@example.com'}
                  name={'clientResponsibilityPartyEmailAddress'}
                  defaultValue={''}
                  type={'email'}
                  error={errors.clientResponsibilityPartyEmailAddress}
                  control={control}
                  isRequired={false}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Phone Number'}
                  placeHolder={'1122334455'}
                  name={'clientResponsibilityPartyPhoneNumber'}
                  defaultValue={''}
                  type={'number'}
                  isPhoneNumber={true}
                  error={errors.clientResponsibilityPartyPhoneNumber}
                  control={control}
                  isRequired={false}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Fax Number'}
                  placeHolder={'1122334455'}
                  name={'clientResponsibilityPartyFaxNumber'}
                  defaultValue={''}
                  type={'number'}
                  isPhoneNumber={true}
                  error={errors.clientResponsibilityPartyFaxNumber}
                  control={control}
                  isRequired={false}
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

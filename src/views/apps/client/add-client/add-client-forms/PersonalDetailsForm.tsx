'use client'
import React, { forwardRef, useImperativeHandle } from 'react'
import Grid from '@mui/material/Grid2'
import CustomTextField from '@core/components/custom-inputs/CustomTextField'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
// import AntdDatePickerFeatureMUI from "../shared/AntdDatePickerFeatureMUI";
import CustomRadioButton from '@core/components/custom-inputs/CustomRadioButton'
import CustomDropDown from '@core/components/custom-inputs/CustomDropDown'
import CustomAmountInput from '@core/components/custom-inputs/CustomAmountInput'
import { Card, CardContent, TextField, Typography } from '@mui/material'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { PersonalDetailsFormDataType } from './formTypes'

type Props = {
  form?: any
  onFinish?: any
}

const PersonalDetailsForm = forwardRef<{ handleSubmit: any }, Props>(({ onFinish }, ref) => {
  const methods = useForm<PersonalDetailsFormDataType>({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  // Expose handleSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: (onValid: (data: PersonalDetailsFormDataType) => void) => handleSubmit(onValid)
  }))

  const {
    control,
    formState: { errors },
    handleSubmit // Add this if you want to use form submission
  } = methods // Use methods instead of useFormContext

  const onSubmit = (data: PersonalDetailsFormDataType) => {
    console.log('Submitted Data:', data)
    onFinish(data) // Pass form data to parent
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
                      value: 'female',
                      label: 'Female'
                    },
                    {
                      key: 2,
                      value: 'male',
                      label: 'Male'
                    }
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Social Security'}
                  placeHolder={'please enter Social Security'}
                  name={'socialSecurity'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.socialSecurity}
                  control={control}
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
                <CustomTextField
                  label={'Additional Phone Number'}
                  placeHolder={'please enter Additional Phone Number'}
                  name={'additionalPhoneNumber'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.additionalPhoneNumber}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Emergency Contact Name'}
                  placeHolder={'please enter Emergency Contact Name'}
                  name={'emergencyContactName'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.emergencyContactName}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Emergency Contact Number'}
                  placeHolder={'please enter Emergency Contact Number'}
                  name={'emergencyContactNumber'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.emergencyContactNumber}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Emergency Email ID'}
                  placeHolder={'please enter Emergency Email ID'}
                  name={'emergencyEmail'}
                  defaultValue={''}
                  type={'email'}
                  error={errors.emergencyEmail}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomDropDown
                  name={'sharedCare'}
                  control={control}
                  error={errors.sharedCare}
                  label={'Shared Care'}
                  optionList={[{ key: 1, value: 'none', optionString: 'None' }]}
                  defaultValue={''}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Insurance Code'}
                  placeHolder={'please enter Insurance Code'}
                  name={'insuranceCode'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.insuranceCode}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Client Code'}
                  placeHolder={'please enter Client Code'}
                  name={'clientCode'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.clientCode}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Medical Spend Down'}
                  placeHolder={'please enter Medical Spend Down'}
                  name={'medicalSpendDown'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.medicalSpendDown}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Medical Spend Down'}
                  placeHolder={'please enter Medical Spend Down'}
                  name={'medicalSpendDown2'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.medicalSpendDown2}
                  control={control}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomAmountInput
                  name={'amount'}
                  control={control}
                  label={'Amount'}
                  placeHolder={'12121'}
                  defaultValue={''}
                  type={Number}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomDropDown
                  name={'pcaChoice'}
                  control={control}
                  error={errors.pcaChoice}
                  label={'PCA Choice'}
                  optionList={[{ key: 1, value: 'none', optionString: 'None' }]}
                  defaultValue={''}
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
                  defaultValue={''}
                  type={'number'}
                  error={errors.primaryResidentialZipCode}
                  control={control}
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
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'State'}
                  placeHolder={'please enter State'}
                  name={'secondaryResidentialState'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.secondaryResidentialState}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Zip Code'}
                  placeHolder={'please enter Zip Code'}
                  name={'secondaryResidentialZipCode'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.secondaryResidentialZipCode}
                  control={control}
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
                  placeHolder={'please enter Name'}
                  name={'clientResponsibilityPartyName'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.clientResponsibilityPartyName}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Email Address'}
                  placeHolder={'please enter Email Address'}
                  name={'clientResponsibilityPartyEmailAddress'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.clientResponsibilityPartyEmailAddress}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Phone Number'}
                  placeHolder={'please enter Phone Number'}
                  name={'clientResponsibilityPartyPhoneNumber'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.clientResponsibilityPartyPhoneNumber}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'FAX Number'}
                  placeHolder={'please enter Fax Number'}
                  name={'clientResponsibilityPartyFaxNumber'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.clientResponsibilityPartyFaxNumber}
                  control={control}
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

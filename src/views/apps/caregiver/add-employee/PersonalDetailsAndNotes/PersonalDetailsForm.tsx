'use client'

// React Imports
import { forwardRef, useImperativeHandle, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// Styled Component Imports
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import { FormHelperText } from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import CustomTextField from '@core/components/custom-inputs/CustomTextField'
import CustomDropDown from '@core/components/custom-inputs/CustomDropDown'
import { PersonalDetailsFormDataType } from '../types'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import USStates from '@/utils/constants'

type Props = {
  // form?: any
  onFinish: any
  defaultValues: any
}

const PersonalDetailsForm = forwardRef<{ handleSubmit: any }, Props>(({ onFinish, defaultValues }, ref) => {
  const methods = useForm<PersonalDetailsFormDataType>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: defaultValues || []
  })

  const {
    control,
    formState: { errors },
    handleSubmit, // Add this if you want to use form submission
    watch
  } = methods

  // Expose handleSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: (onValid: (data: PersonalDetailsFormDataType) => void) => handleSubmit(onValid)
  }))

  const [error, setError] = useState('')

  const emergencyEmailValidation = watch('emergencyEmailId')

  const validateEmail = () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailPattern.test(emergencyEmailValidation)) {
      setError('Please enter a valid email address!.')
    } else {
      setError('')
    }
  }

  const onSubmit = (data: PersonalDetailsFormDataType) => {
    console.log('Submitted Data:', data)
    onFinish(data) // Pass form data to parent
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className='mt-5 w-full'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Personal Details</Typography>
            <div>
              <Grid container spacing={4}>
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
                  <CustomDropDown
                    name={'role'}
                    control={control}
                    error={errors.role}
                    label={'Role'}
                    optionList={[{ key: 1, value: 'caregiver', optionString: 'Caregiver' }]}
                    defaultValue={''}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Caregiver UMPI'}
                    placeHolder={'caregiverUmpi'}
                    name='caregiverUMPI'
                    defaultValue={''}
                    type={'text'}
                    error={errors.caregiverUMPI}
                    control={control}
                    minLength={10}
                    maxLength={10}
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
                  <CustomDropDown
                    name={'caregiverLevel'}
                    control={control}
                    error={errors.caregiverLevel}
                    label={'Caregiver Level'}
                    optionList={[
                      { key: 1, value: 'caregiver', optionString: 'Caregiver' },
                      { key: 2, value: 'serniorCaregiver', optionString: 'Sernior Caregiver' }
                    ]}
                    defaultValue={''}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Address'}
                    placeHolder={'Address'}
                    name={'address'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.address}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'City'}
                    placeHolder={'City'}
                    name={'city'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.city}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
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
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Zip Code'}
                    placeHolder={'Zip Code'}
                    name={'zipCode'}
                    defaultValue={''}
                    type={'number'}
                    error={errors.zipCode}
                    control={control}
                    maxLength={5}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'SSN'}
                    placeHolder={'SSN'}
                    name={'ssn'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.ssn}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Pay Rate ($)'}
                    placeHolder={'Pay Rate ($)'}
                    name={'payRate'}
                    defaultValue={10}
                    type={'number'}
                    error={errors.payRate}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <ControlledDatePicker
                    name={'dateOfHire'}
                    control={control}
                    error={errors.dateOfHire}
                    label={'Date of Hire'}
                    defaultValue={undefined}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <ControlledDatePicker
                    name={'terminationDate'}
                    control={control}
                    error={errors.terminationDate}
                    label={'Termination Date'}
                    defaultValue={undefined}
                    isRequired={false}
                    minDate={watch('dateOfHire') || undefined}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name='gender'
                    control={control}
                    defaultValue='male' // Set a default value if needed
                    rules={{ required: 'Gender is required' }} // Add validation rules if necessary
                    render={({ field }) => (
                      <FormControl component='fieldset' error={!!errors.gender}>
                        <RadioGroup
                          row
                          {...field} // Bind field props to RadioGroup
                          value={field.value} // Set the value from the field
                          onChange={e => field.onChange(e.target.value)} // Update form state on change
                        >
                          <FormControlLabel value='male' label='Male' control={<Radio />} />
                          <FormControlLabel value='female' control={<Radio />} label='Female' />
                        </RadioGroup>
                        {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Phone Number'}
                    placeHolder={'Phone Number'}
                    name={'primaryPhoneNumber'}
                    defaultValue={''}
                    isPhoneNumber={true}
                    type={'number'}
                    error={errors.primaryPhoneNumber}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Secondary Phone Number'}
                    placeHolder={'Secondary Phone NUmber'}
                    name={'secondaryPhoneNumber'}
                    defaultValue={''}
                    isPhoneNumber={true}
                    type={'number'}
                    error={errors.secondaryPhoneNumber}
                    control={control}
                    isRequired={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Emergency Contact Number'}
                    placeHolder={'Emergency Contact Number'}
                    name={'emergencyContactNumber'}
                    defaultValue={''}
                    isPhoneNumber={true}
                    type={'number'}
                    error={errors.emergencyContactNumber}
                    control={control}
                    isRequired={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Emergency Email Id'}
                    placeHolder={'Emergency Email Id'}
                    name={'emergencyEmailId'}
                    defaultValue={''}
                    type={'email'}
                    error={errors.emergencyEmailId}
                    control={control}
                    isRequired={false}
                    onBlur={validateEmail}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomDropDown
                    name={'overtimeAgreement'}
                    control={control}
                    error={errors.overtimeAgreement}
                    label={'Caregiver Overtime Agreement'}
                    optionList={[
                      { key: 1, value: 'yes', optionString: 'Yes' },
                      { key: 2, value: 'no', optionString: 'No' }
                    ]}
                    defaultValue={''}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomDropDown
                    name={'isLicensed245d'}
                    control={control}
                    error={errors.isLicensed245d}
                    label={'Is the Caregiver 245D Licensed'}
                    optionList={[
                      { key: 1, value: 'yes', optionString: 'Yes' },
                      { key: 2, value: 'no', optionString: 'No' }
                    ]}
                    defaultValue={''}
                    isRequired={true}
                  />
                </Grid>
              </Grid>
            </div>
          </CardContent>
        </Card>
        <Card className='mt-5 w-full'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Caregiver Notes</Typography>
            <div>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Allergies'}
                    placeHolder={'Allergies'}
                    name={'allergies'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.allergies}
                    control={control}
                    isRequired={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Special Requests'}
                    placeHolder={'Special Requests'}
                    name={'specialRequests'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.specialRequests}
                    control={control}
                    isRequired={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Comments'}
                    placeHolder={'Comments'}
                    name={'comments'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.comments}
                    control={control}
                    isRequired={false}
                  />
                </Grid>
              </Grid>
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  )
})

export default PersonalDetailsForm

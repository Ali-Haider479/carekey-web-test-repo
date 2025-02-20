'use client'

// React Imports
import { forwardRef, useEffect, useImperativeHandle } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import InputLabel from '@mui/material/InputLabel'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import { FormHelperText } from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import CustomTextField from '@core/components/custom-inputs/CustomTextField'
import CustomDropDown from '@core/components/custom-inputs/CustomDropDown'
import { PersonalDetailsFormDataType } from '../types'

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
    handleSubmit // Add this if you want to use form submission
  } = methods

  // Expose handleSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: (onValid: (data: PersonalDetailsFormDataType) => void) => handleSubmit(onValid)
  }))

  // Use methods instead of useFormContext

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
                    type={'number'}
                    error={errors.caregiverUMPI}
                    control={control}
                  />
                </Grid>
                {/* <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name='caregiverUMPI'
                    control={control}
                    defaultValue={null}
                    rules={{ required: 'Caregiver UMPI is required' }}
                    render={({ field }) => (
                      <AppReactDatepicker
                        selected={field.value}
                        onChange={date => field.onChange(date)} // Pass the date to react-hook-form
                        placeholderText='MM/DD/YYYY'
                        customInput={
                          <TextField
                            fullWidth
                            error={!!errors.caregiverUMPI}
                            helperText={errors.caregiverUMPI && 'please select a date'}
                            size='small'
                            label='Caregiver UMPI'
                            placeholder='MM-DD-YYYY'
                          />
                        }
                      />
                    )}
                  />
                </Grid> */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name='dateOfBirth'
                    control={control}
                    defaultValue={null} // Set the default value
                    rules={{ required: 'Date of birth is required' }} // Validation rules
                    render={({ field }) => (
                      <AppReactDatepicker
                        selected={field.value} // Bind value from react-hook-form
                        onChange={(date: Date | null) => field.onChange(date)} // Update react-hook-form on change
                        placeholderText='MM/DD/YYYY'
                        showYearDropdown
                        yearDropdownItemNumber={5}
                        showMonthDropdown
                        customInput={
                          <TextField
                            fullWidth
                            error={!!errors.dateOfBirth}
                            helperText={errors.dateOfBirth && 'please select a date'}
                            size='small'
                            label='Date of Birth'
                            placeholder='MM-DD-YYYY'
                          />
                        }
                      />
                    )}
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
                  <CustomTextField
                    label={'State'}
                    placeHolder={'State'}
                    name={'state'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.state}
                    control={control}
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
                  <Controller
                    name='dateOfHire'
                    control={control}
                    defaultValue={null} // Set the default value
                    rules={{ required: 'Date of hire is required' }} // Validation rules
                    render={({ field }) => (
                      <AppReactDatepicker
                        // className="z-10"
                        selected={field.value} // Bind value from react-hook-form
                        onChange={(date: Date | null) => field.onChange(date)} // Update react-hook-form on change
                        placeholderText='MM/DD/YYYY'
                        showYearDropdown
                        showMonthDropdown
                        customInput={
                          <TextField
                            fullWidth
                            error={!!errors.dateOfHire}
                            helperText={errors.dateOfHire && 'please select a date'}
                            size='small'
                            label='Date of Hire'
                            placeholder='MM-DD-YYYY'
                          />
                        }
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name='terminationDate'
                    control={control}
                    defaultValue={null} // Set the default value
                    rules={{ required: false }} // Validation rules
                    render={({ field }) => (
                      <AppReactDatepicker
                        selected={field.value} // Bind value from react-hook-form
                        onChange={(date: Date | null) => field.onChange(date)} // Update form state on change
                        placeholderText='MM/DD/YYYY'
                        showYearDropdown
                        showMonthDropdown
                        customInput={
                          <TextField
                            fullWidth
                            error={!!errors.terminationDate}
                            helperText={errors.terminationDate?.message}
                            size='small'
                            label='Termination Date'
                            placeholder='MM-DD-YYYY'
                          />
                        }
                      />
                    )}
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
                    type={'text'}
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
                    type={'text'}
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
                    type={'text'}
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

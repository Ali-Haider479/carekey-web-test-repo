'use client'

// React Imports
import { forwardRef, useImperativeHandle } from 'react'

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

type FormDataType = {
  firstName: string
  middleName: string
  lastName: string
  role: string
  caregiverUMPI: Date | null
  dateOfBirth: Date | null
  caregiverLevel: string
  address: string
  city: string
  state: string
  zip: number | null
  SSN: string
  payRate: number | null
  dateOfHire: Date | null
  terminationDate: Date | null
  gender: string
  phoneNumber: string
  secondaryPhoneNumber: string
  emergencyContactNumber: string
  emergencyEmail: string
  caregiverOvertimeAgreement: string
  caregiverLicense: string
  allergies: string
  specialRequests: string
  comments: string
}

type Props = {
  // form?: any
  onFinish: any
}

const PersonalDetailsForm = forwardRef<{ handleSubmit: any }, Props>(({ onFinish }, ref) => {
  const methods = useForm<FormDataType>({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  // Expose handleSubmit to parent via ref
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
                </Grid>
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
                        showYearDropdown
                        showMonthDropdown
                        placeholderText='MM/DD/YYYY'
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
                  <Controller
                    name='caregiverLevel'
                    control={control}
                    defaultValue='' // Set default value
                    rules={{ required: 'Caregiver Level is required' }} // Validation rules
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.caregiverLevel}>
                        <InputLabel>Caregiver Level</InputLabel>
                        <Select
                          {...field} // Spread field props to bind value and onChange
                          label='Caregiver Level'
                          size='small'
                        >
                          <MenuItem value='caregiver'>Caregiver</MenuItem>
                          <MenuItem value='senior caregiver'>Senior Caregiver</MenuItem>
                        </Select>
                        {errors.caregiverLevel && <FormHelperText>please select a caregiver level</FormHelperText>}
                      </FormControl>
                    )}
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
                    type={'text'}
                    error={errors.zip}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'SSN'}
                    placeHolder={'SSN'}
                    name={'ssn'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.SSN}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Pay Rate ($)'}
                    placeHolder={'Pay Rate ($)'}
                    name={'payRate'}
                    defaultValue={''}
                    type={'text'}
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
                    rules={{ required: 'Termination date is required' }} // Validation rules
                    render={({ field }) => (
                      <AppReactDatepicker
                        selected={field.value} // Bind value from react-hook-form
                        onChange={(date: Date | null) => field.onChange(date)} // Update form state on change
                        showYearDropdown
                        showMonthDropdown
                        placeholderText='MM/DD/YYYY'
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
                  <FormControl>
                    <RadioGroup row aria-label='position' name='horizontal' defaultValue='male' className='mbs-4'>
                      <FormControlLabel value='male' label='Male' control={<Radio />} />
                      <FormControlLabel value='female' control={<Radio />} label='Female' />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Phone Number'}
                    placeHolder={'Phone Number'}
                    name={'phoneNumber'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.phoneNumber}
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
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Emergency Email Id'}
                    placeHolder={'Emergency Email Id'}
                    name={'emergencyEmail Id'}
                    defaultValue={''}
                    type={'email'}
                    error={errors.emergencyEmail}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name='caregiverOvertimeAgreement'
                    control={control}
                    defaultValue='' // Set the default value
                    rules={{ required: 'Caregiver Overtime Agreement is required' }} // Validation rules
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.caregiverOvertimeAgreement}>
                        <InputLabel>Caregiver Overtime Agreement</InputLabel>
                        <Select
                          {...field} // Spread field properties to bind value and onChange
                          label='Caregiver Overtime Agreement'
                          size='small'
                        >
                          <MenuItem value='Yes'>Yes</MenuItem>
                          <MenuItem value='No'>No</MenuItem>
                        </Select>
                        {errors.caregiverOvertimeAgreement && <FormHelperText>please select an option</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name='caregiverLicense'
                    control={control}
                    defaultValue='' // Set the default value
                    rules={{ required: 'Caregiver License is required' }} // Validation rules
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.caregiverLicense}>
                        <InputLabel>Is the Caregiver 245D Licensed</InputLabel>
                        <Select
                          {...field} // Spread field properties to bind value and onChange
                          label='Is the Caregiver 245D Licensed'
                          size='small'
                        >
                          <MenuItem value='Yes'>Yes</MenuItem>
                          <MenuItem value='No'>No</MenuItem>
                        </Select>
                        {errors.caregiverLicense && <FormHelperText>please select an option</FormHelperText>}
                      </FormControl>
                    )}
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
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Comments'}
                    placeHolder={'Comments'}
                    name={'commments'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.comments}
                    control={control}
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

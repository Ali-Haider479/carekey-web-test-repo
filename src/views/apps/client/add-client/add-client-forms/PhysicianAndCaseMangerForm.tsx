import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import { Card, CardContent, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { forwardRef, useImperativeHandle } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { PhysicianAndCaseMangerFormDataType } from './formTypes'

type Props = {
  form?: any
  onFinish?: any
}

const PhysicianAndCaseMangerForm = forwardRef<{ handleSubmit: any }, Props>(({ onFinish }, ref) => {
  const methods = useForm<PhysicianAndCaseMangerFormDataType>({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  // Expose handleSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: (onValid: (data: PhysicianAndCaseMangerFormDataType) => void) => handleSubmit(onValid)
  }))

  //

  const {
    control,
    formState: { errors },
    handleSubmit // Add this if you want to use form submission
  } = methods // Use methods instead of useFormContext

  const onSubmit = (data: PhysicianAndCaseMangerFormDataType) => {
    console.log('Submitted Data:', data)
    onFinish(data) // Pass form data to parent
  }
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Physician Details</Typography>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Physician Name'}
                  placeHolder={'Enter Physician Name'}
                  name={'physicianName'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.physicianName}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Clinic Name'}
                  placeHolder={'Enter Clinic Name'}
                  name={'clinicName'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.clinicName}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Phone Number'}
                  placeHolder={'Enter Phone Number'}
                  name={'phoneNumber'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.phoneNumber}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Fax Number'}
                  placeHolder={'Enter Fax Number'}
                  name={'faxNumber'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.faxNumber}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Physical Address'}
                  placeHolder={'Enter Physical Address'}
                  name={'physicalAddress'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.physicalAddress}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                {' '}
                <CustomTextField
                  label={'Physician City'}
                  placeHolder={'Enter Physician City'}
                  name={'physicianCity'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.physicianCity}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Physician State'}
                  placeHolder={'Enter Physician State'}
                  name={'physicianState'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.physicianState}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                {' '}
                <CustomTextField
                  label={'Physician Zip Code'}
                  placeHolder={'Enter Physician Zip Code'}
                  name={'physicianZipCode'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.physicianZipCode}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Primary Phone Number'}
                  placeHolder={'Enter Primary Phone Number'}
                  name={'primaryPhoneNumber'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.primaryPhoneNumber}
                  control={control}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card className='mt-3'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Physician Details</Typography>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Case Manager Name'}
                  placeHolder={'Enter Case Manager Name'}
                  name={'caseManagerName'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.caseManagerName}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Case Manger Email'}
                  placeHolder={'Enter Case Manager Email'}
                  name={'caseMangerEmail'}
                  defaultValue={''}
                  type={'email'}
                  error={errors.caseMangerEmail}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                {' '}
                <CustomTextField
                  label={'Case Manger Phone Number'}
                  placeHolder={'Enter Case Manager Phone Number'}
                  name={'caseMangerPhoneNumber'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.caseMangerPhoneNumber}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Case Manger Fax Number'}
                  placeHolder={'Enter Case Manager Fax Number'}
                  name={'caseManagerFaxNumber'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.caseManagerFaxNumber}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Case Manger Ext. Number'}
                  placeHolder={'Enter Case Manager Ext. Number'}
                  name={'caseManagerExtension'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.caseManagerExtension}
                  control={control}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  label={'Case Manger Note'}
                  placeHolder={'Enter Case Manager Note'}
                  name={'caseMangerNote'}
                  defaultValue={''}
                  type={'text'}
                  error={errors.caseMangerNote}
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

export default PhysicianAndCaseMangerForm

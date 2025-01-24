'use client'
import { forwardRef, useImperativeHandle } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button, Card, CardContent, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import ControlledTextArea from '@/@core/components/custom-inputs/ControlledTextArea'
import ServiceActivities from '@/@core/components/custom-inputs/ServiceAcitvitesDropDown'
import { clientServiceFormDataType } from './formTypes'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'

type Props = {
  form?: any
  onFinish?: any
}

const ServiceActivitiesForm = forwardRef<{ handleSubmit: any }, Props>(({ onFinish }, ref) => {
  const methods = useForm<clientServiceFormDataType>({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  // Expose handleSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: (onValid: (data: clientServiceFormDataType) => void) => handleSubmit(onValid)
  }))

  const {
    control,
    formState: { errors },
    handleSubmit // Add this if you want to use form submission
  } = methods // Use methods instead of useFormContext

  const onSubmit = (data: clientServiceFormDataType) => {
    console.log('Submitted Data:', data)
    onFinish(data) // Pass form data to parent
  }
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
        <Card>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Assign Caregiver</Typography>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomDropDown
                name={'caregiver'}
                control={control}
                error={errors.caregiver}
                label={'Caregiver'}
                optionList={[
                  { key: 1, value: 'John Doe', optionString: 'John Doe' },
                  { key: 2, value: 'Jane Doe', optionString: 'Jane Doe' }
                ]}
                defaultValue={''}
              />
            </Grid>
          </CardContent>
        </Card>
        <Card className='mt-3'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Client Service Type</Typography>

            <Grid container spacing={5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomDropDown
                  name={'service'}
                  control={control}
                  error={errors.service}
                  label={'Select Service'}
                  optionList={[
                    { key: 1, value: 'IHS', optionString: 'IHS' },
                    { key: 2, value: 'IHS+', optionString: 'IHS+' }
                  ]}
                  defaultValue={''}
                />
              </Grid>
              <ControlledTextArea
                name={'serviceNotes'}
                control={control}
                label={'Notes'}
                placeHolder={'Enter Service Notes'}
                defaultValue={''}
              />
            </Grid>
          </CardContent>
        </Card>

        <Card className='mt-3'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Service Activities</Typography>

            <ServiceActivities
              name={'serviceActivities'}
              control={control}
              label={'Select Service'}
              error={errors.serviceActivities}
              defaultValue={''}
            />
          </CardContent>
        </Card>

        <Card className='mt-3'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Care Plan Due</Typography>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-x-5 mb-3 mt-2'>
              <ControlledDatePicker
                name={'lastCompletedDate'}
                control={control}
                error={errors.lastCompletedDate}
                label={'Last Completed Date'}
                defaultValue={undefined}
              />
              <ControlledDatePicker
                name={'dueDate'}
                control={control}
                error={errors.dueDate}
                label={'Due Date'}
                defaultValue={undefined}
              />
              <CustomTextField
                label={'QP Assigned'}
                placeHolder={'Enter QP Assigned'}
                name={'qpAssigned'}
                defaultValue={''}
                type={'text'}
                error={errors.qpAssigned}
                control={control}
              />
            </div>
            <ControlledTextArea
              name={'notes'}
              control={control}
              label={'Notes'}
              placeHolder={'Enter Care Plan Notes'}
              defaultValue={''}
            />
            <div className='col-span-1 md:col-span-3 mt-3'>
              <Typography variant='h6' color='textPrimary'>
                Service Type
              </Typography>
            </div>
            <div className='flex space-x-4'>
              <FormGroup row>
                <FormControlLabel control={<Checkbox onChange={() => {}} />} label='All' />
                <FormControlLabel control={<Checkbox onChange={() => {}} />} label='HSS' />
                <FormControlLabel control={<Checkbox onChange={() => {}} />} label='Waivered' />
              </FormGroup>
            </div>
            <Button className='mt-3' variant='contained'>
              CREATE NEW ACCOUNT
            </Button>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  )
})

export default ServiceActivitiesForm

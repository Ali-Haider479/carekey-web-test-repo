'use client'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button, Card, CardContent, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import ControlledTextArea from '@/@core/components/custom-inputs/ControlledTextArea'
import ServiceActivities from '@/@core/components/custom-inputs/ServiceAcitvitesDropDown'
import { clientServiceFormDataType } from './formTypes'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import axios from 'axios'

type Props = {
  form?: any
  onFinish?: any
  defaultValues: any
}

const ServiceActivitiesForm = forwardRef<{ handleSubmit: any }, Props>(({ onFinish, defaultValues }, ref) => {
  const methods = useForm<clientServiceFormDataType>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: defaultValues || []
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

  const [serviceTypes, setServiceTypes] = useState<any[]>()
  const [activities, setActivities] = useState<any[]>()
  const [caregiversList, setCaregiversList] = useState<any>()

  const getAvailableServices = async () => {
    try {
      const activities = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/activity`)
      setActivities(activities.data)
    } catch (error) {
      console.error('Error getting activities: ', error)
    }
  }

  const getServiceTypes = async () => {
    try {
      const serviceTypesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/service`)
      console.log('Service Types --> ', serviceTypesResponse)
      setServiceTypes(serviceTypesResponse.data)
    } catch (error) {
      console.error('Error getting service types: ', error)
    }
  }

  const getCaregiversList = async () => {
    try {
      const caregiversListData = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregivers`)
      console.log('Caregivers List Data--> ', caregiversListData)
      setCaregiversList(caregiversListData)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  useEffect(() => {
    getServiceTypes()
    getAvailableServices()
    getCaregiversList()
  }, [])

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
        <Card>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Assign Caregiver</Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomDropDown
                  name={'caregiverId'}
                  control={control}
                  error={errors.caregiverId}
                  label={'Caregiver'}
                  optionList={
                    caregiversList?.data?.map((item: any) => {
                      return {
                        key: `${item.id}-${item.firstName}`,
                        value: item.id,
                        optionString: `${item.firstName} ${item.lastName}`
                      }
                    }) || []
                  }
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
                  optionList={
                    serviceTypes?.map((item: any) => {
                      return {
                        key: `${item.id}-${item.name}`,
                        value: item.id,
                        optionString: item.name
                      }
                    }) || []
                  }
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
              defaultValue={[]}
              activities={activities || []}
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

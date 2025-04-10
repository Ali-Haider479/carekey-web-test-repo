'use client'
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Button, Card, CardContent, LinearProgress, TextField, Typography } from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import FileUploaderRestrictions from '@/@core/components/mui/FileUploader'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'

type Props = {
  onFinish: any
  defaultValues: any
}

// const TrainingCertificatesComponent = () => {
const TrainingCertificatesComponent = forwardRef<{ handleSubmit: any }, Props>(({ onFinish, defaultValues }, ref) => {
  const [trainingCertificates, setTrainingCertificates] = useState<any>([])
  const [drivingCertificates, setDrivingCertificates] = useState<any>([])

  const methods = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: defaultValues || []
  })

  // Expose handleSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: (onValid: (data: any) => void) => handleSubmit(onValid)
  }))

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue
  } = methods

  // Update form values when files are selected
  useEffect(() => {
    setValue('trainingCertificateFiles', trainingCertificates)
  }, [trainingCertificates, setValue])

  useEffect(() => {
    setValue('drivingCertificateFiles', drivingCertificates)
  }, [drivingCertificates, setValue])

  const onSubmit = (data: any) => {
    // Combine files and form data
    const formData = {
      trainingCertificates: {
        files: data.trainingCertificateFiles || [],
        trainingCertificateName: data.trainingCertificateName,
        trainingCertificateExpiryDate: data.trainingCertificateExpiryDate
      },
      drivingCertificates: {
        files: data.drivingCertificateFiles || [],
        drivingLicenseExpiryDate: data.drivingLicenseExpiryDate,
        drivingLicenseNumber: data.drivingLicenseNumber,
        dlState: data.dlState
      }
    }

    console.log('Submitted Training Certificates Data:', formData)
    onFinish(formData) // Pass comprehensive form data to parent
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
        <Card className='mt-5'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Training Certificates</Typography>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {/* File Upload Section */}
              <div className='col-span-1 p-3 rounded-lg border'>
                <FileUploaderRestrictions
                  onFilesSelected={selectedFiles => {
                    setTrainingCertificates(selectedFiles)
                  }}
                  // mimeType={['application/pdf', 'image/jpeg', 'image/png']}
                  mimeType={['application/pdf']}
                  fileCount={3}
                  fileSize={25 * 1024 * 1024} // 25MB
                  title='Choose Files'
                />
              </div>

              {/* Uploading Files Section */}
              <div className='col-span-2'>
                <h3 className='text-lg font-semibold mb-4'>Uploading Files</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {trainingCertificates.map((file: File, index: number) => (
                    <div key={index} className='p-3 rounded-lg border border-[#32475C] border-opacity-[22%]'>
                      <div className='flex justify-between items-center mb-2'>
                        <div className='flex items-center gap-10'>
                          <div className='flex items-center gap-2'>
                            <PictureAsPdfIcon />
                            <Typography className='font-semibold text-green-600 text-sm'>
                              {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name} (100%)
                            </Typography>
                          </div>
                          <div>
                            <Typography className='font-semibold text-green-600 text-sm'>Completed</Typography>
                          </div>
                        </div>
                      </div>
                      <div>
                        <LinearProgress variant='determinate' value={100} color={'success'} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
              <Controller
                name='trainingCertificateName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...register(`trainingCertificateName`)}
                    label={'Certificate Name'}
                    placeHolder={'123ABC'}
                    name={'trainingCertificateName'}
                    defaultValue={'123ABC'}
                    type={'text'}
                    error={!!errors?.trainingCertificateName}
                    control={control} // Pass the control property from the Controller component
                  />
                )}
              />
              <Controller
                name='trainingCertificateExpiryDate'
                control={control}
                // defaultValue={null} // Set the default value
                rules={{ required: 'Date of birth is required' }} // Validation rules
                render={({ field }) => (
                  <AppReactDatepicker
                    selected={field.value} // Bind value from react-hook-form
                    onChange={(date: Date | null) => field.onChange(date)} // Update react-hook-form on change
                    placeholderText='MM/DD/YYYY'
                    customInput={
                      <TextField
                        {...register(`trainingCertificateExpiryDate`)}
                        fullWidth
                        // error={!!errors.dateOfBirth}
                        // helperText={errors.dateOfBirth && 'please select a date'}
                        size='small'
                        placeholder='Expiry Date'
                        label='Expiry Date'
                      />
                    }
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className='mt-5'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Driving License</Typography>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {/* File Upload Section */}
              <div className='col-span-1 p-3 border rounded-lg'>
                <FileUploaderRestrictions
                  onFilesSelected={selectedFiles => {
                    setDrivingCertificates(selectedFiles)
                  }}
                  mimeType={['application/pdf']}
                  fileCount={3}
                  fileSize={25 * 1024 * 1024} // 25MB
                />
              </div>

              {/* Uploading Files Section */}
              <div className='col-span-2'>
                <h3 className='text-lg font-semibold mb-4'>Uploading Files</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {drivingCertificates.map((file: File, index: number) => (
                    <div key={index} className='p-3 rounded-lg border border-[#32475C] border-opacity-[22%]'>
                      <div className='flex justify-between items-center mb-2'>
                        <div className='flex items-center gap-10'>
                          <div className='flex items-center gap-2'>
                            <PictureAsPdfIcon />
                            <Typography className='font-semibold text-green-600 text-sm'>
                              {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name} (100%)
                            </Typography>
                          </div>
                          <div>
                            <Typography className='font-semibold text-green-600 text-sm'>Completed</Typography>
                          </div>
                        </div>
                      </div>
                      <div>
                        <LinearProgress variant='determinate' value={100} color={'success'} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
              <Controller
                name='drivingLicenseNumber'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...register(`drivingLicenseNumber`)}
                    label={'Driving Licensed Number'}
                    placeHolder={'123ABC'}
                    name={'drivingLicenseNumber'}
                    defaultValue={'123ABC'}
                    type={'text'}
                    error={!!errors?.drivingLicenseNumber}
                    control={control} // Pass the control property from the Controller component
                  />
                )}
              />
              <CustomDropDown
                {...register(`dlState`)}
                name='dlState'
                control={control}
                error={errors.dlState}
                label='DL State'
                optionList={[{ key: 1, value: 'caregiver', optionString: 'Caregiver' }]}
                defaultValue={''}
              />
              <Controller
                name='drivingLicenseExpiryDate'
                control={control}
                // defaultValue={null} // Set the default value
                rules={{ required: 'Date of birth is required' }} // Validation rules
                render={({ field }) => (
                  <AppReactDatepicker
                    selected={field.value} // Bind value from react-hook-form
                    onChange={(date: Date | null) => field.onChange(date)} // Update react-hook-form on change
                    placeholderText='MM/DD/YYYY'
                    customInput={
                      <TextField
                        {...register(`drivingLicenseExpiryDate`)}
                        fullWidth
                        // error={!!errors.dateOfBirth}
                        // helperText={errors.dateOfBirth && 'please select a date'}
                        size='small'
                        placeholder='Expiry Date'
                        label='Expiry Date'
                      />
                    }
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  )
})

export default TrainingCertificatesComponent

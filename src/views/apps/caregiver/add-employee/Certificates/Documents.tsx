import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { Card, CardContent, Typography, TextField, Button, LinearProgress } from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import FileUploaderRestrictions from '@/@core/components/mui/FileUploader'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import PCAUMPITable from '../PcaUmpi/PCAUMPITable'

type Props = {
  onFinish: (data: any) => void
  defaultValues?: any
}

const DocumentsPage = forwardRef<{ handleSubmit: any }, Props>(({ onFinish, defaultValues }, ref) => {
  //  Certificates States
  const [trainingCertificates, setTrainingCertificates] = useState<File[]>([])
  const [drivingCertificates, setDrivingCertificates] = useState<File[]>([])

  // Documents Section States
  const [ssnFile, setSsnFile] = useState<File[]>([])
  const [adultFile, setAdultFile] = useState<File[]>([])
  const [umpiFile, setUmpiFile] = useState<File[]>([])
  const [clearanceFile, setClearanceFile] = useState<File[]>([])

  const methods = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      // Training Certificates default values
      trainingCertificateFiles: [],
      trainingCertificateName: '',
      trainingCertificateExpiryDate: null,
      drivingCertificateFiles: [],
      drivingLicenseNumber: '',
      drivingLicenseExpiryDate: null,
      dlState: '',

      // Documents Section default values
      ssnFileObject: [],
      adultFileObject: [],
      umpiFileObject: [],
      clearanceFileObject: [],
      employeeNumber: '',
      additionalPayRate: '',
      serviceType: ''
    },
    ...defaultValues
  })

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue
  } = methods

  // Expose handleSubmit to parent via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: (onValid: (data: any) => void) => handleSubmit(onValid)
  }))

  // Update form values when files are selected
  useEffect(() => {
    setValue('trainingCertificateFiles', trainingCertificates)
    setValue('drivingCertificateFiles', drivingCertificates)
    setValue('ssnFileObject', ssnFile)
    setValue('adultFileObject', adultFile)
    setValue('umpiFileObject', umpiFile)
    setValue('clearanceFileObject', clearanceFile)
  }, [trainingCertificates, drivingCertificates, ssnFile, adultFile, umpiFile, clearanceFile, setValue])

  const onSubmit = (data: any) => {
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
      },
      caregiverDocuments: {
        ssnFile: data.ssnFileObject || [],
        adultFile: data.adultFileObject || [],
        umpiFile: data.umpiFileObject || [],
        clearanceFile: data.clearanceFileObject || [],
        employeeNumber: data.employeeNumber,
        additionalPayRate: data.additionalPayRate,
        serviceType: data.serviceType
      }
    }

    console.log('Combined Form Data:', formData)
    onFinish(formData)
  }

  // Helper function to render file list with progress
  const renderFileProgress = (files: File[]) => {
    return files.map((file: File, index: number) => (
      <div key={index} className='p-3 rounded-lg border border-[#32475C] border-opacity-[22%]'>
        <div className='flex justify-between items-center mb-2'>
          <div className='flex items-center gap-10'>
            <div className='flex items-center gap-2'>
              <PictureAsPdfIcon />
              <Typography className='font-semibold text-green-600 text-sm'>{file.name} (100%)</Typography>
            </div>
            <div>
              <Typography className='font-semibold text-green-600 text-sm'>Completed</Typography>
            </div>
          </div>
        </div>
        <LinearProgress variant='determinate' value={100} color={'success'} />
      </div>
    ))
  }

  // Helper function to render simple file list
  const renderFileList = (files: File[], title: string) =>
    files.length > 0 && (
      <div className='p-4 rounded-lg border border-[#32475C] border-opacity-[22%]'>
        <Typography className='text-md font-semibold mb-2'>{title}</Typography>
        {files.map((file, index) => (
          <div key={index} className='flex items-center gap-2 mb-2'>
            <PictureAsPdfIcon />
            <span className='font-semibold text-green-600'>{file.name}</span>
          </div>
        ))}
      </div>
    )
  console.log('FILES', trainingCertificates, drivingCertificates, ssnFile, adultFile, umpiFile, clearanceFile)
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
        <PCAUMPITable />
        {/* Training Certificates Section */}
        <Card className='mt-5'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Training Certificates</Typography>
            {/* Training certificates content */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='col-span-1 p-3 rounded-lg border'>
                <FileUploaderRestrictions
                  onFilesSelected={setTrainingCertificates}
                  mimeType={['application/pdf']}
                  fileCount={3}
                  fileSize={25 * 1024 * 1024}
                  title='Choose Files'
                />
              </div>
              <div className='col-span-2'>
                <h3 className='text-lg font-semibold mb-4'>Uploading Files</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>{renderFileProgress(trainingCertificates)}</div>
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
                rules={{ required: 'Expiry date is required' }}
                render={({ field }) => (
                  <AppReactDatepicker
                    selected={field.value}
                    onChange={(date: Date | null) => field.onChange(date)}
                    placeholderText='MM/DD/YYYY'
                    customInput={<TextField fullWidth size='small' placeholder='Expiry Date' label='Expiry Date' />}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Driving License Section */}
        <Card className='mt-5'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Driving License</Typography>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {/* File Upload Section */}
              <div className='col-span-1 p-3 border rounded-lg'>
                <FileUploaderRestrictions
                  onFilesSelected={(selectedFiles: any) => {
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
                            <Typography className='font-semibold text-green-600 text-sm'>{file.name} (100%)</Typography>
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

        {/* Documents Section */}
        <Card className='mt-5'>
          <CardContent>
            <div className='p-6'>
              {/* Employee Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <CustomTextField
                  label={'Employee Number'}
                  placeHolder={'Employee Number'}
                  name={'employeeNumber'}
                  defaultValue={''}
                  type={'number'}
                  error={!!errors?.employeeNumber}
                  control={control}
                />
                <CustomTextField
                  label={'Additional Pay Rate'}
                  placeHolder={'Additional Pay Rate'}
                  name={'additionalPayRate'}
                  defaultValue={''}
                  type={'number'}
                  error={errors.additionalPayRate}
                  control={control}
                />
              </div>

              {/* Documents Upload Section */}
              {/* Documents Section */}
              <Typography className='text-xl font-semibold mb-6'>Documents</Typography>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
                <div className='p-4 rounded-lg border'>
                  <FileUploaderRestrictions
                    onFilesSelected={(selectedFiles: any) => {
                      setSsnFile(selectedFiles)
                    }}
                    mimeType={['application/pdf']}
                    fileCount={1}
                    fileSize={25 * 1024 * 1024}
                    title='Upload SSN'
                  />
                </div>
                <div className='p-4 rounded-lg border'>
                  <FileUploaderRestrictions
                    onFilesSelected={(selectedFiles: any) => {
                      setAdultFile(selectedFiles)
                    }}
                    mimeType={['application/pdf']}
                    fileCount={1}
                    fileSize={25 * 1024 * 1024}
                    title='Vulnerable Adult Mandated Certificate'
                  />
                </div>
                <div className='p-4 rounded-lg border'>
                  <FileUploaderRestrictions
                    onFilesSelected={(selectedFiles: any) => {
                      setUmpiFile(selectedFiles)
                    }}
                    mimeType={['application/pdf']}
                    fileCount={1}
                    fileSize={25 * 1024 * 1024}
                    title='UMPI Letter'
                  />
                </div>
                <div className='p-4 rounded-lg border'>
                  <FileUploaderRestrictions
                    onFilesSelected={(selectedFiles: any) => {
                      setClearanceFile(selectedFiles)
                    }}
                    mimeType={['application/pdf']}
                    fileCount={1}
                    fileSize={25 * 1024 * 1024}
                    title='Background Check Clearance'
                  />
                </div>
                <div className='col-span-2'>
                  <h2 className='text-base font-semibold mb-3'>Uploading Files</h2>
                  <div className='grid grid-cols-2 gap-6 mb-6'>
                    {renderFileList(ssnFile, 'SSN Document')}
                    {renderFileList(adultFile, 'Vulnerable Adult Certificate')}
                    {renderFileList(umpiFile, 'UMPI Letter')}
                    {renderFileList(clearanceFile, 'Background Check Clearance')}
                  </div>
                </div>
              </div>

              {/* Uploaded Files Section */}
              <h2 className='text-xl font-semibold mb-6'>Uploaded Files</h2>
              {/* Service Type & Submit Button */}
              <div className='mt-5'>
                <h2 className='text-xl font-semibold mb-4'>Service Type</h2>
                <div className='flex flex-col gap-0'>
                  {/* Service Type */}
                  <div className='w-[30%] mb-4'>
                    <CustomDropDown
                      label='Service Type'
                      optionList={[
                        { key: 1, value: 'All', optionString: 'All' },
                        { key: 2, value: 'Type 1', optionString: 'Type 1' },
                        { key: 3, value: 'Type 2', optionString: 'Type 2' }
                      ]}
                      name={'serviceType'}
                      control={control}
                      error={errors.serviceType}
                      defaultValue={''}
                    />
                  </div>

                  <Button className='!bg-[#4B0082] !text-white hover:!bg-[#4B0082] w-[20%]'>CREATE NEW ACCOUNT</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  )
})

export default DocumentsPage

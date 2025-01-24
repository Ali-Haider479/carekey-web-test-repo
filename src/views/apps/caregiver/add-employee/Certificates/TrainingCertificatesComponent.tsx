'use client'
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import CustomTextField from '@/@core/components/mui/TextField'
import { Button, Card, CardContent, LinearProgress, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import FileUploaderRestrictions from '@/@core/components/mui/FileUploader'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'

// interface DisplayFile {
//   id: number
//   status: 'success' | 'error' | 'uploading'
//   path: string // The full path of the file
//   relativePath: string // The relative path of the file
//   lastModified: number // The timestamp of the last modification
//   lastModifiedDate: Date // The date object representing the last modification time
//   name: string // The name of the file
//   size: number // The size of the file in bytes
//   type: string // The MIME type of the file
//   webkitRelativePath: string // The webkit-specific relative path of the file
// }

type Props = {
  // form?: any
  onFinish: any
}

// const TrainingCertificatesComponent = () => {
const TrainingCertificatesComponent = forwardRef<{ handleSubmit: any }, Props>(({ onFinish }, ref) => {
  const [trainingCertificates, setTrainingCertificates] = useState<any>([])
  const [drivingCertificates, setDrivingCertificates] = useState<any>([])

  const methods = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      trainingCertificateFiles: [],
      // trainingCertificateNames: ['', ''],
      drivingCertificateFiles: [],
      // drivingCertificateNames: ['', ''],
      trainingCertificateName: '',
      trainingCertificateExpiryDate: new Date(),
      drivingCertificateNames: '',
      drivingLicenseNumber: '',
      dlState: '',
      drivingLicenseExpiryDate: new Date()
    }
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
        certificateNames: data.trainingCertificateName,
        expiryDate: data.trainingCertificateExpiryDate
      },
      drivingCertificates: {
        files: data.drivingCertificateFiles || [],
        certificateNames: data.drivingCertificateNames,
        expiryDate: data.drivingLicenseExpiryDate,
        licenseNumber: data.drivingLicenseNumber,
        state: data.dlState
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
              <div className='col-span-1 p-3 rounded-lg'>
                <FileUploaderRestrictions
                  onFilesSelected={selectedFiles => {
                    setTrainingCertificates(selectedFiles)
                  }}
                  mimeType={['application/pdf', 'image/jpeg', 'image/png']}
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
                    <div key={index} className='p-4 rounded-lg border border-[#32475C] border-opacity-[22%]'>
                      <div className='flex justify-between items-center mb-2'>
                        <div className='flex items-center gap-2'>
                          <PictureAsPdfIcon />
                          <span className='font-semibold text-green-600'>{file.name} (100%)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
              <CustomTextField
                {...register(`trainingCertificateName`)}
                placeholder='Enter Certificate Name'
                label='Certificate Name'
              />
              <CustomTextField
                {...register(`trainingCertificateExpiryDate`)}
                placeholder='Expiry Date'
                label='Expiry Date'
              />
            </div>
          </CardContent>
        </Card>

        <Card className='mt-5'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Caregiver Notes</Typography>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {/* File Upload Section */}
              <div className='col-span-1 p-3 rounded-lg'>
                <FileUploaderRestrictions
                  onFilesSelected={selectedFiles => {
                    setDrivingCertificates(selectedFiles)
                  }}
                  mimeType={['application/pdf', 'image/jpeg', 'image/png']}
                  fileCount={3}
                  fileSize={25 * 1024 * 1024} // 25MB
                />
              </div>

              {/* Uploading Files Section */}
              <div className='col-span-2'>
                <h3 className='text-lg font-semibold mb-4'>Uploading Files</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {drivingCertificates.map((file: File, index: number) => (
                    <div key={index} className='p-4 rounded-lg border border-[#32475C] border-opacity-[22%]'>
                      <div className='flex justify-between items-center mb-2'>
                        <div className='flex items-center gap-2'>
                          <PictureAsPdfIcon />
                          <span className='font-semibold text-green-600'>{file.name} (100%)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
              <CustomTextField
                {...register(`drivingCertificateNames`)}
                placeholder='Enter Certificate Name'
                label='Certificate Name'
              />
              <CustomTextField
                {...register(`drivingLicenseExpiryDate`)}
                placeholder='Expiry Date'
                label='Expiry Date'
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  )
})

export default TrainingCertificatesComponent

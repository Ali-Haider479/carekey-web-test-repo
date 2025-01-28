'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import {
  type UseFormRegister,
  type FieldErrorsImpl,
  type UseFormSetValue,
  type UseFormWatch,
  useFormContext,
  FormProvider,
  useForm
} from 'react-hook-form'
import CustomDropDown from '@core/components/custom-inputs/CustomDropDown'
import CustomTextField from '@core/components/custom-inputs/CustomTextField'
import { Button, Card, CardContent, Typography } from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import FileUploaderRestrictions from '@/@core/components/mui/FileUploader'

interface DisplayFile {
  id: number
  name: string
  status: 'success' | 'error' | 'uploading'
  progress: number
}

interface DocumentsFormData {
  employeeNumber: string
  additionalPayRate: string
  serviceType: string
  trainingFiles?: any
}

type Props = {
  onFinish: any
}

const DocumentsSection = forwardRef<{ handleSubmit: any }, Props>(({ onFinish }, ref) => {
  const [ssnFile, setSsnFile] = useState<any>([])
  const [adultFile, setAdultFile] = useState<any>([])
  const [umpiFile, setUmpiFile] = useState<any>([])
  const [clearanceFile, setClearanceFile] = useState<any>([])

  const methods = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      ssnFileObject: [],
      adultFileObject: [],
      umpiFileObject: [],
      clearanceFileObject: [],
      employeeNumber: '',
      additionalPayRate: '',
      serviceType: ''
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
    setValue('ssnFileObject', ssnFile)
  }, [ssnFile, setValue])

  useEffect(() => {
    setValue('adultFileObject', adultFile)
  }, [adultFile, setValue])

  useEffect(() => {
    setValue('umpiFileObject', umpiFile)
  }, [umpiFile, setValue])

  useEffect(() => {
    setValue('clearanceFileObject', clearanceFile)
  }, [clearanceFile, setValue])

  const onSubmit = (data: any) => {
    const formData = {
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

    console.log('Submitted Training Certificates Data:', formData)
    onFinish(formData)
  }

  // Helper function to render file list
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
        <Card className='mt-5'>
          <CardContent>
            <div className='p-6 text-white'>
              {/* Employee Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                {/* Employee Number */}
                <div>
                  <CustomTextField
                    label={'Employee Number'}
                    placeHolder={'Employee Number'}
                    name={'employeeNumber'}
                    defaultValue={''}
                    type={'number'}
                    error={!!errors?.employeeNumber}
                    control={control}
                  />
                </div>

                {/* Additional Pay Rate */}
                <div>
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
              </div>

              {/* Documents Section */}
              <Typography className='text-xl font-semibold mb-6'>Documents</Typography>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
                <div className='p-4 rounded-lg border'>
                  <FileUploaderRestrictions
                    onFilesSelected={selectedFiles => {
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
                    onFilesSelected={selectedFiles => {
                      setAdultFile(selectedFiles)
                    }}
                    mimeType={['application/pdf', 'image/jpeg', 'image/png']}
                    fileCount={1}
                    fileSize={25 * 1024 * 1024}
                    title='Vulnerable Adult Mandated Certificate'
                  />
                </div>
                <div className='p-4 rounded-lg border'>
                  <FileUploaderRestrictions
                    onFilesSelected={selectedFiles => {
                      setUmpiFile(selectedFiles)
                    }}
                    mimeType={['application/pdf', 'image/jpeg', 'image/png']}
                    fileCount={1}
                    fileSize={25 * 1024 * 1024}
                    title='UMPI Letter'
                  />
                </div>
                <div className='p-4 rounded-lg border'>
                  <FileUploaderRestrictions
                    onFilesSelected={selectedFiles => {
                      setClearanceFile(selectedFiles)
                    }}
                    mimeType={['application/pdf', 'image/jpeg', 'image/png']}
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
              {/* <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {renderFileList(ssnFile, 'SSN Document')}
                {renderFileList(adultFile, 'Vulnerable Adult Certificate')}
                {renderFileList(umpiFile, 'UMPI Letter')}
                {renderFileList(clearanceFile, 'Background Check Clearance')}
              </div> */}

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

export default DocumentsSection

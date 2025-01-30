'use client'
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Button, Card, CardContent, LinearProgress, TextField, Typography } from '@mui/material'
import { Controller, FormProvider, useForm } from 'react-hook-form'
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
  defaultValues: any
}

// const TrainingCertificatesComponent = () => {
const DocumentsForm = forwardRef<{ handleSubmit: any }, Props>(({ onFinish, defaultValues }, ref) => {
  const [documents, setDocuments] = useState<any>([])

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
    setValue('documentFiles', documents)
  }, [documents, setValue])

  const onSubmit = (data: any) => {
    // Combine files and form data
    const formData = {
      documents: {
        files: data.documentFiles || []
      }
    }

    console.log('Submitted Documents Data:', formData)
    onFinish(formData) // Pass comprehensive form data to parent
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
        <Card className='mt-5'>
          <CardContent>
            <Typography className='text-xl font-semibold mb-4'>Documents</Typography>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {/* File Upload Section */}
              <div className='col-span-1 p-3 rounded-lg border'>
                <FileUploaderRestrictions
                  onFilesSelected={selectedFiles => {
                    setDocuments(selectedFiles)
                  }}
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
                  {documents.map((file: File, index: number) => (
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
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  )
})

export default DocumentsForm

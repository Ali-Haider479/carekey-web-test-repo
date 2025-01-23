'use client'

import React, { useEffect, useState } from 'react'
import { Button, Progress, Upload, message } from 'antd'
import { UploadOutlined, FilePdfOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import type { RcFile } from 'antd/es/upload'
import {
  type UseFormRegister,
  type FieldErrorsImpl,
  type UseFormSetValue,
  type UseFormWatch,
  useFormContext
} from 'react-hook-form'
import CustomDropDown from '@core/components/custom-inputs/CustomDropDown'
import CustomTextField from '@core/components/custom-inputs/CustomTextField'

interface DisplayFile {
  id: number
  name: string
  status: 'success' | 'error' | 'uploading'
  progress: number
}

// Example form data interface
interface DocumentsFormData {
  employeeNumber: string
  additionalPayRate: string
  serviceType: string
  trainingFiles?: UploadFile[]
}

interface Props {
  register: any
  watch: any
  setValue: any
}

const DocumentsSection = ({ register, watch, setValue }: Props) => {
  const [s3Files, setS3Files] = useState<UploadFile[]>([])
  const [displayFiles, setDisplayFiles] = useState<DisplayFile[]>([])

  const {
    control,
    formState: { errors }
  } = useFormContext()

  useEffect(() => {
    // Sync local file state with form state
    setValue('trainingFiles', s3Files)
  }, [s3Files, setValue])

  const handleRemoveFile = (fileId: number) => {
    setDisplayFiles(prev => prev.filter(file => file.id !== fileId))
    const removedFile = displayFiles.find(f => f.id === fileId)
    if (removedFile) {
      const newS3Files = s3Files.filter(f => f.name !== removedFile.name)
      setS3Files(newS3Files)
      setValue('trainingFiles', newS3Files)
    }
  }

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isAllowed = file.size / 1024 / 1024 < 50
      const timestamp = Date.now()
      const uid = `document-${timestamp}-${s3Files.length + 1}`

      if (!isAllowed) {
        setDisplayFiles(prev => [...prev, { id: timestamp, name: file.name, status: 'error', progress: 100 }])
        message.error('File size must be less than 50MB')
      } else {
        const s3File: UploadFile = {
          uid,
          lastModified: file.lastModified,
          lastModifiedDate: new Date(file.lastModified),
          name: file.name,
          size: file.size,
          type: file.type,
          percent: 0,
          originFileObj: file as RcFile
        }

        const newS3Files = [...s3Files, s3File]
        setS3Files(newS3Files)
        setValue('trainingFiles', newS3Files)

        setDisplayFiles(prev => [...prev, { id: timestamp, name: file.name, status: 'success', progress: 100 }])
      }
      return false
    },
    onRemove: (file: UploadFile) => {
      const newS3Files = s3Files.filter(f => f.uid !== file.uid)
      setS3Files(newS3Files)
      setValue('trainingFiles', newS3Files)
      setDisplayFiles(prev => prev.filter(f => f.name !== file.name))
    },
    fileList: s3Files
  }

  return (
    <div className='p-6 bg-white rounded-lg shadow-md'>
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
            error={errors.employeeNumber}
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
      <h2 className='text-xl font-semibold mb-6'>Documents</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
        {['Upload SSN', 'Vulnerable Adult Mandated Certificate', 'UMPI Letter', 'Background Check Clearance'].map(
          (doc, idx) => (
            <div key={idx} className='bg-gray-100 p-4 rounded-lg flex flex-col items-center'>
              <div className='text-purple-500 mb-4'>
                <FilePdfOutlined style={{ fontSize: '2rem' }} />
              </div>
              <span className='text-gray-600 mb-2'>{doc}</span>
              <Upload {...uploadProps} showUploadList={false}>
                <Button
                  icon={<UploadOutlined />}
                  className='!text-gray-500 !border-gray-300 hover:!text-gray-700 hover:!border-gray-400'
                >
                  CHOOSE FILE
                </Button>
              </Upload>
              <p className='mt-4 text-sm text-gray-600'>
                File must be less than <span className='font-semibold'>50mb</span>
              </p>
              <p className='text-sm text-gray-600'>
                Allowed file types: <span className='font-semibold'>pdf, jpeg, jpg, png, doc</span>
              </p>
            </div>
          )
        )}
      </div>

      {/* Uploading Files Section */}
      <h2 className='text-xl font-semibold mb-6'>Uploading Files</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {displayFiles.map(file => (
          <div
            key={file.id}
            className={`p-4 rounded-lg border ${
              file.status === 'success' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
            }`}
          >
            <div className='flex justify-between items-center mb-2'>
              <div className='flex items-center gap-2'>
                <FilePdfOutlined className='text-xl text-gray-600' />
                <span className={`font-semibold ${file.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {file.name} (100%)
                </span>
              </div>
              {file.status === 'error' ? (
                <Button
                  type='link'
                  onClick={() => handleRemoveFile(file.id)}
                  className='text-red-500 hover:text-red-700'
                >
                  Cancel
                </Button>
              ) : (
                <span className='text-green-600 font-semibold'>Completed</span>
              )}
            </div>
            <Progress
              percent={file.progress}
              size='small'
              status={file.status === 'success' ? 'active' : 'exception'}
              strokeColor={file.status === 'success' ? '#52c41a' : '#ff4d4f'}
            />
          </div>
        ))}
      </div>

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
              defaultValue={''} // wire up with register
            />
          </div>

          <Button type='primary' className='!bg-[#4B0082] !text-white hover:!bg-[#4B0082] w-[20%]'>
            CREATE NEW ACCOUNT
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DocumentsSection

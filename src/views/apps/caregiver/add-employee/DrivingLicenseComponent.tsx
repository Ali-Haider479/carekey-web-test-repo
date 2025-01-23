'use client'
import React, { useEffect, useState } from 'react'
import { Button, Progress, Upload, Form, DatePicker, UploadFile, message, FormInstance } from 'antd'
import { UploadOutlined, FilePdfOutlined } from '@ant-design/icons'
import CustomTextField from '@core/components/custom-inputs/CustomTextField'
import { RcFile } from 'antd/es/upload'

interface DisplayFile {
  id: number
  name: string
  status: 'success' | 'error' | 'uploading'
  progress: number
}

interface Props {
  form: FormInstance
  onFinish: (values: any) => void
}

const DrivingLicenseComponent = ({ form, onFinish }: Props) => {
  const [s3Files, setS3Files] = useState<UploadFile[]>([])
  const [displayFiles, setDisplayFiles] = useState<DisplayFile[]>([])

  useEffect(() => {
    // Update form with driving files specifically
    form.setFieldsValue({
      drivingFiles: s3Files
    })
  }, [s3Files, form])

  const handleRemoveFile = (fileId: number) => {
    setDisplayFiles(displayFiles.filter(file => file.id !== fileId))
    const displayFile = displayFiles.find(file => file.id === fileId)
    if (displayFile) {
      const newS3Files = s3Files.filter(file => file.name !== displayFile.name)
      setS3Files(newS3Files)
      form.setFieldsValue({
        drivingFiles: newS3Files
      })
    }
  }

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isAllowed = file.size / 1024 / 1024 < 50
      const timestamp = Date.now()
      const uid = `driving-${timestamp}-${s3Files.length + 1}`

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
          originFileObj: {
            lastModified: file.lastModified,
            lastModifiedDate: new Date(file.lastModified),
            name: file.name,
            size: file.size,
            type: file.type,
            uid
          } as RcFile
        }

        const newS3Files = [...s3Files, s3File]
        setS3Files(newS3Files)
        setDisplayFiles(prev => [...prev, { id: timestamp, name: file.name, status: 'success', progress: 100 }])

        form.setFieldsValue({
          drivingFiles: newS3Files
        })
      }
      return false
    },
    onRemove: (file: UploadFile) => {
      const newS3Files = s3Files.filter(f => f.uid !== file.uid)
      setS3Files(newS3Files)
      setDisplayFiles(prev => prev.filter(f => f.name !== file.name))
      form.setFieldsValue({
        drivingFiles: newS3Files
      })
    },
    fileList: s3Files
  }

  return (
    <div className='mt-5'>
      <Form layout='vertical' form={form} autoComplete='off' className='p-6 bg-white rounded-lg shadow-md'>
        <h2 className='text-xl font-semibold mb-6'>Driving License</h2>
        <Form.Item name='drivingFiles' hidden>
          <input type='hidden' />
        </Form.Item>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* File Upload Section */}
          <div className='col-span-1 bg-gray-100 p-6 rounded-lg flex flex-col items-center justify-center'>
            <div className='text-purple-500 mb-4'>
              <FilePdfOutlined style={{ fontSize: '2rem' }} />
            </div>
            <span className='text-gray-500 mb-2'>No File Chosen</span>
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

          {/* Uploading Files Section */}
          <div className='col-span-2'>
            <h3 className='text-lg font-semibold mb-4'>Uploading Files</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {displayFiles.map(file => (
                <div
                  key={file.id}
                  className={`p-4 rounded-lg border ${
                    file.status === 'success'
                      ? 'border-[#32475C] border-opacity-[22%] bg-white'
                      : 'border-[#32475C] border-opacity-[22%] bg-white'
                  }`}
                >
                  <div className='flex justify-between items-center mb-2'>
                    <div className='flex items-center gap-2'>
                      <FilePdfOutlined className='text-xl text-gray-600' />
                      <span
                        className={`font-semibold ${file.status === 'success' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {file.name} (100%)
                      </span>
                    </div>
                    <Button
                      type='link'
                      onClick={() => handleRemoveFile(file.id)}
                      className={`${
                        file.status === 'error'
                          ? 'text-red-500 hover:text-red-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {file.status === 'error' ? 'Cancel' : 'Remove'}
                    </Button>
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
          </div>
        </div>

        {/* Certificate Details */}
        <div className='flex gap-6 mt-6'>
          <Form.Item
            name='drivingLicenseName'
            rules={[{ required: true, message: 'Please enter the certificate name' }]}
          >
            <CustomTextField
              label='Certificate Name'
              placeHolder={'Certificate Name'}
              name={''}
              defaultValue={undefined}
              type={undefined}
              error={undefined}
              control={undefined}
            />
          </Form.Item>
          <Form.Item name='drivingLicensedlState' rules={[{ required: true, message: 'Please select the DL State' }]}>
            <CustomTextField
              label={'Driving License'}
              placeHolder={'Driving License'}
              name={''}
              defaultValue={undefined}
              type={undefined}
              error={undefined}
              control={undefined}
            />
          </Form.Item>
          <Form.Item
            name='drivingLicenseexpiryDate'
            rules={[{ required: true, message: 'Please select the expiry date' }]}
          >
            <DatePicker className='w-full' placeholder='Expiry Date' size='large' />
          </Form.Item>
        </div>
      </Form>
    </div>
  )
}

export default DrivingLicenseComponent

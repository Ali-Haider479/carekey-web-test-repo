'use client'
import React from 'react'
import DrivingLicenseComponent from '@/views/apps/caregiver/add-employee/Certificates/DrivingLicenseComponent'
import PageNavigationButtons from '@layouts/components/horizontal/PageNavigationButtons'
import TrainingCertificatesComponent from '@/views/apps/caregiver/add-employee/Certificates/TrainingCertificatesComponent'
import { useForm } from 'antd/es/form/Form'
import { useRouter } from 'next/navigation'
import { message } from 'antd'

const TrainingCertificates = () => {
  const router = useRouter()
  const [form] = useForm()

  const handleNext = async () => {
    try {
      const values = await form.validateFields()

      // Get files from both components
      const formData = {
        trainingCertificates: {
          files: values.trainingFiles || [],
          certificateName: values.certificateName,
          expiryDate: values.expiryDate
        },
        drivingLicense: {
          files: values.drivingFiles || [],
          certificateName: values.drivingLicenseName,
          dlState: values.drivingLicensedlState,
          expiryDate: values.drivingLicenseexpiryDate
        }
      }

      // Check if required files are uploaded
      if (!formData.trainingCertificates.files?.length) {
        message.error('Please upload at least one training certificate')
        return
      }

      if (!formData.drivingLicense.files?.length) {
        message.error('Please upload driving license')
        return
      }

      console.log('Form Data:', formData)

      // Store in localStorage
      localStorage.setItem('caregiverDocuments', JSON.stringify(formData))

      // Navigate to next page
      router.push('/caregiver/add-employee/documents')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      message.error(`Please fill in all required fields: ${errorMessage}`)
    }
  }

  const handleBack = () => {
    router.push('/caregiver/add-employee/pca-info')
  }

  return (
    <div>
      <div>
        <TrainingCertificatesComponent form={form} />
      </div>
      <div>
        <DrivingLicenseComponent form={form} onFinish={values => console.log('Driving Values:', values)} />
      </div>
      <div className='mt-5'>
        <PageNavigationButtons onClickNext={handleNext} onClickBack={handleBack} />
      </div>
    </div>
  )
}

export default TrainingCertificates

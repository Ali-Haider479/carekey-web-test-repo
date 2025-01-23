'use client'
import PageNavigationButtons from '@layouts/components/horizontal/PageNavigationButtons'
import PersonalDetailsForm from '@/views/apps/caregiver/add-employee/PersonalDetailsAndNotes/PersonalDetailsForm'
import { useForm, FormProvider } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import CaregiverNotes from '@/views/apps/caregiver/add-employee/PersonalDetailsAndNotes/CaregiverNotes'

const PersonalDetails = () => {
  const router = useRouter()
  const form = useForm()

  const onFinish = (values: any) => {
    console.log('Form Values BASIC DETAIL PAGE:', values)
    if (values && values !== undefined) {
      localStorage.setItem('caregiverBaisicDetails', JSON.stringify({ ...values, tenantId: 1, userId: 1 }))
      handleNext()
    }
  }

  const handleNext = () => {
    router.push('/caregiver/add-employee/login-info')
  }

  const handleBack = () => {
    router.push('/caregiver/list')
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onFinish)}>
        <div>
          <PersonalDetailsForm onFinish={onFinish} />
        </div>
        <div>
          <CaregiverNotes onFinish={onFinish} />
        </div>
        <div className='mt-5'>
          <PageNavigationButtons form={form} onClickBack={handleBack} />
        </div>
      </form>
    </FormProvider>
  )
}

export default PersonalDetails

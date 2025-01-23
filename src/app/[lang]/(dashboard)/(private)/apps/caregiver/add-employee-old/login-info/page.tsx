'use client'
import LoginInfoComponent from '@/views/apps/caregiver/add-employee/LoginInfoComponent'
import PageNavigationButtons from '@layouts/components/horizontal/PageNavigationButtons'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'

const LoginInfo = () => {
  const router = useRouter()
  const form = useForm()
  const onFinish = (values: any) => {
    console.log('Form Values: LOGIN INFO PAGE', values)
    if (values && values !== undefined) {
      localStorage.setItem('caregiverLoginInfo', JSON.stringify({ ...values, tenantId: 1 }))
      handleNext()
    }
  }
  const handleNext = () => {
    router.push('/caregiver/add-employee/pca-info')
  }

  const handleBack = () => {
    router.push('/caregiver/add-employee/personal-details')
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onFinish)}>
        <div>
          <LoginInfoComponent onFinish={onFinish} form={form} />
        </div>
        <div className='mt-5'>
          <PageNavigationButtons form={form} onClickBack={handleBack} />
        </div>
      </form>
    </FormProvider>
  )
}

export default LoginInfo

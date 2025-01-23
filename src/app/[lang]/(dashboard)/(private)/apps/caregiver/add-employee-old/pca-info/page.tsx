'use client'
import PageNavigationButtons from '@layouts/components/horizontal/PageNavigationButtons'
import PCAUMPITable from '@views/apps/caregiver/add-employee/PCAUMPITable'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'

const PCAInfo = () => {
  const form = useForm()
  const router = useRouter()
  const handleNext = () => {
    router.push('/caregiver/add-employee/training-certificates')
  }

  const handleBack = () => {
    router.push('/caregiver/add-employee/login-info')
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleNext)}>
        <div>
          <PCAUMPITable />
        </div>
        <div className='mt-5'>
          <PageNavigationButtons onClickNext={handleNext} onClickBack={handleBack} />
        </div>
      </form>
    </FormProvider>
  )
}

export default PCAInfo

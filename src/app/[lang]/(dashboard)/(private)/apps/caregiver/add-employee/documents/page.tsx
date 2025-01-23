'use client'
import DocumentsSection from '@/views/apps/caregiver/add-employee/DocumentsSection'
import api from '@/utils/api'
import { message } from 'antd'
import PageNavigationButtons from '@layouts/components/horizontal/PageNavigationButtons'
import { useRouter } from 'next/navigation'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

interface DocumentsFormData {
  trainingFiles?: File[] // For example, if you have an upload
  serviceType?: string
  // ... add more fields as required by DocumentsSection
}

const Documents = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<DocumentsFormData>()

  const form = useForm()

  const onSubmit: SubmitHandler<DocumentsFormData> = async values => {
    try {
      console.log('VALUES from React Hook Form:', values)

      // Example check if training files exist
      // if (!values.trainingFiles || values.trainingFiles.length === 0) {
      //   message.error("Please upload at least one training certificate");
      //   return;
      // }

      const caregiverLoginInfo = JSON.parse(localStorage.getItem('caregiverLoginInfo') || '{}')
      const caregiverBaisicDetails = JSON.parse(localStorage.getItem('caregiverBaisicDetails') || '{}')
      const caregiverDocuments = JSON.parse(localStorage.getItem('caregiverDocuments') || '{}')

      console.log('DATA TO SAVE =>', caregiverLoginInfo, caregiverBaisicDetails, caregiverDocuments)

      // 1) Create User
      const userPayload = {
        userName: caregiverLoginInfo.userName,
        emailAddress: caregiverLoginInfo.emailAddress,
        password: caregiverLoginInfo.password,
        role: caregiverLoginInfo.role,
        tenantId: caregiverLoginInfo.tenantId,
        accountStatus: caregiverLoginInfo.accountStatus,
        joinDate: '2023-01-15'
      }
      const createUser = await api.post('/user', userPayload)
      console.log('CREATEUSER RESPONSE', createUser)

      // 2) Create User Address
      const addressPayload = {
        address: caregiverLoginInfo.address,
        city: caregiverLoginInfo.city,
        state: caregiverLoginInfo.state,
        zipCode: caregiverLoginInfo.zipCode,
        addressType: 'Mailing'
      }
      const createUserAddress = await api.post('/address', addressPayload)
      console.log('CREATEUSERADDRESS RESPONSE', createUserAddress)

      // 3) Create Caregiver
      const caregiverPayload = {
        firstName: caregiverBaisicDetails.firstName,
        middleName: caregiverBaisicDetails.middleName,
        lastName: caregiverBaisicDetails.lastName,
        caregiverUMPI: caregiverBaisicDetails.caregiverUMPI,
        dateOfBirth: caregiverBaisicDetails.dob,
        caregiverLevel: caregiverBaisicDetails.caregiverLevel,
        ssn: caregiverBaisicDetails.ssn,
        payRate: caregiverBaisicDetails.payRate,
        dateOfHire: caregiverBaisicDetails.dateOfHire,
        terminationDate: caregiverBaisicDetails.terminationDate,
        gender: caregiverBaisicDetails.gender,
        primaryPhoneNumber: caregiverBaisicDetails.phoneNumber,
        emergencyContactNumber: caregiverBaisicDetails.secondaryPhoneNumber,
        emergencyEmailId: caregiverBaisicDetails.emergencyEmail,
        overtimeAgreement: caregiverBaisicDetails.overtimeAgreement,
        isLicensed245d: caregiverBaisicDetails.licensed,
        tenantId: 1,
        userId: createUser.id
      }
      const storeBasicDetails = await api.post('/caregivers', caregiverPayload)
      console.log('CREATECAREGIVER RESPONSE', storeBasicDetails)

      // 4) Create Caregiver Notes
      const notesPayload = {
        allergies: caregiverBaisicDetails.allergies,
        specialRequests: caregiverBaisicDetails.specialRequests,
        comments: caregiverBaisicDetails.comments,
        caregiverId: storeBasicDetails.id
      }
      const storeNotes = await api.post('/caregivers/notes', notesPayload)
      console.log('CREATECAREGIVER NOTES RESPONSE', storeNotes)

      // 5) Link Address to Caregiver
      const caregiverAddressPayload = {
        caregiverId: storeBasicDetails.id,
        addressId: createUserAddress.id
      }
      const storeCGAddress = await api.post('/caregivers/addresses', caregiverAddressPayload)
      console.log('CREATECAREGIVER ADDRESS RESPONSE', storeCGAddress)

      // 6) Create client-user link
      const clientUserPayload = {
        assignmentDate: '2022-06-01',
        unassignmentDate: '2023-06-01',
        notes: 'Assigned to a new caregiver.',
        scheduleHours: 8,
        clientId: 1,
        tenantId: 1,
        userId: createUser.id
      }
      console.log('CLIENT USER PAYLOAD', clientUserPayload)
      const createClientUser = await api.post('/user/createClientUser', clientUserPayload)
      console.log('CLIENT USER RESP', createClientUser)

      // 7) If desired, store some or all data in localStorage again
      // localStorage.setItem("caregiverLastDocuments", JSON.stringify(values));

      // 8) Navigate to next page
      router.push('/caregiver/list')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      message.error(`Please fill in all required fields: ${errorMessage}`)
    }
  }

  // We hook up onSubmit to handleNext
  const handleNext = () => {
    // Instead of form.validateFields(), we use handleSubmit from React Hook Form
    handleSubmit(onSubmit)()
  }

  const handleBack = () => {
    router.push('/caregiver/add-employee/training-certificates')
  }
  return (
    <FormProvider {...form}>
      <div>
        <DocumentsSection register={register} watch={watch} setValue={setValue} />
      </div>
      <div className='mt-5'>
        <PageNavigationButtons onClickNext={handleNext} onClickBack={handleBack} />
      </div>
    </FormProvider>
  )
}

export default Documents

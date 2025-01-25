'use client'

// React Imports
import { useRef, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import CardContent from '@mui/material/CardContent'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Styled Component Imports
import StepperWrapper from '@core/styles/stepper'
import StepperCustomDot from '@components/stepper-dot'
import PersonalDetailsForm from './PersonalDetailsAndNotes/PersonalDetailsForm'
import LoginInfoComponent from './LoginInfoAndMailingAddress/LoginInfoComponent'
import PCAUMPITable from './PcaUmpi/PCAUMPITable'
import { FormDataType } from '../../invoice/add/AddCustomerDrawer'
import { useRouter } from 'next/navigation'
import TrainingCertificatesComponent from './Certificates/TrainingCertificatesComponent'
import DocumentsSection from './Certificates/DocumentsSection'
import { PersonalDetailsFormDataType } from './types'
import axios from 'axios'

// Vars
const steps = [
  {
    title: '0',
    subtitle: 'Personal Details & Caregiver Notes'
  },
  {
    title: '1',
    subtitle: 'Login Info & Mailing Address'
  },
  {
    title: '2',
    subtitle: 'PCA UMPI Information'
  },
  {
    title: '3',
    subtitle: 'Training Certificate & Driving License'
  },
  {
    title: '4',
    subtitle: 'Documents'
  }
]

const EmployeeStepper = () => {
  // States
  const [activeStep, setActiveStep] = useState(0)
  const [caregiverData, setCaregiverData] = useState<any>([])
  const [loginInfo, setLoginInfo] = useState<any>([])
  const [certificatesData, setCertificatesData] = useState<any>([])
  const [documentsData, setDocumentsData] = useState<any>([])

  const router = useRouter()

  const personalDetailsFormRef = useRef<any>(null)
  const certificatesFormRef = useRef<any>(null)
  const loginInfoFormRef = useRef<any>(null)
  const documentsFormRef = useRef<any>(null)

  const handleReset = () => {
    setActiveStep(0)
  }

  // const handleImageChange = async (file: File) => {
  //   try {
  //     setLoading(true)
  //     const formData = new FormData()
  //     formData.append('image', file)

  //     const response = await axios.post(
  //       `${process.env.NEXT_PUBLIC_API_URL}/user/${tenantData?.users[0]?.id}/profile-image`,
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data'
  //         }
  //       }
  //     )
  //     console.log('UPDATE RESPONSE', response.data)
  //     // Update the fileUrl state with the new image URL after successful upload
  //     if (response.data?.profileImageUrl) {
  //       setFileUrl(response.data.profileImageUrl)
  //     }
  //     setLoading(false)
  //   } catch (error) {
  //     console.error('Update image error:', error)
  //     setLoading(false)
  //   }
  // }

  // const handleSave = async () => {
  //   handleNext()
  //   console.log('Inside on save', certificatesData)
  //   try {
  //     // Create a FormData object
  //     const formData = new FormData()

  //     // Append each file in the trainingCertificateFiles array
  //     certificatesData?.trainingCertificateFiles.forEach((file: { path: string }) => {
  //       const fileBlob = new Blob([file.path], { type: 'application/pdf' }) // Adjust MIME type if needed
  //       console.log('FILES BLOB', fileBlob)
  //       formData.append('file', fileBlob, file.path) // Add file to the form
  //     })

  //     // Append other fields to the form
  //     formData.append('trainingCertificateExpiryDate', certificatesData.trainingCertificateExpiryDate)
  //     formData.append('trainingCertificateName', certificatesData.trainingCertificateName)
  //     console.log('FORMDATA OF TRAINING CERTIFICATES', formData)
  //     // Make the API call
  //     const response = axios.post(`${process.env.NEXT_PUBLIC_API_URL}/caregivers/document`, formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data'
  //       }
  //     })

  //     // Handle the response
  //     console.log('Response:AFTER UPLOAD------------', response)
  //   } catch (error) {
  //     console.error('Error uploading files:', error)
  //   }
  // }

  const handleSave = async () => {
    handleNext()
    const userPayload = {
      userName: loginInfo.userName,
      emailAddress: loginInfo.emailAddress,
      password: loginInfo.password,
      additionalEmailAddress: loginInfo.additionalEmailAddress,
      accountStatus: loginInfo.accountStatus,
      joinDate: new Date()
    }
    console.log('IUSER PAYLOAD', userPayload)
    const mailingAddress = {
      city: loginInfo.city,
      state: loginInfo.state,
      zipCode: loginInfo.zipCode,
      address: loginInfo.address,
      addressType: loginInfo.addressType
    }

    // const residentialAddress = {
    //   city: caregiverData.city,
    //   state: caregiverData.state,
    //   zipCode: caregiverData.zipCode,
    //   address: caregiverData.address,
    //   addressType: caregiverData.addressType
    // }

    // const caregiverNotes = {
    //   allergies: caregiverData.allergies,
    //   specialRequests: caregiverData.specialRequests,
    //   comments: caregiverData.comments
    // }

    const userResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user`, userPayload)
    // const caregiverMailingAddress = await axios.post(
    //   `${process.env.NEXT_PUBLIC_API_URL}/caregiver/addresses`,
    //   mailingAddress
    // )

    const caregiverPayload = {
      ...caregiverData,
      userId: userResponse.data.id,
      tenantId: 1
    }

    console.log('caregiverPayload', caregiverPayload)
    const caregiverResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/caregivers`, caregiverPayload)

    console.log('userResponse', userResponse)
    console.log('caregiverResponse', caregiverResponse)
    // console.log('Residential Address', residentialAddress)
    // console.log('Caregiver Notes', caregiverNotes)
    // console.log('Caregiver Payload', caregiverPayload)
    // try {
    //   // Create a FormData object
    //   const formData = new FormData()
    //   console.log('INSIDE HANDLE SAVE', certificatesData)
    //   // Append files
    //   certificatesData?.trainingCertificateFiles.forEach((file: { path: string }) => {
    //     const fileBlob = new Blob([file.path], { type: 'application/pdf' })
    //     formData.append('file', fileBlob, file.path)
    //   })

    //   // Append additional parameters
    //   formData.append('documentType', 'trainingCertificate')
    //   formData.append('expiryDays', '365') // Or calculate from expiry date
    //   formData.append('caregiverId', '1') // Your caregiver ID

    //   // Additional metadata can be appended as well
    //   formData.append('trainingCertificateExpiryDate', certificatesData.trainingCertificateExpiryDate)
    //   formData.append('trainingCertificateName', certificatesData.trainingCertificateName)
    //   console.log('FORM DATA', formData)
    //   // Make the API call
    //   const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/caregivers/document`, formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   })

    //   console.log('Response after upload:', response)
    // } catch (error) {
    //   console.error('Error uploading files:', error)
    // }
  }

  // const handleSave = () => {
  //   try {
  //     const formData = new FormData()
  //     formData.append('image', file)
  //     const payLoad = {}
  //     const uploadDocs = axios.post(`${process.env.NEXT_PUBLIC_API_URL}/caregivers/document`, certificatesData)
  //     // const createUser = axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, loginInfo)
  //     // const saveCaregiver = axios.post(`${process.env.NEXT_PUBLIC_API_URL}/caregivers`, {
  //     //   ...caregiverData,
  //     //   userId: createUser?.data?.id,
  //     //   tenantId: 1
  //     // })
  //     // const createDocuments = axios.post(`${process.env.NEXT_PUBLIC_API_URL}/documents`, documentsData)
  //     // const createCertificates = axios.post(`${process.env.NEXT_PUBLIC_API_URL}/certificates`, certificatesData)

  //     // Promise.all([createUser, saveCaregiver]).then(() => {
  //     //   router.replace('/apps/caregiver/list')
  //     // })
  //   } catch (error) {
  //     console.log('Error', error)
  //   }
  // }

  const handleNext = () => {
    if (activeStep === 0) {
      personalDetailsFormRef.current?.handleSubmit((data: PersonalDetailsFormDataType) => {
        setCaregiverData({ ...data, addressType: 'Residential' })
        setActiveStep(prevActiveStep => prevActiveStep + 1)
      })()
    } else if (activeStep === 1) {
      loginInfoFormRef.current?.handleSubmit((data: FormDataType) => {
        setLoginInfo({ ...data, addressType: 'Mailing' })
        setActiveStep(prevActiveStep => prevActiveStep + 1)
      })()
    } else if (activeStep === 2) {
      setActiveStep(prevActiveStep => prevActiveStep + 1)
    } else if (activeStep === 3) {
      certificatesFormRef.current?.handleSubmit((data: any) => {
        setCertificatesData(data)
        setActiveStep(prevActiveStep => prevActiveStep + 1)
      })()
    } else if (activeStep === 4) {
      documentsFormRef.current?.handleSubmit((data: any) => {
        setDocumentsData(data)
        setActiveStep(prevActiveStep => prevActiveStep + 1)
      })()
    } else {
      setActiveStep(prevActiveStep => prevActiveStep + 1)
      // handleSave()
    }
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleCancel = () => {
    router.replace('/apps/caregiver/list')
  }

  const onPersonalDetailsSubmit = (values: FormDataType) => {
    console.log('Personal Details in Parent:', values)
    // Optionally store values or perform next step logic
    handleNext() // Move to next step
  }

  const onLoginInfoSubmit = (values: any) => {
    console.log('Login Info in Parent: ', values)
    handleNext()
  }

  const onPCAUMPISubmit = (values: any) => {
    console.log('Personal Detail', values)
  }

  const onTrainingCertificatesSubmit = (values: any) => {
    console.log('Personal Detail', values)
  }

  const onDocumentsSubmit = (values: any) => {
    console.log('Personal Detail', values)
  }
  console.log('Certificares data', certificatesData)
  console.log('Caregiver data', caregiverData)
  console.log('Lofin data', loginInfo)
  console.log('Documents data', documentsData)

  const renderStepContent = (activeStep: number) => {
    switch (activeStep) {
      case 0:
        return <PersonalDetailsForm ref={personalDetailsFormRef} onFinish={onPersonalDetailsSubmit} />
      case 1:
        return <LoginInfoComponent ref={loginInfoFormRef} onFinish={onLoginInfoSubmit} />
      case 2:
        return <PCAUMPITable />
      case 3:
        return <TrainingCertificatesComponent ref={certificatesFormRef} onFinish={onTrainingCertificatesSubmit} />
      case 4:
        return <DocumentsSection ref={documentsFormRef} onFinish={onDocumentsSubmit} />
      default:
        return 'Unknown step'
    }
  }

  return (
    <>
      <Card>
        <Typography variant='h4' className='p-4'>
          Adding a Employee / {steps[activeStep]?.subtitle}
        </Typography>
        <StepperWrapper>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map(label => {
              return (
                <Step key={label.title}>
                  <StepLabel
                    slots={{
                      stepIcon: StepperCustomDot
                    }}
                  >
                    <div className='step-label'>
                      <div>
                        <Typography className='step-title'>{label.title}</Typography>
                        <Typography className='step-subtitle'>{label.subtitle}</Typography>
                      </div>
                    </div>
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
        </StepperWrapper>
      </Card>
      {activeStep === steps.length ? (
        <>
          <Typography className='mlb-2 mli-1'>All steps are completed!</Typography>
          <div className='flex justify-end mt-4'>
            <Button variant='contained' onClick={handleReset}>
              Reset
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* <form onSubmit={e => e.preventDefault()}> */}
          <Grid container spacing={6}>
            {renderStepContent(activeStep)}
            <Card className='w-full'>
              <CardContent>
                <Grid size={{ xs: 12, md: 12 }} className='flex justify-between'>
                  <div>
                    <Button variant='outlined' onClick={handleSave} color='secondary'>
                      Cancel
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant='outlined'
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      // onClick={handleSave}
                      color='secondary'
                      className='mr-5'
                    >
                      Save File
                    </Button>
                    <Button variant='contained' onClick={handleNext}>
                      {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                    </Button>
                  </div>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {/* </form> */}
        </>
      )}
    </>
  )
}

export default EmployeeStepper

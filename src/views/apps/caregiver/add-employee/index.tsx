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
import { dark } from '@mui/material/styles/createPalette'
import axios from 'axios'

// Vars
const steps = [
  {
    title: '01',
    subtitle: 'Personal Details & Caregiver Notes'
  },
  {
    title: '02',
    subtitle: 'Login Info & Mailing Address'
  },
  {
    title: '03',
    subtitle: 'PCA UMPI Information'
  },
  {
    title: '04',
    subtitle: 'Training Certificate & Driving License'
  },
  {
    title: '05',
    subtitle: 'Documents'
  }
  // {
  //   title: '06',
  //   subtitle: 'Submit'
  // }
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

  const handleSave = async (Docs: any) => {
    try {
      const userPayload = {
        userName: loginInfo.userName,
        emailAddress: loginInfo.emailAddress,
        password: loginInfo.password,
        additionalEmailAddress: loginInfo.additionalEmailAddress,
        accountStatus: loginInfo.accountStatus,
        joinDate: new Date()
      }
      // Create User and Caregiver (as you've already done)
      const userResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user`, userPayload)
      const caregiverResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/caregivers`, {
        ...caregiverData,
        mailingCity: loginInfo.city,
        mailingState: loginInfo.state,
        mailingZipCode: loginInfo.zipCode,
        mailingStreet: loginInfo.street,
        mailingAddress: loginInfo.address,
        mailingAddressType: 'Mailing',
        userId: userResponse.data.id,
        dlState: certificatesData.dlState,
        additionalPayRate: Docs.additionalPayRate,
        tenantId: 1,
        clientId: loginInfo.clientId,
        assignmentDate: loginInfo.assignmentDate,
        unassignmentDate: loginInfo.unassignmentDate,
        notes: loginInfo.assignmentNotes,
        scheduleHours: loginInfo.scheduleHours
      })

      const caregiverId = caregiverResponse.data.id

      // Function to upload documents with improved handling
      const uploadDocuments = async (
        files: { path: string }[],
        documentType: string,
        expiryDate?: string,
        additionalMetadata?: Record<string, any>
      ) => {
        // Skip upload if no files exist
        if (!files || files.length === 0) {
          console.log(`No files found for ${documentType}. Skipping upload.`)
          return null
        }

        // Create a FormData object
        const formData = new FormData()

        // Append files
        files.forEach((file: { path: string }) => {
          // Use File object instead of Blob for better compatibility
          const fileObject = new File([file.path], file.path, {
            type: file.path.endsWith('.pdf')
              ? 'application/pdf'
              : file.path.endsWith('.jpg') || file.path.endsWith('.png')
                ? 'image/jpeg'
                : 'application/octet-stream'
          })
          formData.append('file', fileObject, file.path)
        })

        // Append common parameters
        formData.append('documentType', documentType)
        formData.append('caregiverId', caregiverId.toString())

        // Handle expiry date
        const finalExpiryDate =
          expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()

        formData.append('expiryDays', '365')
        formData.append('expiryDate', finalExpiryDate)

        // Append additional metadata if exists
        if (additionalMetadata) {
          Object.entries(additionalMetadata).forEach(([key, value]) => {
            formData.append(key, value as string)
          })
        }

        // Make the API call
        try {
          return await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/caregivers/document`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        } catch (error) {
          console.error(`Error uploading ${documentType} documents:`, error)
          return null
        }
      }

      // Prepare document uploads with explicit expiry dates or default
      const documentUploads = [
        // Training Certificates
        uploadDocuments(
          certificatesData.trainingCertificateFiles,
          'trainingCertificate',
          certificatesData.trainingCertificateExpiryDate,
          {
            trainingCertificateName: certificatesData.trainingCertificateName
          }
        ),

        // Driving License
        uploadDocuments(
          certificatesData.drivingCertificateFiles,
          'drivingLicense',
          certificatesData.drivingLicenseExpiryDate,
          {
            drivingLicenseNumber: certificatesData.drivingLicenseNumber,
            dlState: certificatesData.dlState
          }
        ),

        // SSN File
        uploadDocuments(
          Docs.ssnFileObject,
          'other',
          new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
        ),

        // Adult File
        uploadDocuments(
          Docs.adultFileObject,
          'other',
          new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
        ),

        // UMPI File
        uploadDocuments(
          Docs.umpiFileObject,
          'other',
          new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
        ),

        // Clearance File
        uploadDocuments(
          Docs.clearanceFileObject,
          'other',
          new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
        )
      ]

      // Wait for all document uploads
      const uploadResponses = await Promise.all(documentUploads)

      // Filter out null responses
      const successfulUploads = uploadResponses.filter(response => response !== null)

      console.log('Successful document uploads:', successfulUploads)

      router.replace('/apps/caregiver/list')
    } catch (error) {
      console.error('Error in document upload process:', error)
    }
  }

  const handleNext = () => {
    switch (activeStep) {
      case 0:
        personalDetailsFormRef.current?.handleSubmit((data: PersonalDetailsFormDataType) => {
          setCaregiverData({ ...data, addressType: 'Residential' })
          setActiveStep(prevActiveStep => prevActiveStep + 1)
        })()
        break
      case 1:
        loginInfoFormRef.current?.handleSubmit((data: FormDataType) => {
          setLoginInfo({ ...data, addressType: 'Mailing' })
          setActiveStep(prevActiveStep => prevActiveStep + 1)
        })()
        break
      case 2:
        setActiveStep(prevActiveStep => prevActiveStep + 1)
        break
      case 3:
        certificatesFormRef.current?.handleSubmit((data: any) => {
          setCertificatesData(data)
          setActiveStep(prevActiveStep => prevActiveStep + 1)
        })()
        break
      case 4:
        documentsFormRef.current?.handleSubmit((data: any) => {
          setDocumentsData(data)
          handleSave(data)
          // setActiveStep(prevActiveStep => prevActiveStep + 1)
        })()
        break
      // case 5: // New case for the final submit
      //   handleSave()
      //   break
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
      // case 5:
      //   return (
      //     <div className='text-center p-6'>
      //       <Typography variant='h5'>Ready to Submit</Typography>
      //       <Typography className='mt-2'>
      //         Please review your information and click Submit to complete the registration.
      //       </Typography>
      //     </div>
      //   )
      default:
        return 'Unknown step'
    }
  }

  return (
    <>
      <Card className='w-full px-6 py-3'>
        <Typography variant='h4' className='p-4 mb-3'>
          Adding an Employee / {steps[activeStep]?.subtitle}
        </Typography>
        <StepperWrapper>
          <Stepper activeStep={activeStep} alternativeLabel className='mt-16'>
            {steps.map(label => {
              return (
                <Step key={label.title}>
                  <StepLabel
                    slots={{
                      stepIcon: StepperCustomDot
                    }}
                  >
                    <div className='step-label -mt-[110px]'>
                      <div>
                        <Typography
                          className={`step-title text-base ${activeStep === steps.indexOf(label) ? (dark ? 'text-[#7112B7]' : 'text-[#4B0082]') : ''}`}
                        >
                          {label.title}
                        </Typography>
                        <Typography
                          className={`step-subtitle ${activeStep === steps.indexOf(label) ? (dark ? 'text-[#7112B7]' : 'text-[#4B0082]') : ''}`}
                        >
                          {label.subtitle}
                        </Typography>
                      </div>
                    </div>
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
        </StepperWrapper>
      </Card>

      {/* <form onSubmit={e => e.preventDefault()}> */}
      <Grid container spacing={6}>
        {renderStepContent(activeStep)}
        <Card className='w-full'>
          <CardContent>
            <Grid size={{ xs: 12, md: 12 }} className='flex justify-between'>
              <div>
                <Button variant='outlined' onClick={handleCancel} color='secondary'>
                  Cancel
                </Button>
              </div>
              <div>
                <Button
                  variant='outlined'
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  color='secondary'
                  className='mr-5'
                >
                  Back
                </Button>
                <Button variant='contained' onClick={handleNext}>
                  {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                </Button>
              </div>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </>
  )
}

export default EmployeeStepper

// {activeStep === steps.length - 1 ? (
//   <>
//     <Typography className='mlb-2 mli-1'>All steps are completed!</Typography>
//     <div className='flex justify-end mt-4'>
//       <Button variant='contained' onClick={handleNext}>
//         Submit
//       </Button>
//     </div>
//   </>
// ) :

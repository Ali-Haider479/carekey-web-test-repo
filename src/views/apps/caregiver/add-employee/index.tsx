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
import { FormDataType } from '../../invoice/add/AddCustomerDrawer'
import { useRouter } from 'next/navigation'
import { PersonalDetailsFormDataType } from './types'
import { dark } from '@mui/material/styles/createPalette'
import axios from 'axios'
import DocumentsPage from './Certificates/Documents'
import { CircularProgress } from '@mui/material'
import CustomAlert from '@/@core/components/mui/Alter'
import api from '@/utils/api'
import { useTheme, Theme } from '@mui/material/styles'

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
    subtitle: 'Documents'
  }
]

const EmployeeStepper = () => {
  // States
  const [activeStep, setActiveStep] = useState(0)
  const [caregiverData, setCaregiverData] = useState<any>({})
  const [loginInfo, setLoginInfo] = useState<any>({})
  const [documentsData, setDocumentsData] = useState<any>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const router = useRouter()
  const theme = useTheme<Theme>()

  const personalDetailsFormRef = useRef<{ handleSubmit: any }>(null)
  const loginInfoFormRef = useRef<{ handleSubmit: any }>(null)
  const documentsFormRef = useRef<{ handleSubmit: any }>(null)

  const handleReset = () => {
    setActiveStep(0)
  }

  // Function to upload documents with improved handling
  const uploadDocuments = async (
    files: { path: string }[],
    documentType: string,
    caregiverId: string,
    expiryDate?: string,
    metaData?: Record<string, any>
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
    const finalExpiryDate = expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()

    formData.append('expiryDays', '365')
    formData.append('expiryDate', finalExpiryDate)

    // Append additional metadata if exists
    if (metaData) {
      formData.append('metaData', JSON.stringify(metaData))
    }

    // Make the API call
    try {
      return await api.post(`/caregivers/document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } catch (error) {
      console.error(`Error uploading ${documentType} documents:`, error)
      return null
    }
  }

  const handleSave = async (Docs: any) => {
    try {
      setIsLoading(true)
      const userPayload = {
        userName: `${caregiverData.firstName} ${caregiverData.lastName}`,
        emailAddress: loginInfo.emailAddress.toLowerCase(),
        password: loginInfo.password,
        additionalEmailAddress: loginInfo.additionalEmailAddress.toLowerCase(),
        accountStatus: loginInfo.accountStatus,
        joinDate: new Date(),
        roleId: 3,
        tenantId: authUser?.tenant?.id
      }
      console.log('TWO USER PAYLOAD -------', userPayload)

      // Create User and Caregiver (as you've already done)
      const userResponse = await api.post(`/user`, userPayload)
      console.log('TWO USER CREATE -------', userResponse)
      const caregiverPayload = {
        ...caregiverData,
        mailingCity: loginInfo.city,
        mailingState: loginInfo.state,
        mailingZipCode: loginInfo.zipCode,
        mailingStreet: loginInfo.street,
        mailingAddress: loginInfo.address,
        mailingAddressType: 'Mailing',
        userId: userResponse.data.id,
        dlState: documentsData.dlState,
        additionalPayRate: documentsData.additionalPayRate,
        tenantId: authUser?.tenant?.id,
        clientId: loginInfo.clientId,
        assignmentDate: loginInfo.assignmentDate,
        unassignmentDate: loginInfo.unassignmentDate,
        notes: loginInfo.assignmentNotes,
        scheduleHours: loginInfo.scheduleHours,
        overtimeAgreement: caregiverData.overtimeAgreement === 'yes' ? true : false,
        isLicensed245d: caregiverData.isLicensed245d === 'yes' ? true : false
      }
      console.log('USER CLIENT PAYLKOAD -------', caregiverPayload)

      const filteredCaregiverPayload = Object.fromEntries(
        Object.entries(caregiverPayload).filter(([key, value]) => value !== undefined && value !== null && value !== '')
      )
      console.log('USER CLIENT FILTRED PAYLKOAD -------', filteredCaregiverPayload)

      const caregiverResponse = await api.post(`/caregivers`, filteredCaregiverPayload)

      const caregiverId = caregiverResponse.data.id

      const trainingCertificateMetaData = {
        documentName: documentsData.trainingCertificateName || 'default-certificate'
      }

      const drivingLicenseMetaData = {
        documentName: 'Driving License',
        drivingLicenseNumber: documentsData.drivingLicenseNumber,
        drivingLicenseState: documentsData.dlState
      }

      const umpiDocumentMetaData = {
        documentName: 'UMPI Letter',
        payer: '',
        activationDate: null
      }

      // Prepare document uploads with explicit expiry dates or default
      const documentUploads = [
        // Training Certificates
        uploadDocuments(
          documentsData.trainingCertificateFiles,
          'trainingCertificate',
          documentsData.trainingCertificateExpiryDate,
          caregiverId.toString(),
          trainingCertificateMetaData
        ),

        // Driving License
        uploadDocuments(
          documentsData.drivingCertificateFiles,
          'drivingLicense',
          documentsData.drivingLicenseExpiryDate,
          caregiverId.toString(),
          drivingLicenseMetaData
        ),

        // SSN File
        uploadDocuments(
          Docs.ssnFileObject,
          'ssnDocument',
          caregiverId.toString(),
          new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
          {
            documentName: 'SSN Document'
          }
        ),

        // Adult File
        uploadDocuments(
          Docs.adultFileObject,
          'adultMandatedDocument',
          caregiverId.toString(),
          new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
          {
            documentName: 'Adult Mandated Document'
          }
        ),

        // UMPI File
        uploadDocuments(
          Docs.umpiFileObject,
          'umpiDocument',
          caregiverId.toString(),
          new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
          umpiDocumentMetaData
        ),

        // Clearance File
        uploadDocuments(
          Docs.clearanceFileObject,
          'clearanceDocument',
          caregiverId.toString(),
          new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
          {
            documentName: 'Clearance Document'
          }
        )
      ]

      // Wait for all document uploads
      const uploadResponses = await Promise.all(documentUploads)

      // Filter out null responses
      const successfulUploads = uploadResponses.filter(response => response !== null)

      console.log('Successful document uploads:', successfulUploads)

      setAlertOpen(true)

      setAlertProps({
        message: 'Caregiver created successfully.',
        severity: 'success'
      })
      setTimeout(() => {
        setIsLoading(false)
        router.replace('/en/apps/caregiver/list')
      }, 3000)
    } catch (error: any) {
      if (error.response?.data?.message?.includes('Email already exists')) {
        setAlertOpen(true)
        setAlertProps({
          message: 'Email already exists',
          severity: 'error'
        })
        setIsLoading(false)
      } else {
        setAlertOpen(true)
        setAlertProps({
          message: 'An unexpected error occurred. Please try again later.',
          severity: 'error'
        })
      }
      console.error('Error in document upload process:', error)
    }
  }

  const handleNext = () => {
    switch (activeStep) {
      case 0:
        personalDetailsFormRef.current?.handleSubmit((data: PersonalDetailsFormDataType) => {
          setCaregiverData((prevData: any) => ({ ...prevData, ...data, addressType: 'Residential' }))
          setActiveStep(prevActiveStep => prevActiveStep + 1)
        })()
        break
      case 1:
        loginInfoFormRef.current?.handleSubmit((data: FormDataType) => {
          setLoginInfo((prevData: any) => ({ ...prevData, ...data, addressType: 'Mailing' }))
          setActiveStep(prevActiveStep => prevActiveStep + 1)
          console.log('Email in lower case:', loginInfo.emailAddress)
        })()
        break
      case 2:
        documentsFormRef.current?.handleSubmit((data: any) => {
          setDocumentsData((prevData: any) => ({ ...prevData, ...data }))
          handleSave(data)
        })()
        break
    }
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleCancel = () => {
    router.replace('/en/apps/caregiver/list')
  }

  const onPersonalDetailsSubmit = (values: FormDataType, data: any) => {
    console.log('Personal Details in Parent:', values)
    handleNext()
  }

  const onLoginInfoSubmit = (values: any, data: any) => {
    console.log('Login Info in Parent: ', values)
    setCaregiverData((prevData: any) => ({ ...prevData, ...data }))
    handleNext()
  }

  const onDocumentsSubmit = (data: any) => {
    console.log('Documents Data:', data)
    setDocumentsData((prevData: any) => ({ ...prevData, ...data }))
    handleNext()
  }

  console.log('Caregiver data', caregiverData)
  console.log('Lofin data', loginInfo)
  console.log('Documents data', documentsData)

  const renderStepContent = (activeStep: number) => {
    switch (activeStep) {
      case 0:
        return (
          <PersonalDetailsForm
            ref={personalDetailsFormRef}
            onFinish={onPersonalDetailsSubmit}
            defaultValues={caregiverData}
          />
        )
      case 1:
        return (
          <LoginInfoComponent
            ref={loginInfoFormRef}
            onFinish={onLoginInfoSubmit}
            defaultValues={loginInfo}
            caregiverPersonalInfo={caregiverData}
          />
        )
      case 2:
        return <DocumentsPage ref={documentsFormRef} onFinish={onDocumentsSubmit} defaultValues={documentsData} />
      default:
        return 'Unknown step'
    }
  }

  return (
    <>
      <Card className='w-full px-6 py-3'>
        <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
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
                    <div className='step-label -mt-[100px]'>
                      <div>
                        <Typography
                          className={`step-title text-base`}
                          sx={{
                            color:
                              activeStep === steps.indexOf(label)
                                ? theme.palette.mode === 'dark'
                                  ? `${theme.palette.primary.dark} !important`
                                  : `${theme.palette.primary.main} !important`
                                : ''
                          }}
                        >
                          {label.title}
                        </Typography>
                        <Typography
                          className={`step-subtitle`}
                          sx={{
                            color:
                              activeStep === steps.indexOf(label)
                                ? theme.palette.mode === 'dark'
                                  ? `${theme.palette.primary.dark} !important`
                                  : `${theme.palette.primary.main} !important`
                                : ''
                          }}
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
                <Button
                  startIcon={isLoading ? <CircularProgress size={20} color='info' /> : null}
                  disabled={isLoading === true}
                  variant={'contained'}
                  onClick={handleNext}
                >
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

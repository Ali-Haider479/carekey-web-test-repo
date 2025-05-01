'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { dark } from '@mui/material/styles/createPalette'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'

// Styled Component Imports
import StepperWrapper from '@core/styles/stepper'
import StepperCustomDot from '@components/stepper-dot'

import PersonalDetailsForm from './add-client-forms/PersonalDetailsForm'
import PhysicianAndCaseMangerForm from './add-client-forms/PhysicianAndCaseMangerForm'
import ServiceActivitiesForm from './add-client-forms/ServiceActivitiesForm'
import {
  PersonalDetailsFormDataType,
  PhysicianAndCaseMangerFormDataType,
  clientServiceFormDataType
} from './add-client-forms/formTypes'
import DocumentsForm from './add-client-forms/DocumentsForm'
import axios from 'axios'
import { CardContent, CircularProgress } from '@mui/material'
import { useRouter } from 'next/navigation'
import CustomAlert from '@/@core/components/mui/Alter'
import api from '@/utils/api'

// Vars
const steps = [
  {
    title: '01',
    subtitle: 'Personal Details & Security Login'
  },
  {
    title: '02',
    subtitle: 'Physician & Case Manager'
  },
  {
    title: '03',
    subtitle: 'Client Services'
  },
  {
    title: '04',
    subtitle: 'Documents'
  }
]

const AddClientStepper = () => {
  const router = useRouter()
  // States
  const [activeStep, setActiveStep] = useState(0)
  const [personalDetails, setPersonalDetails] = useState<any>()
  const [physicianDetails, setPhysicianDetails] = useState<any>()
  const [serviceActivities, setServiceActivities] = useState<any>()
  const [documents, setDocuments] = useState<any>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()

  const personalDetailsFormRef = useRef<any>(null)
  const physicianAndCaseMangerFormRef = useRef<any>(null)
  const serviceActivitiesFormRef = useRef<any>(null)
  const documentsFormRef = useRef<any>(null)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const handleReset = () => {
    setActiveStep(0)
  }

  const uploadDocuments = async (
    files: { path: string; size: number; name: string }[],
    documentType: string,
    id: string,
    expiryDate?: string,
    additionalMetadata?: Record<string, any>
  ) => {
    if (!files || files.length === 0) {
      console.log(`No files found for ${documentType}. Skipping upload.`)
      return null
    }

    try {
      // Extract file names
      const fileNames = files.map(file => file.name)

      console.log('Files to be uploaded:', fileNames)

      // Request pre-signed URLs from the backend
      const { data: preSignedUrls } = await api.post(`/upload-document/get-signed-pdf-put-url`, fileNames)

      console.log('Received Pre-Signed URLs:', preSignedUrls)

      // Upload each file to S3
      const uploadPromises = files.map(async (file, index) => {
        const { key, url } = preSignedUrls[index] // Get corresponding pre-signed URL
        const fileType = file.path.split('.').pop() || 'pdf' // Default to 'pdf' if undefined

        console.log(`Uploading ${file.name} to S3...`)

        // Upload file to S3
        await axios.put(url, file, {
          headers: {
            'Content-Type': 'application/pdf' // Adjust based on file type
          }
        })

        console.log(`${file.name} uploaded successfully.`)

        // Prepare metadata to store in DB
        const body = {
          fileName: file.name,
          documentType,
          fileKey: key,
          fileType,
          fileSize: file.size,
          clientId: id
        }

        // Store record in backend
        return api.post(`/client/documents`, body)
      })

      // Wait for all uploads & database records to complete
      const results = await Promise.all(uploadPromises)

      console.log('All files uploaded & records created:', results)

      return results
    } catch (error) {
      console.error(`Error uploading ${documentType} documents:`, error)
      return null
    }
  }

  const handleSave = async (Docs: any) => {
    try {
      setIsLoading(true)
      const createClientBody = {
        firstName: personalDetails.firstName,
        middleName: personalDetails.middleName,
        lastName: personalDetails.lastName,
        admissionDate: personalDetails.admissionDate || new Date(),
        dischargeDate: personalDetails.dateOfDischarge,
        dateOfBirth: personalDetails.dateOfBirth,
        pmiNumber: personalDetails.pmiNumber,
        gender: personalDetails.gender,
        emailId: personalDetails.emailId.toLowerCase(),
        primaryPhoneNumber: personalDetails.primaryPhoneNumber,
        primaryCellNumber: personalDetails.primaryPhoneNumber,
        additionalPhoneNumber: personalDetails.additionalPhoneNumber,
        emergencyContactName: personalDetails.emergencyContactName,
        emergencyContactNumber: personalDetails.emergencyContactNumber,
        emergencyEmailId: personalDetails.emergencyEmail.toLowerCase(),
        insuranceCode: personalDetails.insuranceCode,
        clientCode: personalDetails.clientCode,
        medicalSpendDown: personalDetails.medicalSpendDown,
        amount: personalDetails.amount,
        sharedCare: personalDetails.sharedCare,
        pcaChoice: personalDetails.pcaChoice,
        isClient: true,
        isSignatureDraw: true,
        tenantId: authUser?.tenant?.id,
        serviceActivityIds: serviceActivities?.serviceActivities
      }
      const filteredCreateClientBody = Object.fromEntries(
        Object.entries(createClientBody).filter(([key, value]) => value !== undefined && value !== null && value !== '')
      )
      console.log('Filtered Client Body ---> ', filteredCreateClientBody)

      const createClientResponse = await api.post(`/client`, filteredCreateClientBody)

      console.log('Create Client Response ---> ', createClientResponse)

      const clientId = createClientResponse.data.id

      const clientPrimaryAddressBody = {
        clientId: clientId,
        city: personalDetails.primaryResidentialCity,
        state: personalDetails.primaryResidentialState,
        address: personalDetails.primaryResidentialAddress,
        zipCode: personalDetails.primaryResidentialZipCode,
        addressType: 'Residential'
      }

      const clientSecondaryAddressBody = {
        clientId: clientId,
        city: personalDetails.secondaryResidentialCity,
        state: personalDetails.secondaryResidentialState,
        address: personalDetails.secondaryResidentialAddress,
        zipCode: personalDetails.secondaryResidentialZipCode,
        addressType: 'Secondary Residential'
      }

      const clientMailingAddressBody = {
        clientId: clientId,
        city: personalDetails.mailingCity,
        state: personalDetails.mailingState,
        address: personalDetails.mailingAddress,
        zipCode: personalDetails.mailingZipCode,
        addressType: 'Mailing'
      }

      const clientAddressArray = [clientPrimaryAddressBody, clientSecondaryAddressBody, clientMailingAddressBody]

      for (const addressBody of clientAddressArray) {
        const response = await api.post(`/client/address`, addressBody)
        console.log('Adding Address Response --> ', response)
      }

      const clientResponsiblePartyBody = {
        name: personalDetails.clientResponsibilityPartyName,
        emailAddress: personalDetails.clientResponsibilityPartyEmailAddress.toLowerCase(),
        phoneNumber: personalDetails.clientResponsibilityPartyPhoneNumber,
        faxNumber: personalDetails.clientResponsibilityPartyFaxNumber,
        clientId: clientId
      }

      const createClientResponsibleParty = await api.post(`/client/responsible-party`, clientResponsiblePartyBody)
      console.log('Client Responsible Party Created --> ', createClientResponsibleParty)

      const createPhysicianBody = {
        name: physicianDetails.physicianName,
        clinicName: physicianDetails.clinicName,
        phoneNumber: physicianDetails.phoneNumber,
        faxNumber: physicianDetails.faxNumber,
        address: physicianDetails.physicalAddress,
        city: physicianDetails.physicianCity,
        state: physicianDetails.physicianState,
        zipCode: physicianDetails.physicianZipCode,
        primaryPhoneNumber: physicianDetails.primaryPhoneNumber,
        clientId: clientId
      }

      const createPhysicianResponse = await api.post(`/client/physician`, createPhysicianBody)
      console.log('Physician Details --> ', createPhysicianResponse)

      const createCaseManagerBody = {
        caseManagerName: physicianDetails.caseManagerName,
        caseManagerEmail: physicianDetails.caseMangerEmail.toLowerCase(),
        caseManagerPhoneNumber: physicianDetails.caseMangerPhoneNumber,
        caseManagerExtention: physicianDetails.caseManagerExtension,
        caseManagerFaxNumber: physicianDetails.caseManagerFaxNumber,
        caseManagerNotes: physicianDetails.caseMangerNote,
        clientId: clientId
      }

      const createCaseManagerResponse = await api.post(`/client/casemanager`, createCaseManagerBody)
      console.log('Case Manager Details --> ', createCaseManagerResponse)

      const assignCaregiverBody = {
        tenantId: authUser?.tenant?.id,
        clientId: clientId,
        userId: serviceActivities.caregiverId,
        assignmentDate: serviceActivities.assignmentDate,
        unassignmentDate: serviceActivities.unassignmentDate,
        notes: serviceActivities.assignmentNotes || '',
        scheduleHours: serviceActivities.scheduleHours
      }

      const filteredAssignCaregiverBody = Object.fromEntries(
        Object.entries(assignCaregiverBody).filter(
          ([key, value]) => value !== undefined && value !== null && value !== ''
        )
      )

      const assignCaregiverResponse = await api.post(`/user/createClientUser`, filteredAssignCaregiverBody)
      console.log('Assigned Caregiver Details --> ', assignCaregiverResponse)

      const createClientServiceBody = {
        note: serviceActivities.serviceNotes,
        serviceId: serviceActivities.service,
        clientId: clientId
      }
      const createClientServiceTypeResponse = await api.post(`/client/client-service`, createClientServiceBody)
      console.log('Client Service Type Created --> ', createClientServiceTypeResponse)

      const createCarePlanDueBody = {
        clientId: clientId,
        lastCompletedDate: serviceActivities.lastCompletedDate,
        dueDate: serviceActivities.dueDate,
        qpAssigned: serviceActivities.qpAssigned,
        notes: serviceActivities.notes
      }

      const filteredCarePlanDueBody = Object.fromEntries(
        Object.entries(createCarePlanDueBody).filter(
          ([key, value]) => value !== undefined && value !== null && value !== ''
        )
      )

      const createCarePlanDueResponse = await api.post(`/client/careplan`, createCarePlanDueBody)
      console.log('Create Care Plan Due Data --> ', filteredCarePlanDueBody)

      console.log('New Docs', Docs)

      const documentUpload = [uploadDocuments(Docs.documentFiles, 'other', clientId.toString())]

      const uploadResponses = await Promise.all(documentUpload)

      const successfulUploads = uploadResponses.filter(response => response !== null)

      console.log('Successful document uploads:', successfulUploads)

      setAlertOpen(true)

      setAlertProps({
        message: 'Client created successfully.',
        severity: 'success'
      })
    } catch (error) {
      setAlertOpen(true)
      setAlertProps({
        message: 'An unexpected error occurred. Please try again later.',
        severity: 'error'
      })
      console.error('Error saving data: ', error)
    } finally {
      setTimeout(() => {
        setIsLoading(false)
        router.replace('/en/apps/client/list')
      }, 3000)
    }
  }

  const handleNext = () => {
    console.log('Inside Handle Next')
    switch (activeStep) {
      case 0:
        personalDetailsFormRef.current?.handleSubmit((data: PersonalDetailsFormDataType) => {
          setPersonalDetails((prevData: any) => ({ ...prevData, ...data }))
          console.log('Personal Details in Parent:', data)
          // Move to next step after successful validation
          setActiveStep(prevActiveStep => prevActiveStep + 1)
        })()
        break
      case 1:
        physicianAndCaseMangerFormRef.current?.handleSubmit((data: PhysicianAndCaseMangerFormDataType) => {
          setPhysicianDetails((prevData: any) => ({ ...prevData, ...data }))
          console.log('Physician Details in Parent:', data)
          // Move to next step after successful validation
          setActiveStep(prevActiveStep => prevActiveStep + 1)
        })()
        break
      case 2:
        serviceActivitiesFormRef.current?.handleSubmit((data: clientServiceFormDataType) => {
          setServiceActivities((prevData: any) => ({ ...prevData, ...data }))
          console.log('Personal Details in Parent:', data)
          // Move to next step after successful validation
          setActiveStep(prevActiveStep => prevActiveStep + 1)
        })()
        break
      case 3:
        documentsFormRef.current?.handleSubmit((data: any) => {
          setDocuments((prevData: any) => ({ ...prevData, ...data }))
          handleSave(data)
          console.log('Documents data:', data)
        })()
        break
    }
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const onPersonalDetailsSubmit = (values: PersonalDetailsFormDataType, data: any) => {
    console.log('Personal Details in Parent:', values)
    setPersonalDetails((prevData: any) => ({ ...prevData, ...data }))
    // Optionally store values or perform next step logic
    handleNext() // Move to next step
  }

  const physicianAndCaseMangerFormSubmit = (values: any, data: any) => {
    console.log('physicianAndCaseMangerFormSubmit', values)
    setPhysicianDetails((prevData: any) => ({ ...prevData, ...data }))
    handleNext()
  }

  const serviceActivitiesFormSubmit = (values: any, data: any) => {
    console.log('Personal Detail', values)
    setServiceActivities((prevData: any) => ({ ...prevData, ...data }))
    handleNext()
  }

  const onDocumentsFormSubmit = (values: any, data: any) => {
    console.log('Personal Detail', values)
    setDocuments((prevData: any) => ({ ...prevData, ...data }))
    handleNext()
  }

  console.log('ACTIVE STREP', activeStep)
  const renderStepContent = (activeStep: number) => {
    switch (activeStep) {
      case 0:
        return (
          <PersonalDetailsForm
            ref={personalDetailsFormRef}
            onFinish={onPersonalDetailsSubmit}
            defaultValues={personalDetails}
          />
        )
      case 1:
        return (
          <PhysicianAndCaseMangerForm
            ref={physicianAndCaseMangerFormRef}
            onFinish={physicianAndCaseMangerFormSubmit}
            defaultValues={physicianDetails}
          />
        )
      case 2:
        return (
          <ServiceActivitiesForm
            ref={serviceActivitiesFormRef}
            onFinish={serviceActivitiesFormSubmit}
            defaultValues={serviceActivities}
          />
        )
      case 3:
        return <DocumentsForm ref={documentsFormRef} onFinish={onDocumentsFormSubmit} defaultValues={documents} />
      default:
        return 'Unknown step'
    }
  }

  return (
    <>
      <Card className='p-2'>
        <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
        <Typography variant='h4' className='p-4'>
          Adding a Client / Assign Caregiver
        </Typography>
        <StepperWrapper>
          <Stepper activeStep={activeStep} alternativeLabel className='mt-14'>
            {steps.map(label => {
              return (
                <Step key={label.title}>
                  <StepLabel
                    slots={{
                      stepIcon: StepperCustomDot
                    }}
                  >
                    <div className='step-label -mt-[90px]'>
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
      <>
        {/* <form onSubmit={e => e.preventDefault()}> */}
        <Grid container spacing={6} sx={{ marginTop: 3 }}>
          {renderStepContent(activeStep)}
          <Card className='w-full'>
            <CardContent>
              <Grid size={{ xs: 12, md: 12 }} className='flex justify-between'>
                <div>
                  <Button variant='outlined' onClick={() => router.replace('/en/apps/client/list')} color='secondary'>
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
                    variant='contained'
                    onClick={handleNext}
                  >
                    {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                  </Button>
                  {/* <Button variant='contained' onClick={handleNext}>
                    {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                  </Button> */}
                </div>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </>
    </>
  )
}

export default AddClientStepper

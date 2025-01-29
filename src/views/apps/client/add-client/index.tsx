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
import { CardContent } from '@mui/material'
import { useRouter } from 'next/navigation'

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
  const [serviceTypes, setServiceTypes] = useState<any>()

  const personalDetailsFormRef = useRef<any>(null)
  const physicianAndCaseMangerFormRef = useRef<any>(null)
  const serviceActivitiesFormRef = useRef<any>(null)
  const documentsFormRef = useRef<any>(null)

  const handleReset = () => {
    setActiveStep(0)
  }

  const getServiceTypes = async () => {
    try {
      const serviceTypesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/service`)
      console.log('Service Types --> ', serviceTypesResponse)
      setServiceTypes(serviceTypesResponse)
    } catch (error) {
      console.error('Error getting service types: ', error)
    }
  }
  useEffect(() => {
    getServiceTypes()
  }, [])

  const handleSave = async (Docs: any) => {
    try {
      const createClientBody = {
        firstName: personalDetails.firstName,
        middleName: personalDetails.middleName,
        lastName: personalDetails.lastName,
        admissionDate: personalDetails.admissionDate,
        dischargeDate: personalDetails.dateOfDischarge,
        dateOfBirth: personalDetails.dateOfBirth,
        pmiNumber: personalDetails.pmiNumber,
        gender: personalDetails.gender,
        primaryPhoneNumber: personalDetails.primaryPhoneNumber,
        primaryCellNumber: personalDetails.primaryPhoneNumber,
        additionalPhoneNumber: personalDetails.additionalPhoneNumber,
        emergencyContactName: personalDetails.emergencyContactName,
        emergencyContactNumber: personalDetails.emergencyContactNumber,
        emergencyEmailId: personalDetails.emergencyEmail,
        insuranceCode: personalDetails.insuranceCode,
        clientCode: personalDetails.clientCode,
        medicalSpendDown: personalDetails.medicalSpendDown,
        amount: personalDetails.amount,
        sharedCare: personalDetails.sharedCare,
        pcaChoice: personalDetails.pcaChoice,
        isClient: true,
        isSignatureDraw: false,
        tenantId: 1
      }

      const createClientResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/client`, createClientBody)

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
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/client/address`, addressBody)
        console.log('Adding Address Response --> ', response)
      }

      const clientResponsiblePartyBody = {
        name: personalDetails.clientResponsibilityPartyName,
        emailAddress: personalDetails.clientResponsibilityPartyEmailAddress,
        phoneNumber: personalDetails.clientResponsibilityPartyPhoneNumber,
        faxNumber: personalDetails.clientResponsibilityPartyFaxNumber,
        clientId: clientId
      }

      const createClientResponsibleParty = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/client/responsible-party`,
        clientResponsiblePartyBody
      )
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

      const createPhysicianResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/client/physician`,
        createPhysicianBody
      )
      console.log('Physician Details --> ', createPhysicianResponse)

      const createCaseManagerBody = {
        caseManagerName: physicianDetails.caseManagerName,
        caseManagerEmail: physicianDetails.caseMangerEmail,
        caseManagerPhoneNumber: physicianDetails.caseMangerPhoneNumber,
        caseManagerExtention: physicianDetails.caseManagerExtension,
        caseManagerFaxNumber: physicianDetails.caseManagerFaxNumber,
        caseManagerNotes: physicianDetails.caseMangerNote,
        clientId: clientId
      }

      const createCaseManagerResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/client/casemanager`,
        createCaseManagerBody
      )
      console.log('Case Manager Details --> ', createCaseManagerResponse)

      const assignCaregiverBody = {
        tenantId: 1,
        clientId: clientId,
        userId: serviceActivities.caregiverId,
        assignmentDate: serviceActivities.assignmentDate,
        unassignmentDate: serviceActivities.unassignmentDate,
        notes: serviceActivities.assignmentNotes,
        scheduleHours: serviceActivities.scheduleHours
      }

      const assignCaregiverResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/createClientUser`,
        assignCaregiverBody
      )
      console.log('Assigned Caregiver Details --> ', assignCaregiverResponse)

      const createClientServiceBody = {
        note: serviceActivities.serviceNotes,
        serviceId: serviceActivities.service,
        clientId: clientId
      }
      const createClientServiceTypeResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/client/client-service`,
        createClientServiceBody
      )
      console.log('Client Service Type Created --> ', createClientServiceTypeResponse)

      const createCarePlanDueBody = {
        clientId: clientId,
        lastCompletedDate: serviceActivities.lastCompletedDate,
        dueDate: serviceActivities.dueDate,
        qpAssigned: serviceActivities.qpAssigned,
        notes: serviceActivities.notes
      }

      const createCarePlanDueResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/client/careplan`,
        createCarePlanDueBody
      )
      console.log('Create Care Plan Due Data --> ', createCarePlanDueResponse)

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
        formData.append('clientId', clientId.toString())

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
          return await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/client/documents`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        } catch (error) {
          console.error(`Error uploading ${documentType} documents:`, error)
          return null
        }
      }

      const documentUpload = [uploadDocuments(Docs.documents, 'other')]

      const uploadResponses = await Promise.all(documentUpload)

      const successfulUploads = uploadResponses.filter(response => response !== null)

      console.log('Successful document uploads:', successfulUploads)

      console.log('Client Body ---> ', createClientBody, clientPrimaryAddressBody)

      router.replace('/apps/client/list')
    } catch (error) {
      console.error('Error saving data: ', error)
    }
  }

  // useEffect(() => {
  //   if (personalDetails) {
  //     handleSave()
  //   }
  // }, [personalDetails])

  // const handleNext = () => {
  //   console.log('in next', activeStep)
  //   if (activeStep === 0) {
  //     // Manually trigger form submission for the first step
  //     personalDetailsFormRef.current?.handleSubmit((data: PersonalDetailsFormDataType) => {
  //       setPersonalDetails(data)
  //       handleSave()
  //       console.log('Personal Details in Parent:', data)
  //       // Move to next step after successful validation
  //       setActiveStep(prevActiveStep => prevActiveStep + 1)
  //     })()
  //   } else if (activeStep === 1) {
  //     physicianAndCaseMangerFormRef.current?.handleSubmit((data: PhysicianAndCaseMangerFormDataType) => {
  //       setPhysicianDetails(data)
  //       handleSave()
  //       console.log('Physician Details in Parent:', data)
  //       // Move to next step after successful validation
  //       setActiveStep(prevActiveStep => prevActiveStep + 1)
  //     })()
  //   } else if (activeStep === 2) {
  //     serviceActivitiesFormRef.current?.handleSubmit((data: clientServiceFormDataType) => {
  //       setServiceActivities(data)
  //       handleSave()
  //       console.log('Personal Details in Parent:', data)
  //       // Move to next step after successful validation
  //       setActiveStep(prevActiveStep => prevActiveStep + 1)
  //     })()
  //   } else if (activeStep === 3) {
  //     // Manually trigger form submission for the first step
  //     documentsFormRef.current?.handleSubmit((data: any) => {
  //       setDocuments(data)
  //       handleSave()
  //       console.log('Documents data:', data)
  //       // Move to next step after successful validation
  //       setActiveStep(prevActiveStep => prevActiveStep + 1)
  //     })()
  //   }
  // }

  const handleNext = () => {
    switch (activeStep) {
      case 0:
        personalDetailsFormRef.current?.handleSubmit((data: PersonalDetailsFormDataType) => {
          setPersonalDetails(data)
          console.log('Personal Details in Parent:', data)
          // Move to next step after successful validation
          setActiveStep(prevActiveStep => prevActiveStep + 1)
        })()
        break
      case 1:
        physicianAndCaseMangerFormRef.current?.handleSubmit((data: PhysicianAndCaseMangerFormDataType) => {
          setPhysicianDetails(data)
          console.log('Physician Details in Parent:', data)
          // Move to next step after successful validation
          setActiveStep(prevActiveStep => prevActiveStep + 1)
        })()
        break
      case 2:
        serviceActivitiesFormRef.current?.handleSubmit((data: clientServiceFormDataType) => {
          setServiceActivities(data)
          console.log('Personal Details in Parent:', data)
          // Move to next step after successful validation
          setActiveStep(prevActiveStep => prevActiveStep + 1)
        })()
        break
      case 3:
        documentsFormRef.current?.handleSubmit((data: any) => {
          setDocuments(data)
          handleSave(data)
          console.log('Documents data:', data)
        })()
        break
    }
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const onPersonalDetailsSubmit = (values: PersonalDetailsFormDataType) => {
    console.log('Personal Details in Parent:', values)
    // Optionally store values or perform next step logic
    handleNext() // Move to next step
  }

  const physicianAndCaseMangerFormSubmit = (values: any) => {
    console.log('physicianAndCaseMangerFormSubmit', values)
  }

  const serviceActivitiesFormSubmit = (values: any) => {
    console.log('Personal Detail', values)
  }

  const onDocumentsFormSubmit = (values: any) => {
    console.log('Personal Detail', values)
  }

  console.log('ACTIVE STREP', activeStep)
  const renderStepContent = (activeStep: number) => {
    switch (activeStep) {
      case 0:
        return <PersonalDetailsForm ref={personalDetailsFormRef} onFinish={onPersonalDetailsSubmit} />
      case 1:
        return (
          <PhysicianAndCaseMangerForm ref={physicianAndCaseMangerFormRef} onFinish={physicianAndCaseMangerFormSubmit} />
        )
      case 2:
        return <ServiceActivitiesForm ref={serviceActivitiesFormRef} onFinish={serviceActivitiesFormSubmit} />
      case 3:
        return <DocumentsForm ref={documentsFormRef} onFinish={onDocumentsFormSubmit} />
      default:
        return 'Unknown step'
    }
  }

  return (
    <>
      <Card className='p-2'>
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
                  <Button variant='outlined' onClick={() => router.replace('/apps/client/list')} color='secondary'>
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
    </>
  )
}

export default AddClientStepper

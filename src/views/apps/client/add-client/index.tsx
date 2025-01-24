'use client'

// React Imports
import { useRef, useState } from 'react'

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
  // States
  const [activeStep, setActiveStep] = useState(2)

  const personalDetailsFormRef = useRef<any>(null)
  const physicianAndCaseMangerFormRef = useRef<any>(null)
  const serviceActivitiesFormRef = useRef<any>(null)

  const handleReset = () => {
    setActiveStep(0)
  }

  const handleNext = () => {
    console.log('in next', activeStep)
    if (activeStep === 0) {
      // Manually trigger form submission for the first step
      personalDetailsFormRef.current?.handleSubmit((data: PersonalDetailsFormDataType) => {
        console.log('Personal Details in Parent:', data)
        // Move to next step after successful validation
        setActiveStep(prevActiveStep => prevActiveStep + 1)
      })()
    } else if (activeStep === 1) {
      physicianAndCaseMangerFormRef.current?.handleSubmit((data: PhysicianAndCaseMangerFormDataType) => {
        console.log('Personal Details in Parent:', data)
        // Move to next step after successful validation
        setActiveStep(prevActiveStep => prevActiveStep + 1)
      })()
    } else if (activeStep === 2) {
      serviceActivitiesFormRef.current?.handleSubmit((data: clientServiceFormDataType) => {
        console.log('Personal Details in Parent:', data)
        // Move to next step after successful validation
        setActiveStep(prevActiveStep => prevActiveStep + 1)
      })()
    } else {
      // For other steps, use existing logic
      setActiveStep(prevActiveStep => prevActiveStep + 1)
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

  const onTrainingCertificatesSubmit = (values: any) => {
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
          <Grid container spacing={6} sx={{ marginTop: 3 }}>
            {renderStepContent(activeStep)}
            <Grid size={{ xs: 12 }} className='flex justify-between'>
              <Button
                variant='tonal'
                disabled={activeStep === 0}
                onClick={handleBack}
                color='secondary'
                startIcon={<DirectionalIcon ltrIconClass='bx-left-arrow-alt' rtlIconClass='bx-right-arrow-alt' />}
              >
                Back
              </Button>
              <Button
                variant='contained'
                onClick={handleNext}
                endIcon={
                  activeStep === steps.length - 1 ? (
                    <i className='bx-check' />
                  ) : (
                    <DirectionalIcon ltrIconClass='bx-right-arrow-alt' rtlIconClass='bx-left-arrow-alt' />
                  )
                }
              >
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Grid>
          </Grid>
        </>
      )}
    </>
  )
}

export default AddClientStepper

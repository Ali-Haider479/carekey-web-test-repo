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
]

const EmployeeStepper = () => {
  // States
  const [activeStep, setActiveStep] = useState(3)

  const router = useRouter()

  const personalDetailsFormRef = useRef<any>(null)
  const certificatesFormRef = useRef<any>(null)
  const loginInfoFormRef = useRef<any>(null)

  const handleReset = () => {
    setActiveStep(0)
  }

  const handleNext = () => {
    console.log('Active steps', activeStep)
    if (activeStep === 0) {
      // Manually trigger form submission for the first step
      personalDetailsFormRef.current?.handleSubmit((data: FormDataType) => {
        console.log('Personal Details in Parent:', data)
        // Move to next step after successful validation
        setActiveStep(prevActiveStep => prevActiveStep + 1)
      })()
    } else if (activeStep === 1) {
      loginInfoFormRef.current?.handleSubmit((data: FormDataType) => {
        console.log('Login Info in parent: ', data)
        // Move to next step after successful validation
        setActiveStep(prevActiveStep => prevActiveStep + 1)
      })()
    } else if (activeStep === 2) {
      setActiveStep(prevActiveStep => prevActiveStep + 1)
    } else if (activeStep === 3) {
      // Manually trigger form submission for the first step
      certificatesFormRef.current?.handleSubmit((data: any) => {
        console.log('Certificates data:', data)
        // Move to next step after successful validation
        setActiveStep(prevActiveStep => prevActiveStep + 1)
      })()
    } else {
      console.log('INSIDE ELSEE----------------')
      // For other steps, use existing logic
      setActiveStep(prevActiveStep => prevActiveStep + 1)
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

  console.log('ACTIVE STREP', activeStep)
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
          {/* </form> */}
        </>
      )}
    </>
  )
}

export default EmployeeStepper

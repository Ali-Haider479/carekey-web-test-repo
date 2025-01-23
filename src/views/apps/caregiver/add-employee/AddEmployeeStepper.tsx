'use client'

// React Imports
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Styled Component Imports
import StepperWrapper from '@/libs/styles/stepper'
import StepperCustomDot from '@/components/stepper-dot'

interface StepsProps {
  activeStep: number
}

// Vars
const steps = [
  {
    title: '01',
    description: 'Personal Details & Caregiver notes',
    route: '/caregiver/add-employee/personal-details'
  },
  {
    title: '02',
    description: 'Login Info & Mailing address',
    route: '/caregiver/add-employee/login-info'
  },
  {
    title: '03',
    description: 'PCA UMPI Information',
    route: '/caregiver/add-employee/pca-info'
  },
  {
    title: '04',
    description: 'Training Certificate & Driving License',
    route: '/caregiver/add-employee/training-certificates'
  },
  {
    title: '05',
    description: 'Documents',
    route: '/caregiver/add-employee/documents'
  }
]

const AddEmployeeStepper: React.FC<StepsProps> = ({ activeStep }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveIndex(prevActiveStep => prevActiveStep + 1)
      router.push(steps[activeStep + 1].route) // Navigate to the next route
    } else {
      // Final Step: Submit or perform an action
      console.log('Form Submitted')
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveIndex(prevActiveStep => prevActiveStep - 1)
      router.push(steps[activeStep - 1].route) // Navigate to the previous route
    }
  }

  const handleReset = () => {
    setActiveIndex(0)
    router.push(steps[0].route) // Navigate to the first step
  }

  return (
    <>
      <div className='bg-white rounded-lg shadow-md pt-6 pb-3'>
        <StepperWrapper>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.title}>
                <StepLabel
                  slots={{
                    stepIcon: StepperCustomDot
                  }}
                >
                  <div className='step-label'>
                    <div>
                      <Typography className='step-title'>{step.title}</Typography>
                      <Typography className='step-subtitle'>{step.description}</Typography>
                    </div>
                  </div>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </StepperWrapper>
      </div>
      {/* <div className="mt-4 flex justify-between">
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          color="secondary"
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button variant="contained" onClick={handleReset}>
            Reset
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </div> */}
    </>
  )
}

export default AddEmployeeStepper

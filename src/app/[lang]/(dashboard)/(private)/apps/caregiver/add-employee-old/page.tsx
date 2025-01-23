'use client'
import AddEmployeeStepper from '@views/apps/caregiver/add-employee/AddEmployeeStepper'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'
import { useState } from 'react'

const AddEmployeeLayout = ({ children }: { children: React.ReactNode }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const path = usePathname()

  const setIndex = (currentPath: string): number => {
    const pathMap: Record<string, number> = {
      '/caregiver/add-employee/personal-details': 0,
      '/caregiver/add-employee/login-info': 1,
      '/caregiver/add-employee/pca-info': 2,
      '/caregiver/add-employee/training-certificates': 3,
      '/caregiver/add-employee/documents': 4
    }

    const index = pathMap[currentPath]
    return index ?? 0
  }

  useEffect(() => {
    let index: number = setIndex(path)
    setActiveIndex(index)
  }, [path])

  return (
    <div className='w-full h-full'>
      <div>
        <AddEmployeeStepper activeStep={activeIndex} />
        {/* <AddEmployeeProgressSteps
          currentStep={activeIndex}
          pageTitle={"Adding a Employee"}
        /> */}
      </div>
      <div className='mt-5'>
        <main>{children}</main>
      </div>
    </div>
  )
}

export default AddEmployeeLayout

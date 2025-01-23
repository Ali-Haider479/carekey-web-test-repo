'use client'
import React, { useState } from 'react'
import { Form, FormInstance } from 'antd'
import { useForm, useFormContext } from 'react-hook-form'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import CustomTextField from '@core/components/custom-inputs/CustomTextField'

type Props = {
  form?: any
  onFinish: (values: object) => void
}

interface FormDataType {
  allergies?: string
  specialRequests?: string
  comments?: string
}

const CaregiverNotes = ({ form, onFinish }: Props) => {
  const [formData, setFormData] = useState<FormDataType>({
    allergies: '',
    specialRequests: '',
    comments: ''
  })

  const {
    control,
    formState: { errors }
  } = useFormContext<FormDataType>()

  const onSubmit = (data: FormDataType) => {
    console.log('Submitted Data:', data)
    onFinish(data) // Call the parent `onFinish` function
  }

  return (
    <div className='mt-5'>
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <h2 className='text-xl font-semibold mb-4'>Caregiver Notes</h2>
        <div>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                label={'Allergies'}
                placeHolder={'Allergies'}
                name={'allergies'}
                defaultValue={''}
                type={'text'}
                error={errors.allergies}
                control={control}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                label={'Special Requests'}
                placeHolder={'Special Requests'}
                name={'specialRequests'}
                defaultValue={''}
                type={'text'}
                error={errors.specialRequests}
                control={control}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                label={'Comments'}
                placeHolder={'Comments'}
                name={'commments'}
                defaultValue={''}
                type={'text'}
                error={errors.comments}
                control={control}
              />
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  )
}

export default CaregiverNotes

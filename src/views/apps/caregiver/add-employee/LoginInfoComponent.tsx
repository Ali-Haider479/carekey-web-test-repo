'use client'

import React, { useState } from 'react'
import { Button, Form } from 'antd'
import { useForm } from 'antd/es/form/Form'
import CustomTextField from '@core/components/custom-inputs/CustomTextField'
import { useFormContext } from 'react-hook-form'
import CustomDropDown from '@core/components/custom-inputs/CustomDropDown'

type Props = {
  form: any
  onFinish: any
}

const LoginInfoComponent = (props: Props) => {
  interface FormDataType {
    // Account Login Information
    userName?: string
    emailAddress?: string
    password?: string
    confirmPassword?: string
    additionalEmail?: string
    accountStatus?: string

    // Assign Client
    clientName?: string

    // Mailing Address
    address?: string
    city?: string
    state?: string
    zipCode?: string
  }

  const {
    control,
    formState: { errors }
  } = useFormContext<FormDataType>()

  const accountStatusOptions = [
    { key: 0, value: 'Active' },
    { key: 1, value: 'Inactive' }
  ]

  const handleSubmit = (values: any) => {
    console.log('Form Values:', values)
  }

  const handleFinishFailed = (errorInfo: any) => {
    console.error('Form Errors:', errorInfo)
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      {/* Account Login Information */}
      <h2 className='text-xl font-semibold mb-6'>Account Login Information</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Username */}
        <CustomTextField
          label={'Username'}
          placeHolder={'JohnDoe'}
          name={'userName'}
          defaultValue={''}
          type={'text'}
          error={errors.userName}
          control={control}
        />

        {/* Email Address */}
        <CustomTextField
          label={'Email Address'}
          placeHolder={'john.doe@example.com'}
          name={'emailAddress'}
          defaultValue={''}
          type={'email'}
          error={errors.emailAddress}
          control={control}
        />

        {/* Password */}
        <CustomTextField
          label={'Password'}
          placeHolder={'.....'}
          name={'password'}
          defaultValue={''}
          type={'text'}
          error={errors.password}
          control={control}
        />

        {/* Confirm Password */}
        <CustomTextField
          label={'Confirm Password'}
          placeHolder={'.....'}
          name={'confirmPassword'}
          defaultValue={''}
          type={'text'}
          error={errors.confirmPassword}
          control={control}
        />

        {/* Additional Email */}
        <CustomTextField
          label={'Additional Email Address'}
          placeHolder={'Enter Additional Email Address'}
          name={'additionalEmail'}
          defaultValue={''}
          type={'email'}
          error={errors.additionalEmail}
          control={control}
        />

        {/* Account Status */}
        <CustomDropDown
          name={'accountStatus'}
          control={control}
          error={errors.accountStatus}
          label={'Account Status'}
          optionList={[
            { key: 1, value: 'active', optionString: 'Active' },
            { key: 2, value: 'inActive', optionString: 'Inactive' }
          ]}
          defaultValue={''}
        />
      </div>

      {/* Assign Client */}
      <h2 className='text-xl font-semibold mt-10 mb-6'>Assign Client</h2>
      <div className='grid grid-cols-1 gap-4'>
        <div className='flex items-center gap-4'>
          {/* Custom Input */}
          <CustomTextField
            label={'Client Name'}
            placeHolder={'Enter Client Name'}
            name={'clientName'}
            defaultValue={''}
            type={'text'}
            error={errors.clientName}
            control={control}
          />

          {/* Add Button */}
          <Button type='primary' className='!bg-[#4B0082] !text-white hover:!bg-[#4B0082]'>
            + ADD
          </Button>
        </div>
      </div>

      {/* Mailing Address */}
      <h2 className='text-xl font-semibold mt-10 mb-6'>Mailing Address</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Address */}
        <CustomTextField
          label={'Address'}
          placeHolder={'Enter Address'}
          name={'address'}
          defaultValue={''}
          type={'text'}
          error={errors.address}
          control={control}
        />

        {/* City */}
        <CustomTextField
          label={'City'}
          placeHolder={'Enter City'}
          name={'city'}
          defaultValue={''}
          type={'text'}
          error={errors.city}
          control={control}
        />

        {/* State */}
        <CustomTextField
          label={'State'}
          placeHolder={'Enter State'}
          name={'clientName'}
          defaultValue={''}
          type={'text'}
          error={errors.state}
          control={control}
        />

        {/* ZIP Code */}
        <CustomTextField
          label={'Zip Code'}
          placeHolder={'Enter Zip Code'}
          name={'zipCode'}
          defaultValue={''}
          type={'text'}
          error={errors.zipCode}
          control={control}
        />
      </div>
    </div>
  )
}

export default LoginInfoComponent

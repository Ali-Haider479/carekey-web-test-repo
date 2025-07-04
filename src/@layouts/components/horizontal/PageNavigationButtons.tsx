'use client'
import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import React from 'react'

type Props = {
  onClickNext?: any
  onClickBack: any
  form?: any
  className?: any
}

export default function PageNavigationButtons({ onClickNext, onClickBack, form, className = '' }: Props) {
  const router = useRouter()
  const handleOnCancel = () => {
    router.push('/client/list')
  }
  return (
    <div className={`${className} flex justify-between items-center bg-white p-4 rounded-lg shadow-md mt-3 mb-3`}>
      {/* Cancel Button */}
      <Button
        onClick={handleOnCancel}
        className='!border-gray-300 !text-gray-500 hover:!text-gray-700 hover:!border-gray-400'
      >
        CANCEL
      </Button>

      <div className='flex gap-2'>
        {/* Back Button */}
        <Button
          onClick={() => onClickBack()}
          className='!border-gray-300 !text-gray-500 hover:!text-gray-700 hover:!border-gray-400'
        >
          BACK
        </Button>

        {/* Next Button */}
        <Button onClick={form ? form.submit : () => onClickNext()}>NEXT</Button>
      </div>
    </div>
  )
}

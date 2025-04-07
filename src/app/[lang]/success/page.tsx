'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Box, Typography, Button, Icon } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  // Handle "Go Back" button click
  const handleGoBack = () => {
    router.push(`/en/apps/dashboard`)
  }

  return (
    <Box
      className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500'
      sx={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Success Card */}
      <Box
        className='bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center transform transition-all duration-500 hover:scale-105'
        sx={{ zIndex: 10 }}
      >
        {/* Success Icon */}
        <Box className='flex justify-center mb-6'>
          <CheckCircleIcon
            sx={{
              fontSize: 80,
              color: '#4caf50',
              animation: 'bounce 0.5s ease-in-out'
            }}
          />
        </Box>

        {/* Success Message */}
        <Typography variant='h4' className='text-gray-800 font-bold mb-4' sx={{ fontFamily: 'Poppins, sans-serif' }}>
          Payment Successful!
        </Typography>

        <Typography variant='body1' className='text-gray-600 mb-6' sx={{ fontFamily: 'Roboto, sans-serif' }}>
          Thank you for your payment. Your transaction was completed successfully.
        </Typography>

        {/* Move Session ID inside the card */}
        {/* {sessionId && (
          <Typography variant='body2' className='text-gray-500 mb-6 italic' sx={{ fontFamily: 'Roboto, sans-serif' }}>
            Session ID: {sessionId}
          </Typography>
        )} */}

        {/* Go Back Button */}
        <Button
          variant='contained'
          onClick={handleGoBack}
          className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300'
          sx={{ textTransform: 'none', fontFamily: 'Poppins, sans-serif' }}
        >
          Go Back
        </Button>
      </Box>

      {/* Custom CSS for Animation */}
      <style jsx global>{`
        @keyframes bounce {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
      `}</style>
    </Box>
  )
}

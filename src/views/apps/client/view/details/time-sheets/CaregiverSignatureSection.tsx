import React, { useEffect, useState } from 'react'
import { TextField, Divider, Box, Card } from '@mui/material'
import Image from 'next/image'
import { formatDateTime } from '@/utils/helperFunctions'

const AcknowledgeSignatureCaregiver = ({ data }: any) => {
  const [signatureImage, setSignatureImage] = useState('') // State for Base64 image src
  const [signatureText, setSignatureText] = useState('') // State for plain text signature

  useEffect(() => {
    const signature = data?.[0]?.signature?.caregiverSignature

    if (signature) {
      // Check if the signature is a Base64 string (image)
      const isBase64Image = signature.startsWith('data:image') || /^[A-Za-z0-9+/=]+$/.test(signature) // Basic Base64 pattern check

      if (isBase64Image) {
        // Handle Base64 image
        const imageSrc = signature.startsWith('data:image') ? signature : `data:image/png;base64,${signature}`
        setSignatureImage(imageSrc)
        setSignatureText('') // Clear text if it's an image
      } else {
        // Handle plain text
        setSignatureText(signature)
        setSignatureImage('') // Clear image if it's text
      }
    } else {
      // No signature provided
      setSignatureImage('')
      setSignatureText('')
    }
  }, [data])

  // Utility function to format date (assuming you have this defined elsewhere)
  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <Card className='shadow-md rounded-lg p-6 w-[99%] mt-3 ml-2 border-solid border-2'>
      <h2 className='text-xl font-semibold mb-6'>Acknowledge and Required Signature for Caregiver</h2>
      <div className='grid grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium mb-1'>Recipient Name</label>
          <TextField
            value={`${data?.[0]?.caregiver?.firstName || ''} ${data?.[0]?.caregiver?.lastName || ''}`}
            variant='outlined'
            size='small'
            fullWidth
            disabled
          />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>PMI Number</label>
          <TextField
            value={data?.[0]?.caregiver?.caregiverUMPI || ''}
            variant='outlined'
            size='small'
            fullWidth
            disabled
          />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Recipient/Responsible Party Signature</label>
          {signatureImage ? (
            <Image
              src={signatureImage}
              width={150}
              height={100}
              alt='Caregiver Signature'
              quality={100} // Max quality for clarity
              style={{
                border: '1px solid rgba(0, 0, 0, 0.23)', // Match TextField border
                borderRadius: '4px', // Match TextField border-radius
                padding: '2px', // Slight padding for consistency
                backgroundColor: 'white'
              }}
            />
          ) : signatureText ? (
            <TextField value={signatureText} variant='outlined' size='small' fullWidth disabled />
          ) : (
            <TextField value='No signature available' variant='outlined' size='small' fullWidth disabled />
          )}
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Date</label>
          <TextField
            value={formatDateTime(data?.[0]?.signature?.createdAt)}
            variant='outlined'
            size='small'
            fullWidth
            disabled
          />
        </div>
      </div>
    </Card>
  )
}

export default AcknowledgeSignatureCaregiver

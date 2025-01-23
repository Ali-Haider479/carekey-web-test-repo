import React from 'react'
import { TextField, Divider, Box } from '@mui/material'

const AcknowledgeSignatureCaregiver = () => {
  return (
    <Box className='shadow-md rounded-lg p-6 w-[99%] mt-3 ml-2 border-solid border-2'>
      <h2 className='text-xl font-semibold  mb-6'>Acknowledge and Required Signature for Client</h2>
      <div className='grid grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium  mb-1'>Recipient Name</label>
          <TextField value='Jessie Starnes' InputProps={{ readOnly: true }} variant='outlined' size='small' fullWidth />
        </div>
        <div>
          <label className='block text-sm font-medium  mb-1'>PMI Number</label>
          <TextField value='012371283' InputProps={{ readOnly: true }} variant='outlined' size='small' fullWidth />
        </div>
        <div>
          <label className='block text-sm font-medium  mb-1'>Recipient/Responsible Party Signature</label>
          <TextField value='Jesssie' InputProps={{ readOnly: true }} variant='outlined' size='small' fullWidth />
        </div>
        <div>
          <label className='block text-sm font-medium  mb-1'>Date</label>
          <TextField
            value='September 27, 2024 - 05:23 PM'
            InputProps={{ readOnly: true }}
            variant='outlined'
            size='small'
            fullWidth
          />
        </div>
      </div>
    </Box>
  )
}

export default AcknowledgeSignatureCaregiver

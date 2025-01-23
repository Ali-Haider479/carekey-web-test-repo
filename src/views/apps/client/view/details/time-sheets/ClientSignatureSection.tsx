import React from 'react'
import { TextField, Divider, Box } from '@mui/material'

const AcknowledgeSignature = () => {
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

      <Divider className='my-6' />

      <div className='grid grid-cols-3 text-center'>
        <div>
          <span className='block text-sm font-medium  mb-2'>WEEK 1</span>
          <span className='text-lg font-bold '>39 HOURS 30 MINUTES</span>
        </div>
        <div>
          <span className='block text-sm font-medium  mb-2'>WEEK 2</span>
          <span className='text-lg font-bold '>39 HOURS 45 MINUTES</span>
        </div>
        <div>
          <span className='block text-sm font-medium  mb-2'>TOTAL BI-WEEKLY HOURS</span>
          <span className='text-lg font-bold '>79 HOURS 15 MINUTES</span>
        </div>
      </div>
    </Box>
  )
}

export default AcknowledgeSignature

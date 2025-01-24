// React Imports
'use client'

import React, { useEffect, useState } from 'react'
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  TextField,
  Typography,
  Card,
  CardContent
} from '@mui/material'

import Grid from '@mui/material/Grid2'

interface DisplayFile {
  id: number
  name: string
  status: 'success' | 'error' | 'uploading'
  progress: number
}

interface Props {
  form?: any
}

const PCAUMPITable = ({ form }: Props) => {
  const [s3Files, setS3Files] = useState<File[]>([])
  const [displayFiles, setDisplayFiles] = useState<DisplayFile[]>([])

  useEffect(() => {
    // Update form with training files specifically
    form?.setFieldsValue({
      trainingFiles: s3Files
    })
  }, [s3Files, form])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const isAllowed = file.size / 1024 / 1024 < 50
        const timestamp = Date.now()

        if (!isAllowed) {
          setDisplayFiles(prev => [...prev, { id: timestamp, name: file.name, status: 'error', progress: 100 }])
          alert('File size must be less than 50MB')
        } else {
          setS3Files(prev => [...prev, file])
          setDisplayFiles(prev => [
            ...prev,
            {
              id: timestamp,
              name: file.name,
              status: 'success',
              progress: 100
            }
          ])
        }
      })
    }
  }

  const tableData = [
    { key: '1', payor: 'MA' },
    { key: '2', payor: 'MEDICA' },
    { key: '3', payor: 'MHP' },
    { key: '4', payor: 'BCBS' },
    { key: '5', payor: 'UCARE' },
    { key: '6', payor: 'HEALTH PARTNER' },
    { key: '7', payor: 'BCBS BP' },
    { key: '8', payor: 'BRIDGE VIEW' },
    { key: '9', payor: 'PRIME WEST' }
  ]

  return (
    <Card className='mt-5'>
      <CardContent>
        <Grid container spacing={4}>
          <div className='flex flex-row justify-between items-center w-full mb-2'>
            <Typography variant='h4' gutterBottom>
              PCA UMPI Information
            </Typography>
            <Button
              variant='contained'
              component='label'
              size='small'
              className='!bg-[#4B0082] !text-[white] !border-[#4B0082] hover:!bg-[#4B0082] hover:!border-[#4B0082] !rounded-[8px]'
            >
              CHOOSE FILE
              <input type='file' hidden onChange={handleFileUpload} />
            </Button>
          </div>
          <TableContainer>
            <Table>
              <TableHead className='bg-gray-100'>
                <TableRow>
                  <TableCell className='relative'>
                    <span className='border-r border-gray-300 h-[60%] absolute top-[20%] right-0'></span>
                    PAYOR
                  </TableCell>
                  <TableCell className='relative'>
                    <span className='border-r border-gray-300 h-[60%] absolute top-[20%] right-0'></span>
                    UMPI
                  </TableCell>
                  <TableCell className='relative'>
                    <span className='border-r border-gray-300 h-[60%] absolute top-[20%] right-0'></span>
                    ACTIVATION DATE
                  </TableCell>
                  <TableCell className='relative'>
                    <span className='border-r border-gray-300 h-[60%] absolute top-[20%] right-0'></span>
                    EXPIRY DATE
                  </TableCell>
                  <TableCell className='relative'>
                    <span className='border-r border-gray-300 h-[60%] absolute top-[20%] right-0'></span>
                    FAX DATE
                  </TableCell>
                  <TableCell className='relative'>RECEIVED DATE</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tableData.map(row => (
                  <TableRow key={row.key}>
                    <TableCell>{row.payor}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div className='mt-5 w-full'>
            <Grid>
              <TextField
                label='Notes'
                placeholder='Enter any notes here'
                fullWidth
                multiline
                rows={4}
                margin='normal'
              />
            </Grid>
          </div>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default PCAUMPITable

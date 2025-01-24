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
import { GridColDef } from '@mui/x-data-grid'
import DataTable from '@/@core/components/mui/DataTable'

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

  const rowData = [
    { id: '1', payor: 'MA' },
    { id: '2', payor: 'MEDICA' },
    { id: '3', payor: 'MHP' },
    { id: '4', payor: 'BCBS' },
    { id: '5', payor: 'UCARE' },
    { id: '6', payor: 'HEALTH PARTNER' },
    { id: '7', payor: 'BCBS BP' },
    { id: '8', payor: 'BRIDGE VIEW' },
    { id: '9', payor: 'PRIME WEST' }
  ]

  const newColumns: GridColDef[] = [
    // {
    //   field: 'itemNumber',
    //   headerName: '#',
    //   flex: 0.5,
    //   renderCell: (params: GridRenderCellParams) => <span>{params.row.index + 1}</span>
    // },
    {
      field: 'payor',
      headerName: 'PAYOR',
      flex: 0.3
    },
    {
      field: 'umpi',
      headerName: 'UMPI',
      flex: 0.3
    },
    {
      field: 'activationDate',
      headerName: 'ACTIVATION DATE',
      flex: 0.3
    },
    {
      field: 'expiryDate',
      headerName: 'EXPIRY DATE',
      flex: 0.3
    },
    {
      field: 'faxDate',
      headerName: 'FAX DATE',
      flex: 0.3
    },
    {
      field: 'recievedDate',
      headerName: 'RECIEVED DATE',
      flex: 0.3
    }
  ]

  return (
    <Card className='mt-5 w-full'>
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
          <DataTable columns={newColumns} data={rowData} />
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

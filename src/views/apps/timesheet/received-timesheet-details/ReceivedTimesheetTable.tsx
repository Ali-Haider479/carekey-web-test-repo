'use client'

import { useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { CircularProgress, Typography } from '@mui/material'
import DataTable from '@/@core/components/mui/DataTable'
import { GridColDef } from '@mui/x-data-grid'

// Updated interfaces to match your data structure
interface Caregiver {
  id: number
  firstName: string
  lastName: string
  middleName: string
  gender: string
  dateOfBirth: string
  caregiverUMPI: string
  payRate: number
  additionalPayRate: number
  caregiverLevel: string
}

interface Client {
  id: number
  firstName: string
  lastName: string
  middleName: string
  gender: string
  dateOfBirth: string
  pmiNumber: string
  clientCode: string
  clientServices: any
}

interface Signature {
  id: number
  clientSignStatus: string
  tsApprovalStatus: string
  duration: string
  caregiverSignature: string
  clientSignature: string
  caregiver: Caregiver
  client: Client
  timeLog: any[]
  tenant: any
}

interface SignatureStatusTableProps {
  data: []
  isLoading: boolean
}

const ReceivedTimesheetTable = ({ data, isLoading }: SignatureStatusTableProps) => {
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'clientName',
        headerName: 'CLIENT NAME',
        flex: 1.5,
        renderCell: (params: any) => (
          <Typography className='font-normal text-base my-3'>
            {params?.row?.client?.firstName} {params?.row?.client?.lastName}
          </Typography>
        )
      },
      {
        field: 'caregiverName',
        headerName: 'CAREGIVER NAME',
        flex: 1.5,
        renderCell: (params: any) => (
          <Typography className='font-normal text-base my-3'>
            {params?.row?.caregiver?.firstName} {params?.row?.caregiver?.lastName}
          </Typography>
        )
      },
      {
        field: 'serviceName',
        headerName: 'SERVICE',
        flex: 1.5,
        renderCell: (params: any) => (
          <Typography className='font-normal text-base my-3'>{params?.row?.serviceName}</Typography>
        )
      },
      {
        field: 'payPeriod',
        headerName: 'PAY PERIOD',
        flex: 1.5,
        renderCell: (params: any) => {
          const startDate = params?.row?.payPeriodHistory?.startDate
          if (startDate) {
            const date = new Date(startDate)
            return (
              <Typography className='font-normal text-base my-3'>
                {`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`}
              </Typography>
            )
          }
          return <Typography className='font-normal text-base my-3'>N/A</Typography>
        }
      },
      {
        field: 'tsApprovalStatus',
        headerName: 'TS SUBMITTED',
        flex: 1,
        renderCell: (params: any) => (
          <Typography className='font-normal text-base my-3'>{params?.row?.signature?.tsApprovalStatus}</Typography>
        )
      }
    ],
    []
  )

  if (isLoading) {
    return (
      <Card>
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      </Card>
    )
  }

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      <CardHeader title='Received Timesheet' className='pb-4' />
      <div style={{ overflowX: 'auto', padding: '0px' }}>
        <DataTable data={data} columns={columns} />
      </div>
    </Card>
  )
}

export default ReceivedTimesheetTable

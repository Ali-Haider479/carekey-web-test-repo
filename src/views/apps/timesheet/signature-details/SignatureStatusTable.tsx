'use client'

import { useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { CircularProgress, Typography } from '@mui/material'
import DataTable from '@/@core/components/mui/DataTable'
import { GridColDef } from '@mui/x-data-grid'
import AdUnitsIcon from '@mui/icons-material/AdUnits'
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

interface SignatureStatusTableProps {
  data: []
  isLoading: boolean
}

const SignatureStatusTable = ({ data, isLoading }: SignatureStatusTableProps) => {
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const calculateHoursWorked = (clockIn: string, clockOut: string) => {
    // Parse the clock-in and clock-out times
    const clockInTime = new Date(clockIn)
    const clockOutTime = new Date(clockOut)

    // Calculate the difference in milliseconds
    const differenceMs = clockOutTime.getTime() - clockInTime.getTime()

    // Convert milliseconds to hours
    const hours = differenceMs / (1000 * 60 * 60)

    // Round to two decimal places
    return hours.toFixed(2)
  }

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
        headerName: 'CAREGIVER ASSIGNED',
        flex: 1.5,
        renderCell: (params: any) => (
          <Typography className='font-normal text-base my-3'>
            {params?.row?.caregiver?.firstName} {params?.row?.caregiver?.lastName}
          </Typography>
        )
      },
      {
        field: 'serviceName',
        headerName: 'SERVICE TAKEN',
        flex: 1.5,
        renderCell: (params: any) => (
          <Typography className='font-normal text-base my-3'>{params?.row?.serviceName}</Typography>
        )
      },
      {
        field: 'payPeriod',
        headerName: 'DATE',
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
        field: 'hoursWorked',
        headerName: 'LOGS RECORDED',
        flex: 1,
        renderCell: (params: any) => {
          try {
            const hoursWorked = calculateHoursWorked(params.row.clockIn, params.row.clockOut)

            return <Typography className='font-normal text-base my-3'>{hoursWorked} Hrs</Typography>
          } catch (error) {
            console.error('Error calculating hours worked:', error)
            return <span>N/A</span>
          }
        }
      },
      {
        field: 'logsVia',
        headerName: 'LOGGED VIA',
        flex: 1.5,
        renderCell: (params: any) => <AdUnitsIcon className='my-3' />
      },
      {
        field: 'approvedLoc',
        headerName: 'APPROVED LOC',
        flex: 1,
        renderCell: (params: any) => <Typography className='font-normal text-base my-3'>Yes</Typography>
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
      <CardHeader title='Signatures Status' className='pb-4' />
      <div style={{ overflowX: 'auto', padding: '0px' }}>
        <DataTable data={data} columns={columns} />
      </div>
    </Card>
  )
}

export default SignatureStatusTable

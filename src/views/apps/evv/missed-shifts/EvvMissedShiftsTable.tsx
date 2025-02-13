'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Card from '@mui/material/Card'
import { CircularProgress, Typography } from '@mui/material'
import ReactTable from '@/@core/components/mui/ReactTable'
import { calculateHoursWorked, formattedDate } from '@/utils/helperFunctions'
import EvvFilters from '../completed-shifts/EvvFilter'

interface Caregiver {
  firstName: string
  lastName: string
}

interface Client {
  firstName: string
  lastName: string
}

interface TimeLogData {
  id: number
  clockIn: string
  clockOut: string
  serviceName: string
  startLocation: Location
  caregiver: Caregiver
  client: Client
}

interface Props {
  timeLogData: TimeLogData[]
  isLoading: boolean
}

const EvvMissedShiftsTable = ({ timeLogData, isLoading }: Props) => {
  const columns = [
    {
      accessorKey: 'caregiverName',
      header: 'CAREGIVER NAME',
      Cell: ({ row }: any) => (
        <Typography>{`${row.original.caregiver.firstName} ${row.original.caregiver.lastName}`}</Typography>
      )
    },
    {
      accessorKey: 'clientName',
      header: 'CLIENT NAME',
      Cell: ({ row }: any) => (
        <Typography>{`${row.original.client.firstName} ${row.original.client.lastName}`}</Typography>
      )
    },
    {
      accessorKey: 'pro',
      header: 'PRO',
      Cell: ({ row }: any) => <Typography>H2014</Typography>
    },
    {
      accessorKey: 'mod',
      header: 'MOD',
      Cell: ({ row }: any) => <Typography>F.159</Typography>
    },
    { accessorKey: 'serviceName', header: 'SERVICE' },
    {
      accessorKey: 'totalHrs',
      header: 'LOGGED-IN DURATION',
      Cell: ({ row }: any) => calculateHoursWorked(row.original.clockIn, row.original.clockOut)
    }
  ]

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      <div className='p-4 my-2'>
        <EvvFilters />
      </div>
      {isLoading ? (
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      ) : (
        <ReactTable columns={columns} data={timeLogData} enableExpanding={false} enableExpandAll={false} />
      )}
    </Card>
  )
}

export default EvvMissedShiftsTable

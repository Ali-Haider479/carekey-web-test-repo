'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Card from '@mui/material/Card'
import { CircularProgress, Typography } from '@mui/material'
import ReactTable from '@/@core/components/mui/ReactTable'
import { calculateHoursWorked, formattedDate } from '@/utils/helperFunctions'
import EvvFilters from './EvvFilter'

// Updated interfaces to match your data structure
const dummyData = [
  {
    id: 1,
    clientName: 'Cody Fisher',
    caregiverName: 'Kathryn Murphy',
    service: 'Physical therapy',
    location: 'Lahore, Pakistan',
    status: 'Active',
    clockIn: '04/15/2024'
  },
  {
    id: 2,
    clientName: 'Robert Fox',
    caregiverName: 'Leslie Alexander',
    service: 'Physical therapy',
    location: 'Lahore, Pakistan',
    status: 'Active',
    clockIn: '04/15/2024'
  },
  {
    id: 3,
    clientName: 'Esther Howard',
    caregiverName: 'Courtney Henry',
    service: 'Physical therapy',
    location: 'Lahore, Pakistan',
    status: 'Active',
    clockIn: '04/15/2024'
  },
  {
    id: 4,
    clientName: 'Jenny Wilson',
    caregiverName: 'Kristin Watson',
    service: 'Physical therapy',
    location: 'Lahore, Pakistan',
    status: 'Active',
    clockIn: '04/15/2024'
  }
]

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

const EvvCompletedShiftsTable = ({ timeLogData, isLoading }: Props) => {
  const columns = [
    {
      id: 'caregiverName',
      label: 'CAREGIVER NAME',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: (user: any) => (
        <Typography color='primary'>{`${user?.caregiver?.firstName} ${user?.caregiver?.lastName}`}</Typography>
      )
    },
    {
      id: 'clientName',
      label: 'CLIENT NAME',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: (user: any) => (
        <Typography color='primary'>{`${user?.client?.firstName} ${user?.client?.lastName}`}</Typography>
      )
    },
    {
      id: 'pro',
      label: 'PRO & MOD',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => <Typography color='primary'>{user?.client?.authService[0]?.procedureAndModifier}</Typography>
    },
    {
      id: 'clockIn',
      label: 'CLOCK IN',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => <Typography color='primary'>{formattedDate(user?.clockIn)}</Typography>
    },
    {
      id: 'clockOut',
      label: 'CLOCK OUT',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => <Typography color='primary'>{formattedDate(user?.clockOut)}</Typography>
    },
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
        <ReactTable
          columns={columns}
          data={timeLogData}
          keyExtractor={user => user.id.toString()}
          enableRowSelect
          enablePagination
          pageSize={5}
          stickyHeader
          maxHeight={600}
          containerStyle={{ borderRadius: 2 }}
        />
      )}
    </Card>
  )
}

export default EvvCompletedShiftsTable

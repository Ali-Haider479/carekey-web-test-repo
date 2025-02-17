'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Card from '@mui/material/Card'
import { CircularProgress, IconButton, Typography } from '@mui/material'
import ReactTable from '@/@core/components/mui/ReactTable'
import { calculateHoursWorked, formattedDate } from '@/utils/helperFunctions'
import EvvFilters from '../completed-shifts/EvvFilter'
import MoreVertIcon from '@mui/icons-material/MoreVert'

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
      id: 'caregiverName',
      label: 'CAREGIVER NAME',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => (
        <Typography color='primary'>{`${user?.caregiver?.firstName} ${user?.caregiver?.lastName}`}</Typography>
      )
    },
    {
      id: 'clientName',
      label: 'CLIENT NAME',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => (
        <Typography color='primary'>{`${user?.client?.firstName} ${user?.client?.lastName}`}</Typography>
      )
    },
    {
      id: 'pro',
      label: 'PRO & MOD',
      minWidth: 200,
      editable: false,
      sortable: true,
      render: (user: any) => <Typography color='primary'>{user?.client?.authService[0]?.procedureAndModifier}</Typography>
    },
    {
      id: 'totalHrs',
      label: 'LOG-IN DURATION',
      minWidth: 200,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Typography color='primary'>{calculateHoursWorked(user?.clockIn, user?.clockOut)}</Typography>
      )
    },
    {
      id: 'actions',
      label: 'ACTION',
      editable: false,
      minWidth: 200,
      render: (user: any) => (
        <IconButton onClick={() => console.log('clicked')}>
          <MoreVertIcon />
        </IconButton>
      )
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

export default EvvMissedShiftsTable

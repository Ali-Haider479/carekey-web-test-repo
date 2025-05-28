'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Card from '@mui/material/Card'
import { CircularProgress, IconButton, Typography } from '@mui/material'
import ReactTable from '@/@core/components/mui/ReactTable'
import { calculateHoursWorked, formattedDate } from '@/utils/helperFunctions'
import EvvFilters from '../completed-shifts/EvvFilter'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import MissedShiftFilters from './MissedShiftFilters'

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
  onFilterApplied: (filteredData: TimeLogData[]) => void // Callback to send filtered data to parent
}

const EvvMissedShiftsTable = ({ timeLogData, isLoading, onFilterApplied }: Props) => {
  const [filteredData, setFilteredData] = useState<TimeLogData[]>([])

  useEffect(() => {
    setFilteredData(timeLogData)
  }, [timeLogData])

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
      id: 'serviceName',
      label: 'SERVICE NAME',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => <Typography color='primary'>{user?.serviceName}</Typography>
    },
    {
      id: 'clockIn',
      label: 'SERVICE DATE',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => <Typography color='primary'>{formattedDate(user?.clockIn)}</Typography>
    },
    {
      id: 'pro',
      label: 'PRO & MOD',
      minWidth: 200,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Typography color='primary'>{user?.client?.serviceAuth?.[0]?.procedureCode || 'N/A'}</Typography>
      )
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

  const handleFilteredData = (status: any) => {
    setFilteredData(status)
  }

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      <div className='p-4 my-2'>
        <MissedShiftFilters missedShifts={timeLogData} onFilterApplied={handleFilteredData} />
      </div>
      {isLoading ? (
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      ) : (
        <ReactTable
          columns={columns}
          data={filteredData}
          keyExtractor={user => user.id.toString()}
          enableRowSelect
          enablePagination
          pageSize={25}
          stickyHeader
          maxHeight={600}
          containerStyle={{ borderRadius: 2 }}
        />
      )}
    </Card>
  )
}

export default EvvMissedShiftsTable

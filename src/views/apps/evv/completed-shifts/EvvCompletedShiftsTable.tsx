'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Card from '@mui/material/Card'
import { Chip, CircularProgress, Typography, useTheme } from '@mui/material'
import ReactTable from '@/@core/components/mui/ReactTable'
import { calculateHoursWorked, formattedDate } from '@/utils/helperFunctions'
import EvvFilters from './EvvFilter'
import { useSettings } from '@/@core/hooks/useSettings'

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
  const [filteredData, setFilteredData] = useState<TimeLogData[]>([])
  const [isFilterApplied, setIsFilterApplied] = useState(false) // Track if filter is applied

  const theme = useTheme()

  useEffect(() => {
    setFilteredData(timeLogData)
  }, [timeLogData])

  const handleFilteredData = (status: any) => {
    setFilteredData(status)
    setIsFilterApplied(true) // Set flag when filter is applied
  }

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
      id: 'serviceName',
      label: 'SERVICE TYPE',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: (user: any) => (
        <Typography color='primary'>
          {user?.clientService?.service?.name || user?.clientService?.serviceAuthService?.name}
        </Typography>
      )
    },
    {
      id: 'evv',
      label: 'EVV',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: (user: any) => (
        <Chip
          variant='tonal'
          label={user?.checkedActivity?.activities?.[0]?.service?.evv ? 'YES' : 'NO'}
          size='small'
          sx={{
            backgroundColor: user?.checkedActivity?.activities?.[0]?.service?.evv
              ? theme.palette.mode === 'light'
                ? theme.palette.success.lightOpacity
                : theme.palette.success.lighterOpacity
              : theme.palette.mode === 'light'
                ? theme.palette.error.lightOpacity
                : theme.palette.error.lighterOpacity,
            color: user?.checkedActivity?.activities?.[0]?.service?.evv
              ? theme.palette.mode === 'light'
                ? theme.palette.success.main
                : theme.palette.success.dark
              : theme.palette.mode === 'light'
                ? theme.palette.error.main
                : theme.palette.error.dark,
            borderRadius: '16px',
            fontWeight: '600'
          }}
        />
      )
    },
    {
      id: 'pro',
      label: 'PRO & MOD',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Typography color='primary'>{`${user?.client?.authService?.[0]?.procedureCode ?? ''}${user?.client?.authService?.[0]?.modifierCode ? '-' : ''}${user?.client?.authService?.[0]?.modifierCode ?? ''}`}</Typography>
      )
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
    }
  ]

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      <div className='p-4 my-2'>
        <EvvFilters onFilterApplied={handleFilteredData} />
      </div>
      {isLoading ? (
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      ) : (
        <ReactTable
          columns={columns}
          data={isFilterApplied ? filteredData : timeLogData} // Conditional data prop
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

export default EvvCompletedShiftsTable

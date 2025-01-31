'use client'
// React Imports
import { useState } from 'react'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
// Third-party Imports
import { Button, Typography } from '@mui/material'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams } from 'next/navigation'
import DataTable from '@/@core/components/mui/DataTable'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

// Type Definitions
type User = {
  id: number
  clientName: string
  clientEmail: string
  proMod: string
  start: string
  end: string
  status: 'ACTIVE' | 'EXPIRED'
  assignedHours: number
  client: any
  caregiver: any
  avatar: string
}

const newCols: GridColDef[] = [
  { field: 'id', headerName: 'ID', flex: 0.5 },
  {
    field: 'firstName',
    headerName: 'CLIENT NAME',
    flex: 1.5,
    renderCell: (params: GridRenderCellParams) => (
      console.log('PARAMS', params),
      (
        <div style={{ height: '50px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}>
          <Avatar alt={params.row.status} src={params.row.avatar} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong className='h-4'>{params.row.client.firstName}</strong>
            <span style={{ fontSize: '12px', color: '#757575' }}>{params.row.client.emergencyEmailId}</span>
          </div>
        </div>
      )
    )
  },
  {
    field: 'proMod',
    headerName: 'PRO & MOD',
    flex: 1,
    renderCell: (params: any) => {
      return <Typography className='font-normal text-base my-3'>N/A</Typography>
    }
  },
  {
    field: 'start',
    headerName: 'Start Date',
    flex: 0.75,
    renderCell: (params: any) => {
      const startDate = params?.row?.start
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
    field: 'end',
    headerName: 'End Date',
    flex: 0.75,
    renderCell: (params: any) => {
      const startDate = params?.row?.end
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
    field: 'status',
    headerName: 'Status',
    flex: 0.75,
    renderCell: (params: GridRenderCellParams) => (
      <Chip
        label={params.value.includes('pending') ? 'PENDING' : 'WAITING'}
        size='small'
        sx={{
          color: params.value === 'pending' ? '#4CAF50' : '#F44336',
          backgroundColor: params.value === 'ACTIVE' ? '#E8F5E9' : '#FFEBEE',
          fontWeight: 'bold'
        }}
      />
    )
  },
  {
    field: 'assignedHours',
    headerName: 'Total Unit',
    flex: 0.75
  }
]

const ScheduleListTable = ({ events }: any) => {
  const { lang: locale } = useParams()

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      <CardHeader
        title=''
        action={
          <Button
            variant='contained'
            className='max-sm:is-full'
            sx={{ backgroundColor: '#4B0082' }}
            href={getLocalizedUrl('/apps/schedules/calendar-view', locale as Locale)}
          >
            CALENDAR
          </Button>
        }
      />
      <div style={{ overflowX: 'auto', padding: '0px' }}>
        <DataTable data={events.events} columns={newCols} />
      </div>
    </Card>
  )
}

export default ScheduleListTable

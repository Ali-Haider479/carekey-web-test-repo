'use client'

import { useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { CircularProgress, Typography } from '@mui/material'
import { calculateHoursWorked } from '@/utils/helperFunctions'
import ReactTable from '@/@core/components/mui/ReactTable'
import AdUnitsIcon from '@mui/icons-material/AdUnits'
import { dark } from '@mui/material/styles/createPalette'

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

  const columns = [
    {
      id: 'clientName',
      label: 'CLIENT NAME',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Typography className={`${dark ? 'text-[#8082FF]' : 'text-[#4B0082]'}`} color='primary'>
          {`${user?.client?.firstName} ${user?.client?.lastName}`}
        </Typography>
      )
    },
    {
      id: 'caregiverName',
      label: 'CAREGIVER NAME',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Typography
          color='primary'
          className='text-[#67C932]'
        >{`${user?.caregiver?.firstName} ${user?.caregiver?.lastName}`}</Typography>
      )
    },

    {
      id: 'serviceName',
      label: 'SERVICE TAKEN',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => <Typography color='primary'>{user?.serviceName}</Typography>
    },
    {
      id: 'dateOfService',
      label: 'DATE',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        const startDate = user?.dateOfService
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
      id: 'timeDuration',
      label: 'HRS WORKED',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        try {
          const hoursWorked = calculateHoursWorked(user?.clockIn, user?.clockOut)

          return <Typography className='font-normal text-base my-3'>{hoursWorked} Hrs</Typography>
        } catch (error) {
          console.error('Error calculating hours worked:', error)
          return <span>N/A</span>
        }
      }
    },
    {
      id: 'logsVia',
      label: 'LOGGED VIA',
      minWidth: 170,
      render: (params: any) => <AdUnitsIcon className='my-3 text-[#8082FF]' />
    },
    {
      id: 'tsApprovalStatus',
      label: 'APPROVED LOC',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: (user: any) => (
        <Typography
          color='primary'
          className={`${
            user?.tsApprovalStatus === 'Approved'
              ? 'text-[#71DD37]'
              : user?.tsApprovalStatus === 'Rejected'
                ? 'text-[#FF4C51]'
                : 'text-[#FFAB00]'
          }`}
        >
          {user?.tsApprovalStatus || 'Pending'}
        </Typography>
      )
    },

    {
      id: 'signatureStatus',
      label: 'SIGNATURE STATUS',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: (user: any) => (
        <Typography
          color='primary'
          className={`${
            user?.signature?.signatureStatus === 'Taken'
              ? 'text-[#71DD37]'
              : user?.signature?.signatureStatus === 'Missed'
                ? 'text-[#FF4C51]'
                : 'text-[#FFAB00]'
          }`}
        >
          {user?.signature?.signatureStatus || 'Pending'}
        </Typography>
      )
    }
    // {
    //   id: 'actions',
    //   label: 'ACTION',
    //   editable: false,
    //   render: (user: any) => (
    //     <ActionButton
    //       handleEdit={handleEdit}
    //       handleSave={handleSave}
    //       handleActionClick={handleActionClick}
    //       handleCloseMenu={handleCloseMenu}
    //       handleCancelEdit={handleCancelEdit}
    //       isEditing={editingId !== null}
    //       user={user}
    //       selectedUser={selectedUser}
    //       anchorEl={anchorEl}
    //     />
    //   )
    // }
  ]

  if (isLoading) {
    return (
      <Card>
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      </Card>
    )
  }

  console.log('DATA SINATURE STATUS TABLE', data)
  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      <CardHeader title='Signatures Status' className='pb-4' />
      <div style={{ overflowX: 'auto', padding: '0px' }}>
        <ReactTable
          columns={columns}
          data={data}
          keyExtractor={user => user.id.toString()}
          enableRowSelect
          enablePagination
          pageSize={5}
          stickyHeader
          maxHeight={600}
          containerStyle={{ borderRadius: 2 }}
        />
      </div>
    </Card>
  )
}

export default SignatureStatusTable

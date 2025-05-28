'use client'

import { useEffect, useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { Chip, CircularProgress, Tooltip, Typography } from '@mui/material'
import axios from 'axios'
import ReactTable from '@/@core/components/mui/ReactTable'
import { dark } from '@mui/material/styles/createPalette'
import { transformTimesheetDataTwo } from '@/utils/transform'
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
}

interface SignatureStatusTableProps {
  data: []
  isLoading: boolean
}

const WaitingAdminApprovalTable = ({ data, isLoading }: SignatureStatusTableProps) => {
  const [filteredData, setFilteredData] = useState<any>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const columns = [
    {
      id: 'clientName',
      label: 'CLIENT',
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
      label: 'CAREGIVER',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Typography
          color='primary'
          className='text-[#71DD37]'
        >{`${user?.caregiver?.firstName} ${user?.caregiver?.lastName}`}</Typography>
      )
    },
    {
      id: 'serviceName',
      label: 'SERVICE',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Tooltip title={user?.serviceName || ''} placement='top'>
          <Typography color='primary'>
            {user?.serviceName?.slice(0, 20) || '---'}
            {user?.serviceName?.length > 20 ? '...' : ''}
          </Typography>
        </Tooltip>
      )
    },
    {
      id: 'dateOfService',
      label: 'DATE',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        const dateOfService = user?.dateOfService

        if (dateOfService) {
          // Try to parse it as a timestamp
          const parsedDate = new Date(dateOfService)

          // Check if the parsed date is valid (not "Invalid Date")
          if (!isNaN(parsedDate.getTime())) {
            return (
              <Typography className='font-normal text-base '>
                {`${parsedDate.getMonth() + 1}/${parsedDate.getDate()}/${parsedDate.getFullYear().toString().slice(-2)}`}
              </Typography>
            )
          }

          // If it's not a valid timestamp, return the raw string as is
          return <Typography className='font-normal text-base '>{dateOfService}</Typography>
        }

        // If dateOfService is null/undefined, return N/A
        return <Typography className='font-normal text-base '>N/A</Typography>
      }
    },
    {
      id: 'signatureStatus',
      label: 'SIGNATURE STATUS',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: (user: any) => (
        <Chip
          label={user?.signature?.signatureStatus.toUpperCase() || 'PENDING'}
          sx={{
            backgroundColor:
              user?.signature?.signatureStatus === 'Taken'
                ? '#72E1281F'
                : user?.signature?.signatureStatus === 'Pending'
                  ? '#26C6F91F'
                  : '#FF4D491F',
            borderRadius: '50px',
            color:
              user?.signature?.signatureStatus === 'Taken'
                ? '#71DD37'
                : user?.signature?.signatureStatus === 'Pending'
                  ? '#03C3EC'
                  : '#FF3E1D',
            '& .MuiChip-label': {
              padding: '0 15px'
            }
          }}
        />
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

  return (
    <div style={{ overflowX: 'auto', padding: '0px' }}>
      <ReactTable
        columns={columns}
        data={data}
        keyExtractor={user => user.id.toString()}
        enableRowSelect
        enablePagination
        pageSize={25}
        stickyHeader
        maxHeight={600}
        containerStyle={{ borderRadius: 2 }}
      />
    </div>
  )
}

export default WaitingAdminApprovalTable

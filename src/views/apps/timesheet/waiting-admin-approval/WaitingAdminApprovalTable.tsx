'use client'

import { useEffect, useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { Avatar, CircularProgress, Typography } from '@mui/material'
import axios from 'axios'
import DataTable from '@/@core/components/mui/DataTable'
import { GridColDef } from '@mui/x-data-grid'
import AdUnitsIcon from '@mui/icons-material/AdUnits'
import ReactTable from '@/@core/components/mui/ReactTable'
import { dark } from '@mui/material/styles/createPalette'
import transformToExpandableFormat from '@/utils/transformExpandableData'
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

const WaitingAdminApprovalTable = () => {
  const [filteredData, setFilteredData] = useState<Signature[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  // Fetch signatures data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/signatures`)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log`)
        setFilteredData(response.data.filter((item: any) => item.clockOut != null))
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching signatures:', error)
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

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
          className='text-[#71DD37]'
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
      id: 'tsApprovalStatus',
      label: 'LOGS RECORDED',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: (user: any) => (
        <Typography
          color='primary'
          className={`${'YES' === 'YES' ? 'text-[#71DD37]' : 'NO' === 'NO' ? 'text-[#FF4C51]' : 'text-[#FFAB00]'}`}
        >
          YES
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

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      <CardHeader title='Waiting Admin Approval' className='pb-4' />
      <div style={{ overflowX: 'auto', padding: '0px' }}>
        <ReactTable
          columns={columns}
          data={filteredData}
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

export default WaitingAdminApprovalTable

'use client'

import { useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import { Box, Chip, CircularProgress, Tooltip, Typography } from '@mui/material'
import ActionButton from '@/@core/components/mui/ActionButton'
import ReactTable from '@/@core/components/mui/ReactTable'
import axios from 'axios'
import { calculateHoursWorked, formatDate, formatDateTime } from '@/utils/helperFunctions'
import { dark } from '@mui/material/styles/createPalette'
import CustomAlert from '@/@core/components/mui/Alter'
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
  tenant: any
}

interface SignatureStatusTableProps {
  data: []
  isLoading: boolean
  fetchInitialData: any
}

const ReceivedTimesheetTable = ({ data, isLoading, fetchInitialData }: SignatureStatusTableProps) => {
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [editedValues, setEditedValues] = useState<{ [key: string]: any }>({})
  const [currentEditedData, setCurrentEditedData] = useState<any>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, user: any) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedUser(user)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedUser(null)
  }

  const handleEdit = (user: any) => {
    setEditingId(user.id)
    // setSelectedUser(user)
    // // Initialize edited values with current values
    // setEditedValues({
    //   ...user,
    //   id: user.id // Ensure we keep the id
    // })
    // handleCloseMenu()
  }

  const handleSave = async (user: any) => {
    console.log('USER TWO', currentEditedData)
    console.log('USER ONE', data)

    // Function to find user in main array or subRows
    const findUser = (data: any[], targetId: number | string): any => {
      // First check main level
      let currentUser = data.find((item: any) => item.id === targetId)

      if (currentUser) {
        return currentUser
      }

      // If not found in main level, search in subRows
      for (const item of data) {
        if (item.subRows && Array.isArray(item.subRows)) {
          currentUser = item.subRows.find((subItem: any) => subItem.id === targetId)
          if (currentUser) {
            return currentUser
          }
        }
      }

      return null
    }

    const currentUser = findUser(data, currentEditedData.id)
    console.log('USER THREE', currentUser)

    // If user not found, handle the error
    if (!currentUser) {
      setAlertOpen(true)
      setAlertProps({
        message: 'User not found in the data.',
        severity: 'error'
      })
      return
    }

    // Check if signatureStatus is Pending
    if (currentUser?.signature?.signatureStatus === 'Pending') {
      console.log('INSIDE IF SP')
      setAlertOpen(true)
      setAlertProps({
        message: 'Please approve the signature before editing.',
        severity: 'error'
      })
      return
    }

    // Check if serviceAuth exists
    if (currentUser?.client?.serviceAuth?.length === 0) {
      console.log('INSIDE IF SA')
      setAlertOpen(true)
      setAlertProps({
        message: 'Please complete the service authorization before editing.',
        severity: 'error'
      })
      return
    }

    try {
      // Reset states
      const payload = {
        id: currentEditedData.id,
        tsApprovalStatus: currentEditedData.tsApprovalStatus
        // clockIn: currentEditedData.clockIn,
        // clockOut: currentEditedData.clockOut
      }
      console.log('PAYLOAD UPDATE TS', payload)
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/time-log/update-ts-approval`, payload)

      if (currentEditedData.tsApprovalStatus === 'Approved') {
        console.log('CURRENT EDITED DATA ONE', currentEditedData)
        const hrs = calculateHoursWorked(currentUser?.clockIn, currentUser?.clockOut)
        const billedAmount = parseFloat(hrs) * currentUser?.client?.serviceAuth[0]?.serviceRate

        const billingPayload = {
          timeLogId: currentUser.id,
          claimDate: null,
          billedAmount: Number(billedAmount.toFixed(2)),
          receivedAmount: 0,
          claimStatus: 'Pending',
          billedStatus: 'Pending'
        }
        console.log('BILLING PP ONE', billingPayload)
        const createBilling = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/time-log/billing`, billingPayload)
        console.log('createBilling', createBilling)
      } else if (
        currentEditedData.tsApprovalStatus === 'Rejected' ||
        currentEditedData.tsApprovalStatus === 'Pending'
      ) {
        console.log('Timesheet is Rejected ONE')
      }

      await fetchInitialData()
      setEditingId(null)
      setSelectedUser(null)
      setEditedValues({})
    } catch (error) {
      console.error('Error saving data', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setSelectedUser(null)
    // setEditedValues({})
  }

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
      id: 'activities',
      label: 'ACTIVITIES',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Tooltip title={user?.activities || ''} placement='top'>
          <Typography color='primary'>
            {user?.activities?.slice(0, 20) || '---'}
            {user?.activities?.length > 20 ? '...' : ''}
          </Typography>
        </Tooltip>
      )
    },
    {
      id: 'clockInOut',
      label: 'CLOCK IN / OUT',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) =>
        !user.clockIn || !user.clockOut ? (
          <Typography color='primary'>---</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography color='primary' variant='body2'>
              <strong>In:</strong> {user?.clockIn?.length > 0 ? formatDateTime(user.clockIn) : '---'}
            </Typography>
            <Typography color='primary' variant='body2'>
              <strong>Out:</strong> {user?.clockOut?.length > 0 ? formatDateTime(user.clockOut) : '---'}
            </Typography>
          </Box>
        )
    },
    {
      id: 'timeDuration',
      label: 'HRS WORKED',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        if (!user?.clockIn || !user?.clockOut) {
          return <Typography className='font-normal text-base my-3'>{user?.hrsWorked} Hrs</Typography>
        } else {
          const hoursWorked = calculateHoursWorked(user?.clockIn, user?.clockOut)
          return <Typography className='font-normal text-base my-3'>{hoursWorked} Hrs</Typography>
        }
      }
    },
    {
      id: 'notes',
      label: 'NOTES',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: (user: any) => (
        <Tooltip title={user?.notes || ''} placement='top'>
          <Typography color='primary'>
            {user?.notes?.slice(0, 20) || '---'}
            {user?.notes?.length > 20 ? '...' : ''}
          </Typography>
        </Tooltip>
      )
    },
    {
      id: 'dateOfService',
      label: 'DATE OF SERVICE',
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
            return <Typography className='font-normal text-base my-3'>{formatDate(user.dateOfService)}</Typography>
          }

          // If it's not a valid timestamp, return the raw string as is
          return <Typography className='font-normal text-base my-3'>{dateOfService}</Typography>
        }

        // If dateOfService is null/undefined, return N/A
        return <Typography className='font-normal text-base my-3'>N/A</Typography>
      }
    },
    {
      id: 'tsApprovalStatus',
      label: 'STATUS',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: (user: any) => (
        <Chip
          label={user?.tsApprovalStatus.toUpperCase() || 'PENDING'}
          sx={{
            backgroundColor: user?.tsApprovalStatus === 'Approved' ? '#72E1281F' : '#FDB5281F',
            borderRadius: '50px',
            color: user?.tsApprovalStatus === 'Approved' ? '#71DD37' : '#FFAB00',
            '& .MuiChip-label': {
              padding: '0 10px'
            }
          }}
        />
      )
    },
    {
      id: 'actions',
      label: 'ACTION',
      editable: false,
      render: (user: any) => (
        <ActionButton
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleActionClick={handleActionClick}
          handleCloseMenu={handleCloseMenu}
          handleCancelEdit={handleCancelEdit}
          isEditing={editingId !== null}
          user={user}
          selectedUser={selectedUser}
          anchorEl={anchorEl}
          disabled={!!user.subRows && user.subRows.length > 0}
        />
      )
    }
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

  const handleEditChange = (updatedRow: any) => {
    setCurrentEditedData(updatedRow)
  }

  // Assuming your first file data is in originalTimeEntries
  // const transformedData = transformTimesheetData(data)
  // console.log('Date timesheet,data', transformedData)
  console.log('DATE AFTER SUBROWS', data)
  return (
    <>
      {/* <CardHeader title='Received Timesheet' className='pb-4' /> */}
      <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />

      <div style={{ overflowX: 'auto', padding: '0px' }}>
        <ReactTable
          columns={columns}
          data={data}
          keyExtractor={user => user.id.toString()}
          enableRowSelect
          stickyHeader
          maxHeight={600}
          containerStyle={{ borderRadius: 2 }}
          editingId={editingId}
          onSave={handleSave}
          onEditChange={handleEditChange}
        />
      </div>
    </>
  )
}

export default ReceivedTimesheetTable

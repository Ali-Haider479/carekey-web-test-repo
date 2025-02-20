'use client'

import { useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { Alert, CircularProgress, IconButton, Typography } from '@mui/material'
import DataTable from '@/@core/components/mui/DataTable'
import { GridColDef } from '@mui/x-data-grid'
import LaunchIcon from '@mui/icons-material/Launch'
import ActionButton from '@/@core/components/mui/ActionButton'
import ReactTable from '@/@core/components/mui/ReactTable'
import axios from 'axios'
import transformToExpandableFormat from '@/utils/transformExpandableData'
import { transformTimesheetData } from '@/utils/transform'
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

    const currentUser: any = data.find((item: any) => item.id === currentEditedData.id)
    console.log('USER THREE', currentUser)

    // Check if signatureStatus is Pending
    if (currentUser.signature.signatureStatus === 'Pending') {
      setAlertOpen(true)
      setAlertProps({
        message: 'Please approve the signature before editing.',
        severity: 'error'
      })
      return
    }

    // Check if serviceAuth exists
    if (currentUser.client.serviceAuth.length === 0) {
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
        tsApprovalStatus: currentEditedData.tsApprovalStatus,
        clockIn: currentEditedData.clockIn,
        clockOut: currentEditedData.clockOut
      }

      const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/time-log/update-ts-approval`, payload)
      if (currentEditedData.tsApprovalStatus === 'Approved') {
        // const { data: timeLog } = await axios.get(
        //   `${process.env.NEXT_PUBLIC_API_URL}/time-log/ts-approved/${res.data.id}`
        // )
        // const timeLogForPayload = timeLog[0]
        // console.log('timeLogForPayload', timeLog)
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
        const createBilling = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/time-log/billing`, billingPayload)
        console.log('createBilling', createBilling)
      } else if (
        currentEditedData.tsApprovalStatus === 'Rejected' ||
        currentEditedData.tsApprovalStatus === 'Pending'
      ) {
        console.log('Timesheet is Rejected')
      }
      await fetchInitialData()
      setEditingId(null)
      setSelectedUser(null)
      setEditedValues({})

      // Optionally refresh the whole data
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
      label: 'SERVICE',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => <Typography color='primary'>{user?.serviceName}</Typography>
    },
    {
      id: 'clockIn',
      label: 'CLOCK IN',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: (user: any) => <Typography color='primary'>{formatDateTime(user?.clockIn)}</Typography>
    },
    {
      id: 'clockOut',
      label: 'CLOCK OUT',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: (user: any) => <Typography color='primary'>{formatDateTime(user?.clockOut)}</Typography>
    },
    {
      id: 'payPeriod',
      label: 'PAY PERIOD',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        const startDate = user?.payPeriodHistory?.startDate
        if (startDate) {
          const date = new Date(startDate)
          return <Typography className='font-normal text-base my-3'>{formatDate(user.dateOfService)}</Typography>
        }
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
    // {
    //   id: 'timesheet',
    //   label: 'TIMESHEET',
    //   editable: false,
    //   render: (user: any) => (
    //     <IconButton onClick={() => console.log(user)}>
    //       <LaunchIcon />
    //     </IconButton>
    //   )
    // },
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

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      <CardHeader title='Received Timesheet' className='pb-4' />
      <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />

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
          editingId={editingId}
          onSave={handleSave}
          onEditChange={handleEditChange}
        />
      </div>
    </Card>
  )
}

export default ReceivedTimesheetTable

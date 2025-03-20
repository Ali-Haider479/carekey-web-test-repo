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
  const [selectedRows, setSelectedRows] = useState<any[]>([])
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

  const handleSave = async () => {
    const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
    const userId = authUser?.id
    const findUser = (data: any[], targetId: string | number): { user: any; isDummyRow: boolean } => {
      let currentUser = data.find((item: any) => item.id === targetId)
      if (currentUser) {
        return { user: currentUser, isDummyRow: !!currentUser.subRows }
      }

      for (const item of data) {
        if (item.subRows && Array.isArray(item.subRows)) {
          currentUser = item.subRows.find((subItem: any) => subItem.id === targetId)
          if (currentUser) {
            return { user: currentUser, isDummyRow: false }
          }
        }
      }
      return { user: null, isDummyRow: false }
    }

    const { user: currentUser, isDummyRow } = findUser(data, currentEditedData.id)

    if (!currentUser) {
      setAlertOpen(true)
      setAlertProps({
        message: 'User not found in the data.',
        severity: 'error'
      })
      handleCancelEdit()
      return
    }

    if (currentUser?.signature?.signatureStatus === 'Pending' || currentUser?.client?.serviceAuth?.length === 0) {
      setAlertOpen(true)
      setAlertProps({
        message:
          currentUser?.signature?.signatureStatus === 'Pending'
            ? 'Please approve the signature before editing.'
            : 'Please complete the service authorization before editing.',
        severity: 'error'
      })
      handleCancelEdit()
      return
    }

    if (currentUser?.billing && Object.keys(currentUser.billing).length > 0) {
      if (currentUser?.billing?.claimStatus?.includes('Approved')) {
        setAlertOpen(true)
        if (currentUser?.subRows?.length > 0 && currentUser?.billing?.dummyRow) {
          setAlertProps({
            message: 'Please update timelogs manually.',
            severity: 'error'
          })
          handleCancelEdit()
        } else {
          setAlertProps({
            message: 'Cannot update timelog because billing has already been approved.',
            severity: 'error'
          })
        }
        return
      }
    }

    try {
      const basePayload = {
        tsApprovalStatus: currentEditedData.tsApprovalStatus,
        userId
      }

      let updatePromises: Promise<any>[] = []
      let rowsToUpdate: any[] = []

      if (isDummyRow) {
        const selectedSubRowIds = selectedRows
          .filter(
            row => row.id !== currentEditedData.id && currentUser.subRows.some((subRow: any) => subRow.id === row.id)
          )
          .map(row => row.id)

        if (selectedSubRowIds.length === 0) {
          setAlertOpen(true)
          setAlertProps({
            message: 'Please select at least one sub-row to update.',
            severity: 'warning'
          })
          return
        }

        rowsToUpdate = currentUser.subRows.filter((subRow: any) => selectedSubRowIds.includes(subRow.id))

        const subRowUpdates = rowsToUpdate.map((subRow: any) => ({
          id: subRow.id,
          ...basePayload
        }))

        updatePromises = subRowUpdates.map((payload: any) =>
          axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/time-log/update-ts-approval`, payload)
        )
      } else {
        rowsToUpdate = [currentUser]
        updatePromises.push(
          axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/time-log/update-ts-approval`, {
            id: currentEditedData.id,
            ...basePayload
          })
        )
      }

      const updateResponses = await Promise.all(updatePromises)

      // Handle billing creation or removal based on tsApprovalStatus
      if (currentEditedData.tsApprovalStatus === 'Approved') {
        const billingPromises = []

        for (const row of rowsToUpdate) {
          const hrs = calculateHoursWorked(row.clockIn, row.clockOut)
          const billedAmount = parseFloat(hrs) * row.client.serviceAuth[0].serviceRate

          billingPromises.push(
            axios.post(`${process.env.NEXT_PUBLIC_API_URL}/time-log/billing`, {
              timeLogId: row.id,
              claimDate: null,
              billedAmount: Number(billedAmount.toFixed(2)),
              receivedAmount: 0,
              claimStatus: 'Pending',
              billedStatus: 'Pending'
            })
          )
        }

        const billingResponses = await Promise.all(billingPromises)
      } else {
        // } else if (currentUser?.billing?.id) {
        const billingDeletePromises = []

        // Delete billing for all updated rows that have billing
        for (const row of rowsToUpdate) {
          if (row?.billing?.id) {
            billingDeletePromises.push(
              axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/time-log/remove-billing/${row.billing.id}`)
            )
          }
        }

        if (billingDeletePromises.length > 0) {
          const billingDeleteResponses = await Promise.all(billingDeletePromises)
          console.log('INSIDE CALL Billing delete responses:', billingDeleteResponses)
        } else {
          console.log('INSIDE CALL NO BILLING TO DELETE')
        }
      }

      await fetchInitialData()
      setEditingId(null)
      setSelectedUser(null)
      setEditedValues({})
    } catch (error) {
      console.error('Error saving data', error)
      setAlertOpen(true)
      setAlertProps({
        message: 'Failed to save changes. Please try again.',
        severity: 'error'
      })
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
      id: 'timeDuration',
      label: 'HRS WORKED',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        if (!user?.clockIn || !user?.clockOut) {
          return <Typography className='font-normal text-base '>{user?.hrsWorked} Hrs</Typography>
        } else {
          const hoursWorked = calculateHoursWorked(user?.clockIn, user?.clockOut)
          return <Typography className='font-normal text-base '>{hoursWorked} Hrs</Typography>
        }
      }
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
            return (
              <>
                <Typography className='font-normal text-base '>
                  {new Date(user?.dateOfService).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                  })}
                </Typography>
                <Typography className='font-normal text-base '>
                  {user?.clockIn?.length > 0
                    ? `In: ${new Date(user?.clockIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}`
                    : 'In: ---'}
                </Typography>
              </>
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
      id: 'updatedBy',
      label: 'UPDATED BY',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        if (!user?.updatedBy || !user?.updatedAt) {
          return <Typography className='font-normal text-base'>---</Typography>
        } else {
          console.log('OYE JANI', user)
          return (
            <>
              <Typography className='font-normal text-base'>{user?.updatedBy?.userName || 'N/A'}</Typography>
              <Typography className='font-normal text-base'>
                {new Date(user?.updatedAt).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric'
                })}
              </Typography>
            </>
          )
        }
      }
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
          // disabled={!!user.subRows && user.subRows.length > 0}
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

  const handleSelect = (selectedRowsData: any) => {
    setSelectedRows(selectedRowsData)
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
          onSelectionChange={handleSelect}
        />
      </div>
    </>
  )
}

export default ReceivedTimesheetTable

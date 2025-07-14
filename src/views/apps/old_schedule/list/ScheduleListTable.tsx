'use client'
// React Imports
import { MouseEvent, useEffect, useState } from 'react'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
// Third-party Imports
import { Button, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams, useRouter } from 'next/navigation'
import DataTable from '@/@core/components/mui/DataTable'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import { Delete } from '@mui/icons-material'
import axios from 'axios'
import api from '@/utils/api'
import ReactTable from '@/@core/components/mui/ReactTable'
import CustomAlert from '@/@core/components/mui/Alter'

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

interface Column {
  id: string
  label: string
  minWidth: number
  render: (item: any) => JSX.Element
}

const ScheduleListTable = ({ events }: { events: any[] }) => {
  const { lang: locale } = useParams()
  // const [data, setData] = useState<any[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()
  const [scheduleData, setScheduleData] = useState<any>()
  const [isDeleted, setIsDeleted] = useState<boolean>(false)

  const router = useRouter()

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, rowId: number) => {
    setAnchorEl(event.currentTarget)
    setSelectedRowId(rowId)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedRowId(null)
  }
  // useEffect(() => {
  //   setData(events.events)
  // }, [events.events])
  // console.log(events)

  const newCols: Column[] = [
    {
      id: 'clientName',
      label: 'CLIENT NAME',
      minWidth: 170,
      render: item => (
        <div style={{ height: '50px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}>
          {/* <Avatar alt={item?.status} src={item?.avatar} /> */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong className='h-4 text-md text-[#4B0082]'>
              {item?.client?.firstName} {item?.client?.lastName}
            </strong>
            <span style={{ fontSize: '12px', color: '#757575' }}>{item?.client?.emergencyEmailId}</span>
          </div>
        </div>
      )
    },
    {
      id: 'caregiverName',
      label: 'CAREGIVER NAME',
      minWidth: 170,
      render: item => (
        <div style={{ height: '50px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}>
          {/* <Avatar alt={item?.status} src={item?.avatar} /> */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong className='h-4 text-[#03C3EC]'>
              {item?.caregiver?.firstName} {item?.caregiver?.lastName}
            </strong>
            <span style={{ fontSize: '12px', color: '#757575' }}>{item?.caregiver?.user?.emailAddress}</span>
          </div>
        </div>
      )
    },
    {
      id: 'serviceName',
      label: 'SERVICE',
      minWidth: 170,
      render: item => {
        return <Typography className='font-normal text-base my-3'>{item?.service?.name}</Typography>
      }
    },
    {
      id: 'location',
      label: 'LOCATION',
      minWidth: 170,
      render: item => {
        return <Typography className='font-normal text-base my-3'>{item?.location ? item?.location : 'N/A'}</Typography>
      }
    },
    {
      id: 'start',
      label: 'Start Date',
      minWidth: 170,
      render: (item: any) => {
        const startDate = item?.start
        if (startDate) {
          const date = new Date(startDate)
          return (
            <Typography className='font-normal text-base my-3'>
              {`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`}
            </Typography>
          )
        } else {
          return <Typography className='font-normal text-base my-3'>N/A</Typography>
        }
      }
    },
    {
      id: 'end',
      label: 'End Date',
      minWidth: 170,
      render: (item: any) => {
        const startDate = item?.end
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
      id: 'status',
      label: 'Status',
      minWidth: 170,
      render: (item: any) => (
        <Chip
          label={item?.status?.includes('pending') ? 'PENDING' : 'WAITING'}
          size='small'
          sx={{
            color: item?.status === 'pending' ? '#4CAF50' : '#F44336',
            backgroundColor: item?.status === 'pending' ? '#E8F5E9' : '#FFEBEE',
            fontWeight: 'bold'
          }}
        />
      )
    },
    {
      id: 'assignedHours',
      label: 'ASSIGNED HOURS',
      minWidth: 170,
      render: (item: any) => (
        <Typography className='font-normal text-base my-3'>{item?.assignedHours || 'N/A'}</Typography>
      )
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 170,
      render: (item: any) => (
        <>
          <IconButton onClick={event => handleActionClick(event, item?.id)} size='small'>
            <MoreVertIcon />
          </IconButton>

          <Menu open={selectedRowId === item?.id && Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleCloseMenu}>
            {/* <MenuItem onClick={() => {}}>
                <EditIcon fontSize='small' sx={{ mr: 1 }} />
                Edit
              </MenuItem> */}
            <MenuItem onClick={() => handleDeleteSchedule(item?.id)}>
              <Delete className='text-red-500' fontSize='small' sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>
        </>
      )
    }
  ]

  const transformedData =
    events?.map((event: any) => ({
      id: event.id,
      firstName: event.client?.firstName || 'N/A',
      client: event.client,
      caregiver: event.caregiver,
      service: event.service,
      location: event.location,
      status: event.status,
      assignedHours: event.assignedHours,
      start: event.start,
      end: event.end,
      proMod: 'N/A', // Add default value if necessary
      avatar: event.client?.profileImgUrl || ''
    })) || []

  const handleDeleteSchedule = async (id: string) => {
    console.log('handleDeleteSchedule Clicked', id)
    try {
      const deletionRes = await api.delete(`/schedule/${id}`)
      if (deletionRes) {
        const updatedData = events.filter((item: any) => item.id !== id)
        // setData(updatedData)
        setIsDeleted(true)
        setScheduleData(updatedData)
      }
      setAlertOpen(true)
      setAlertProps({
        message: 'Schedule entry deleted successfully.',
        severity: 'success'
      })
    } catch (error) {
      console.log(`Error deleting schedule with ID ${id}`, error)
      setAlertOpen(true)
      setAlertProps({
        message: 'An unexpected error occured while deleting schedule entry.',
        severity: 'error'
      })
    } finally {
      handleCloseMenu
    }
  }

  return (
    <>
      <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
      <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
        <CardHeader
          title=''
          action={
            <Button
              variant='contained'
              className='max-sm:is-full'
              sx={{ backgroundColor: '#4B0082' }}
              // href={getLocalizedUrl('/en/apps/schedules/calendar-view', locale as Locale)}
              onClick={() => {
                router.replace('/en/apps/schedules/calendar-view')
              }}
            >
              CALENDAR
            </Button>
          }
        />
        <div style={{ overflowX: 'auto', padding: '0px' }}>
          <ReactTable
            data={isDeleted === true ? scheduleData : transformedData}
            columns={newCols}
            keyExtractor={user => user.id.toString()}
            // enableRowSelect
            enablePagination
            pageSize={25}
            stickyHeader
            maxHeight={600}
            containerStyle={{ borderRadius: 2 }}
          />
        </div>
      </Card>
    </>
  )
}

export default ScheduleListTable

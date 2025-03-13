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
import { useParams } from 'next/navigation'
import DataTable from '@/@core/components/mui/DataTable'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import { Delete } from '@mui/icons-material'
import axios from 'axios'

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

const ScheduleListTable = ({ events }: { events: any[] }) => {
  const { lang: locale } = useParams()
  // const [data, setData] = useState<any[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, rowId: number) => {
    setAnchorEl(event.currentTarget)
    setSelectedRowId(rowId)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedRowId(null)
  }

  console.log('Calender data', events)

  // useEffect(() => {
  //   setData(events.events)
  // }, [events.events])
  // console.log(events)

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
              <strong className='h-4'>{params.row.client?.firstName}</strong>
              <span style={{ fontSize: '12px', color: '#757575' }}>{params.row?.client?.emergencyEmailId}</span>
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
          label={params?.value?.includes('pending') ? 'PENDING' : 'WAITING'}
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
    },
    {
      field: 'actions',
      headerName: 'ACTION',
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton onClick={event => handleActionClick(event, params.row.id)} size='small'>
            <MoreVertIcon />
          </IconButton>

          <Menu
            open={selectedRowId === params.row.id && Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleCloseMenu}
          >
            {/* <MenuItem onClick={() => {}}>
                <EditIcon fontSize='small' sx={{ mr: 1 }} />
                Edit
              </MenuItem> */}
            <MenuItem onClick={() => handleDeleteSchedule(params.row.id)}>
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
      const deletionRes = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/schedule/${id}`)
      if (deletionRes) {
        const updatedData = events.filter((item: any) => item.id !== id)
        // setData(updatedData)
      }
    } catch (error) {
      console.log(`Error deleting schedule with ID ${id}`, error)
    } finally {
      handleCloseMenu
    }
  }

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
        <DataTable data={transformedData} columns={newCols} />
      </div>
    </Card>
  )
}

export default ScheduleListTable

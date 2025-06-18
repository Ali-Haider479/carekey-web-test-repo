'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
// Third-party Imports
import axios from 'axios'

// CSS Module Imports
import { useParams, useRouter } from 'next/navigation'
import { GridColDef } from '@mui/x-data-grid'
import DataTable from '@/@core/components/mui/DataTable'
import { Chip, CircularProgress, Typography } from '@mui/material'
import AdUnitsIcon from '@mui/icons-material/AdUnits'
import { calculateHoursWorked } from '@/utils/helperFunctions'
import api from '@/utils/api'
import ReactTable from '@/@core/components/mui/ReactTable'

interface Column {
  id: string
  label: string
  minWidth: number
  render: (item: any) => JSX.Element
}

const TimeLogTable = () => {
  const { id } = useParams()
  // State
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchTimeLog = async () => {
    try {
      setLoading(true)
      const fetchedTimeLog = await api.get(`/time-log/caregiver/${id}`)
      setData(fetchedTimeLog.data)
      console.log('Caregiver Timelog Data --> ', fetchedTimeLog)
    } catch (error) {
      console.error('Error fetching data: ', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTimeLog()
  }, [])

  const newColumns: Column[] = [
    {
      id: 'id',
      label: '#',
      minWidth: 50,
      render: (item: any) => <Typography className='font-normal text-base my-3'>{item.id}</Typography>
    },
    {
      id: 'clientName',
      label: 'CLIENT NAME',
      minWidth: 170,
      render: (item: any) => (
        <Typography className='font-normal text-base my-3'>
          {item?.client?.firstName} {item?.client?.lastName}
        </Typography>
      )
    },
    {
      id: 'payPeriod',
      label: 'PAY PERIOD',
      minWidth: 170,
      render: (item: any) => {
        const startTime = item?.clockIn
        if (startTime) {
          // Parse the date string into a Date object
          const date = new Date(startTime)
          // Format the date as "14/06/2025"
          const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })

          return <Typography className='font-normal text-base my-3'>{formattedDate}</Typography>
        }

        return <Typography className='font-normal text-base my-3'>N/A</Typography>
      }
    },
    {
      id: 'clockIn',
      label: 'START TIME',
      minWidth: 170,
      render: (item: any) => {
        const startTime = item?.clockIn
        if (startTime) {
          // Parse the date string into a Date object
          const date = new Date(startTime)
          // Format the time as "03:00:08 PM"
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })
          return <Typography className='font-normal text-base my-3'>{formattedTime}</Typography>
        }

        return <Typography className='font-normal text-base my-3'>N/A</Typography>
      }
    },
    {
      id: 'clockOut',
      label: 'END TIME',
      minWidth: 170,
      render: (item: any) => {
        const endTime = item?.clockOut
        if (endTime) {
          // Parse the date string into a Date object
          const date = new Date(endTime)
          // Format the time as "03:00:08 PM"
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })
          return <Typography className='font-normal text-base my-3'>{formattedTime}</Typography>
        }

        return <Typography className='font-normal text-base my-3'>N/A</Typography>
      }
    },
    {
      id: 'hoursWorked',
      label: 'TIME DURATION',
      minWidth: 170,
      render: (item: any) => {
        try {
          const hoursWorked = calculateHoursWorked(item.clockIn, item.clockOut)

          return <Typography className='font-normal text-base my-3'>{hoursWorked} Hrs</Typography>
        } catch (error) {
          console.error('Error calculating hours worked:', error)
          return <span>N/A</span>
        }
      }
    },
    {
      id: 'manualEntry',
      label: 'MANUAL',
      minWidth: 170,
      render: item => (
        <Chip
          label={item?.manualEntry === true ? 'Yes' : 'No'}
          sx={{
            backgroundColor: item?.manualEntry === true ? '#72E1281F' : '#FDB5281F',
            borderRadius: '50px',
            color: item?.manualEntry === true ? '#71DD37' : '#FFAB00',
            '& .MuiChip-label': {
              padding: '0 10px'
            }
          }}
        />
      )
    }
  ]

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
      {loading ? (
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <ReactTable
            data={data}
            columns={newColumns}
            keyExtractor={user => user.id.toString()}
            enablePagination
            pageSize={25}
            stickyHeader
            maxHeight={600}
            containerStyle={{ borderRadius: 2 }}
          />
        </div>
      )}
    </Card>
  )
}

export default TimeLogTable

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
import { Typography } from '@mui/material'
import AdUnitsIcon from '@mui/icons-material/AdUnits'
import { calculateHoursWorked } from '@/utils/helperFunctions'

const TimeLogTable = () => {
  const { id } = useParams()
  // State
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')

  const fetchTimeLog = async () => {
    try {
      const fetchedTimeLog = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log/caregiver/${id}`)
      setData(fetchedTimeLog.data)
      console.log('Caregiver Timelog Data --> ', fetchedTimeLog)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  useEffect(() => {
    fetchTimeLog()
  }, [])


  const newColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: '#',
      flex: 0.1
    },
    {
      field: 'clientName',
      headerName: 'CLIENT NAME',
      flex: 1,
      renderCell: (params: any) => (
        <Typography className='font-normal text-base my-3'>
          {params?.row?.client?.firstName} {params?.row?.client?.lastName}
        </Typography>
      )
    },
    {
      field: 'payPeriod',
      headerName: 'DATE',
      flex: 1,
      renderCell: (params: any) => {
        const startTime = params?.row?.clockIn
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
      field: 'clockIn',
      headerName: 'START TIME',
      flex: 1,
      renderCell: (params: any) => {
        const startTime = params?.row?.clockIn
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
      field: 'clockOut',
      headerName: 'END TIME',
      flex: 1,
      renderCell: (params: any) => {
        const endTime = params?.row?.clockOut
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
      field: 'hoursWorked',
      headerName: 'TIME DURATION',
      flex: 1,
      renderCell: (params: any) => {
        try {
          const hoursWorked = calculateHoursWorked(params.row.clockIn, params.row.clockOut)

          return <Typography className='font-normal text-base my-3'>{hoursWorked} Hrs</Typography>
        } catch (error) {
          console.error('Error calculating hours worked:', error)
          return <span>N/A</span>
        }
      }
    },
    {
      field: 'logsVia',
      headerName: 'LOGGED VIA',
      flex: 1,
      renderCell: (params: any) => <AdUnitsIcon className='my-3' />
    }
  ]

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <DataTable columns={newColumns} data={data} />
      </div>
    </Card>
  )
}

export default TimeLogTable

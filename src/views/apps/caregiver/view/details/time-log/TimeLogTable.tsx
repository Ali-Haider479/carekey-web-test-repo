'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'

// CSS Module Imports
import styles from '../CaregiversTable.module.css'
import { useParams, useRouter } from 'next/navigation'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import DataTable from '@/@core/components/mui/DataTable'
import { List, ListItem } from '@mui/material'

// type AccountHistory = {
//   key: number
//   dateAndTime: string
//   admin: string
//   section: string
//   changesMade: string
// }

const TimeLogTable = () => {
  const { id } = useParams()
  // State
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')

  const fetchTimeLog = async () => {
    try {
      const fetchedTimeLog = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregiver/${id}`)
      console.log('Caregiver Timelog Data --> ', fetchedTimeLog)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  useEffect(() => {
    fetchTimeLog()
  }, [])

  const router = useRouter()

  const rowData = [
    {
      id: '1',
      client: 'Donald Degree',
      date: '04/29/2024',
      startTime: '10:30:00 AM',
      endTime: '02:18:00 PM',
      timeDuration: '3.75 Hrs',
      loggedVia: 'APP (Manual)'
    },
    {
      id: '2',
      client: 'Stancy Midth',
      date: '04/29/2024',
      startTime: '10:30:00 AM',
      endTime: '02:18:00 PM',
      timeDuration: '3.75 Hrs',
      loggedVia: 'APP (Manual)'
    },
    {
      id: '3',
      client: 'Alfonzo',
      date: '04/29/2024',
      startTime: '10:30:00 AM',
      endTime: '02:18:00 PM',
      timeDuration: '3.75 Hrs',
      loggedVia: 'APP (Manual)'
    },
    {
      id: '4',
      client: 'Tokyo',
      date: '04/29/2024',
      startTime: '10:30:00 AM',
      endTime: '02:18:00 PM',
      timeDuration: '3.75 Hrs',
      loggedVia: 'APP (Manual)'
    },
    {
      id: '5',
      client: 'Sheena',
      date: '04/29/2024',
      startTime: '10:30:00 AM',
      endTime: '02:18:00 PM',
      timeDuration: '3.75 Hrs',
      loggedVia: 'APP (Manual)'
    }
  ]

  const newColumns: GridColDef[] = [
    // {
    //   field: 'itemNumber',
    //   headerName: '#',
    //   flex: 0.5,
    //   renderCell: (params: GridRenderCellParams) => <span>{params.row.index + 1}</span>
    // },
    {
      field: 'id',
      headerName: '#',
      flex: 0.1
    },
    {
      field: 'client',
      headerName: 'CLIENT NAME',
      flex: 0.3
    },
    {
      field: 'date',
      headerName: 'DATE',
      flex: 0.3
    },
    {
      field: 'startTime',
      headerName: 'START TIME',
      flex: 0.3
    },
    {
      field: 'endTime',
      headerName: 'END TIME',
      flex: 0.3
    },
    {
      field: 'timeDuration',
      headerName: 'TIME DURATION',
      flex: 0.3
    },
    {
      field: 'loggedVia',
      headerName: 'LOGGED VIA',
      flex: 0.3
    }
  ]

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <DataTable columns={newColumns} data={rowData} />
      </div>
    </Card>
  )
}

export default TimeLogTable

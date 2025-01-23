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
import { useRouter } from 'next/navigation'
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

const AccountHistoryTable = () => {
  // State
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')

  const router = useRouter()

  const rowData = [
    {
      id: '1',
      dateAndTime: '04/28/2024, 02:12 pm',
      admin: 'Sameer Khan',
      section: 'Profile',
      changesMade: 'Updated Assign client - Yolanda Jordan'
    }
  ]

  const listData = [
    'Removed Hss User',
    'Updated Agency Location-868005',
    'Updated Agency Location-868006',
    'Updated Agency Location-868007',
    'Updated Agency Location-868009',
    'Removed Payor Group Information HSS-a:5'
  ]

  const newColumns: GridColDef[] = [
    // {
    //   field: 'itemNumber',
    //   headerName: '#',
    //   flex: 0.5,
    //   renderCell: (params: GridRenderCellParams) => <span>{params.row.index + 1}</span>
    // },
    {
      field: 'dateAndTime',
      headerName: 'DATE & TIME',
      flex: 0.5
    },
    {
      field: 'admin',
      headerName: 'ADMIN',
      flex: 0.5
    },
    {
      field: 'section',
      headerName: 'SECTION',
      flex: 0.5
    },
    {
      field: 'changesMade',
      headerName: 'CHANGES MADE',
      flex: 0.5
    }
  ]

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
      {/* Search Bar and Add Employee Buttons */}

      <Grid container spacing={2} alignItems='center' sx={{ mb: 2, p: 10 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            placeholder='Search admin name'
            variant='outlined'
            size='small'
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              endAdornment: (
                <span style={{ color: '#757575', marginLeft: '8px', marginTop: 8 }}>
                  <i className='bx-search' />
                </span>
              )
            }}
          />
        </Grid>
      </Grid>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <DataTable columns={newColumns} data={rowData} />
        <List sx={{ mt: 0 }}>
          {listData.map((item, index) => (
            <ListItem
              key={index}
              className='border-b-[1px]'
              sx={{
                mb: 0.5,
                color: item.includes('Removed') ? 'red' : '#4A4A4A'
              }}
            >
              {item}
            </ListItem>
          ))}
        </List>
      </div>
    </Card>
  )
}

export default AccountHistoryTable

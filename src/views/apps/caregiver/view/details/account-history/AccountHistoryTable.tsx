'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'

// Third-party Imports
import axios from 'axios'

// CSS Module Imports
import { useParams } from 'next/navigation'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import DataTable from '@/@core/components/mui/DataTable'
import { Typography } from '@mui/material'
import { formatDateTime } from '@/utils/helperFunctions'

// type AccountHistory = {
//   key: number
//   dateAndTime: string
//   admin: string
//   section: string
//   changesMade: string
// }

const AccountHistoryTable = () => {
  // State
  const [search, setSearch] = useState('')
  const [userActions, setUserActions] = useState([])
  const [loading, setLoading] = useState(true)

  const { id } = useParams()

  const listData = [
    'Removed Hss User',
    'Updated Agency Location-868005',
    'Updated Agency Location-868006',
    'Updated Agency Location-868007',
    'Updated Agency Location-868009',
    'Removed Payor Group Information HSS-a:5'
  ]

  // Fetch user actions when the component mounts or id changes
  useEffect(() => {
    const fetchUserActions = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/account-history/caregiver/${id}`)
        setUserActions(response.data) // Set the fetched data into state
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserActions()
  }, [id]) // Dependency array: re-run if id changes

  const newColumns: GridColDef[] = [
    {
      field: 'createdAt',
      headerName: 'DATE & TIME',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='font-light text-sm my-3'>{formatDateTime(params.value)}</Typography>
      )
    },
    {
      field: 'userId',
      headerName: 'ADMIN',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='font-light text-sm my-3'>{params.row.user.userName}</Typography> // Access nested user.userName
      )
    },
    {
      field: 'actionType',
      headerName: 'SECTION',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='font-light text-sm my-3'>{params.value}</Typography>
      )
    },
    {
      field: 'details',
      headerName: 'CHANGES MADE',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='font-light text-sm my-3'>{params.value}</Typography>
      )
    }
  ]
  console.log('ONE USER ACTION LIST', userActions)

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
        <DataTable columns={newColumns} data={userActions} />
        {/* <List sx={{ mt: 0 }}>
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
        </List> */}
      </div>
    </Card>
  )
}

export default AccountHistoryTable

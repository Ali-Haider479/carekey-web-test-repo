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

type Caregiver = {
  itemNumber: number
  id: number
  caregiverName: string
  firstName: string
  middleName: string
  lastName: string
  caregiverUMPI: string
}

const CaregiverTable = () => {
  // State
  const [data, setData] = useState<Caregiver[]>([])
  const [search, setSearch] = useState('')

  const router = useRouter()

  const handleNext = (record: any) => {
    router.push(`/apps/caregiver/${record.id}/detail`)
  }

  const newColumns: GridColDef[] = [
    // {
    //   field: 'itemNumber',
    //   headerName: '#',
    //   flex: 0.5,
    //   renderCell: (params: GridRenderCellParams) => <span>{params.row.index + 1}</span>
    // },
    {
      field: 'id',
      headerName: 'CAREGIVER ID',
      flex: 0.5
    },
    {
      field: 'caregiverName',
      headerName: 'CAREGIVER NAME',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <span
            onClick={() => handleNext(params.row)}
            className='text-[#67C932]'
          >{`${params.row.firstName} ${params.row.lastName}`}</span>
        )
      }
    },
    {
      field: 'firstName',
      headerName: 'FIRST NAME',
      flex: 0.5
    },
    {
      field: 'middleName',
      headerName: 'MIDDLE NAME',
      flex: 0.5
    },
    {
      field: 'lastName',
      headerName: 'LAST NAME',
      flex: 0.5
    },
    {
      field: 'caregiverUMPI',
      headerName: 'CAREGIVER UMPI',
      flex: 0.5
    }
  ]

  useEffect(() => {
    // Fetch data from the backend API
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregivers/1/tenant`)
        const fetchedData = response.data
        console.log('Caregiver List ----> ', fetchedData)

        setData(fetchedData)
      } catch (error) {
        console.error('Error fetching data', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
      {/* Search Bar and Add Employee Buttons */}

      <Grid container spacing={2} alignItems='center' sx={{ mb: 2, p: 10 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            placeholder='Search name, phone number, pmi number'
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
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={() => router.push('/apps/caregiver/add-employee')}
            variant='contained'
            sx={{ backgroundColor: '#4B0082', color: '#fff', fontWeight: 'bold' }}
          >
            Add Employee
          </Button>
        </Grid>
      </Grid>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <DataTable columns={newColumns} data={data} />
      </div>
    </Card>
  )
}

export default CaregiverTable

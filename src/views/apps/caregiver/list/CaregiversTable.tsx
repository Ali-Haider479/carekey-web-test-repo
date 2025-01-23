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
import Grid from '@mui/material/Grid'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'

// CSS Module Imports
import styles from '../CaregiversTable.module.css'
import { useRouter } from 'next/navigation'

type Caregiver = {
  itemNumber: number
  id: number
  caregiverName: string
  firstName: string
  middleName: string
  lastName: string
  caregiverUMPI: string
}

// Column Definitions
const columnHelper = createColumnHelper<Caregiver>()

const columns = [
  columnHelper.accessor('itemNumber', {
    cell: info => <span>{info.row.index + 1}</span>,
    header: '#'
  }),
  columnHelper.accessor('id', {
    cell: info => info.getValue(),
    header: 'CAREGIVER ID'
  }),
  columnHelper.accessor('caregiverName', {
    cell: info => {
      const { firstName, middleName, lastName } = info.row.original
      return <span className='text-[#67C932]'>{`${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`}</span>
    },
    header: 'CAREGIVER NAME'
  }),
  columnHelper.accessor('firstName', {
    cell: info => info.getValue(),
    header: 'FIRST NAME'
  }),
  columnHelper.accessor('middleName', {
    cell: info => info.getValue(),
    header: 'MIDDLE NAME'
  }),
  columnHelper.accessor('lastName', {
    cell: info => info.getValue(),
    header: 'LAST NAME'
  }),
  columnHelper.accessor('caregiverUMPI', {
    cell: info => info.getValue(),
    header: 'UMPI NUMBER'
  })
]

const CaregiverTable = () => {
  // State
  const [data, setData] = useState<Caregiver[]>([])
  const [search, setSearch] = useState('')

  const router = useRouter()

  // Table Hook
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: () => false
    }
  })

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
        <Grid item xs={12} md={6}>
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
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant='contained' sx={{ backgroundColor: '#4B0082', color: '#fff', fontWeight: 'bold' }}>
            Add Employee
          </Button>
        </Grid>
      </Grid>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          className={styles.table}
          style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr
                key={headerGroup.id}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderBottom: '1px solid #E0E0E0'
                }}
              >
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: '#616161',
                      fontWeight: 'bold'
                    }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                style={{
                  borderBottom: '1px solid #E0E0E0',
                  backgroundColor: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onClick={() => router.push('/apps/caregiver/1/detail')}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} style={{ padding: '12px 16px', fontSize: '14px' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default CaregiverTable

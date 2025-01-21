'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'

import styles from './scheduleTable.module.css'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Button } from '@mui/material'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams } from 'next/navigation'

// Type Definitions
type User = {
  id: number
  fullName: string
  email: string
  proMod: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'EXPIRED'
  totalUnit: string
  avatar: string
}

// Sample Data
const defaultData: User[] = [
  {
    id: 1,
    fullName: 'Jordan Stevenson',
    email: 'Layne_Kuvalis@gmail.com',
    proMod: 'H2014(UCU3)',
    startDate: '08/01/2023',
    endDate: '11/27/2024',
    status: 'ACTIVE',
    totalUnit: '1040 (260 Hrs)',
    avatar: '/path/to/avatar1.jpg'
  },
  {
    id: 2,
    fullName: 'Jordan Stevenson',
    email: 'Layne_Kuvalis@gmail.com',
    proMod: 'H2014(UCU3)',
    startDate: '08/01/2023',
    endDate: '11/27/2024',
    status: 'EXPIRED',
    totalUnit: '1040 (260 Hrs)',
    avatar: '/path/to/avatar2.jpg'
  },
  {
    id: 3,
    fullName: 'Jordan Stevenson',
    email: 'Layne_Kuvalis@gmail.com',
    proMod: 'H2014(UCU3)',
    startDate: '08/01/2023',
    endDate: '11/27/2024',
    status: 'ACTIVE',
    totalUnit: '1040 (260 Hrs)',
    avatar: '/path/to/avatar3.jpg'
  }
]

// Column Definitions
const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.accessor('id', {
    cell: info => <span>{info.getValue()}</span>,
    header: '#'
  }),
  columnHelper.accessor('fullName', {
    cell: info => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Avatar alt={info.row.original.fullName} src={info.row.original.avatar} />
        <div>
          <strong>{info.getValue()}</strong>
          <br />
          <span style={{ fontSize: '12px', color: '#757575' }}>{info.row.original.email}</span>
        </div>
      </div>
    ),
    header: 'CLIENT NAME'
  }),
  columnHelper.accessor('proMod', {
    cell: info => info.getValue(),
    header: 'PRO & MOD'
  }),
  columnHelper.accessor('startDate', {
    cell: info => info.getValue(),
    header: 'START DATE'
  }),
  columnHelper.accessor('endDate', {
    cell: info => info.getValue(),
    header: 'END DATE'
  }),
  columnHelper.accessor('status', {
    cell: info => (
      <Chip
        label={info.getValue()}
        size='small'
        sx={{
          color: info.getValue() === 'ACTIVE' ? '#4CAF50' : '#F44336',
          backgroundColor: info.getValue() === 'ACTIVE' ? '#E8F5E9' : '#FFEBEE',
          fontWeight: 'bold'
        }}
      />
    ),
    header: 'STATUS'
  }),
  columnHelper.accessor('totalUnit', {
    cell: info => info.getValue(),
    header: 'TOTAL UNIT'
  })
]

const ScheduleListTable = () => {
  const { lang: locale } = useParams()
  // State
  const [data] = useState(() => [...defaultData])

  // Table Hook
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: () => false
    }
  })

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
                  //   backgroundColor: '#f5f5f5', // Explicitly set gray background
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
                  //   backgroundColor: 'black',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
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

export default ScheduleListTable

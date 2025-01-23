'use client'

import { useEffect, useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import TablePagination from '@mui/material/TablePagination'
import { Avatar, CircularProgress } from '@mui/material'
import axios from 'axios'
import tableStyles from '@core/styles/table.module.css'
import classnames from 'classnames'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender
} from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef, FilterFn, Table } from '@tanstack/react-table'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils'
import DataTable from '@/@core/components/mui/DataTable'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

// Interfaces remain the same...
interface Client {
  id: number
  firstName: string
  lastName: string
  middleName: string
  gender: string
  dateOfBirth: string
  pmiNumber: string
  clientCode: string
  clientServices: any
}

interface Caregiver {
  id: number
  firstName: string
  lastName: string
  middleName: string
  gender: string
  dateOfBirth: string
  caregiverUMPI: string
  payRate: number
  additionalPayRate: number
  caregiverLevel: string
}
interface TimeLog {
  id: number
  dateOfService?: Date
  clockIn?: string
  clockOut?: string
  notes?: string
  serviceName?: string
}

interface Signature {
  id: number
  clientSignStatus: string
  tsApprovalStatus: string
  caregiver: Caregiver
  client: Client
  timeLog?: TimeLog
}

// Helper function to calculate duration with fallback
const calculateDuration = (clockIn?: string, clockOut?: string): string => {
  if (!clockIn || !clockOut) return 'N/A'

  try {
    const start = new Date(`1970/01/01 ${clockIn}`)
    const end = new Date(`1970/01/01 ${clockOut}`)

    const diffMs = end.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  } catch (error) {
    return 'N/A'
  }
}

// Format date helper with fallback
const formatDate = (date?: Date): string => {
  if (!date) return 'N/A'

  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'N/A'
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper<Signature>()

// Create a custom TablePaginationComponent that accepts generic type
interface CustomTablePaginationProps<T> {
  table: Table<T>
}

const CustomTablePagination = <T,>({ table }: CustomTablePaginationProps<T>) => {
  return <TablePaginationComponent table={table as unknown as Table<unknown>} />
}

const rows = [
  {
    id: 1,
    batchName: 'Exercise',
    dateOfSubmission: '2025-01-10',
    submissionDate: '2025-01-12',
    remitanceStatus: 'Pending',
    finalStatus: 'In Progress'
  },
  {
    id: 2,
    batchName: 'Running',
    dateOfSubmission: '2025-01-08',
    submissionDate: '2025-01-09',
    remitanceStatus: 'Completed',
    finalStatus: 'Completed'
  },
  {
    id: 3,
    batchName: 'Gym',
    dateOfSubmission: '2025-01-15',
    submissionDate: '2025-01-16',
    remitanceStatus: 'Pending',
    finalStatus: 'In Progress'
  },
  {
    id: 4,
    batchName: 'Swimming',
    dateOfSubmission: '2025-01-05',
    submissionDate: '2025-01-06',
    remitanceStatus: 'Completed',
    finalStatus: 'Completed'
  }
]

const SavedBatchTable = () => {
  const [data, setData] = useState<Signature[]>([])
  const [filteredData, setFilteredData] = useState(rows)
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const columns: GridColDef[] = [
    {
      field: 'batchName',
      headerName: 'BATCH NAME',
      flex: 1.5
    },
    {
      field: 'dateOfSubmission',
      headerName: 'DATE OF SUBMISSION',
      flex: 1
    },
    {
      field: 'submissionDate',
      headerName: 'SUBMISSION DATE',
      flex: 1
    },
    {
      field: 'remitanceStatus',
      headerName: 'REMITANCE STATUS',
      flex: 1
    },
    {
      field: 'finalStatus',
      headerName: 'FINAL STATUS',
      flex: 1,
      renderCell: params => (
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            params.value === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {params.value}
        </span>
      )
    }
  ]

  if (isLoading) {
    return (
      <Card>
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      </Card>
    )
  }

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      <CardHeader title='Saved Batch' className='pb-4' />
      <DataTable data={filteredData} columns={columns} />
    </Card>
  )
}

export default SavedBatchTable

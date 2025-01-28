'use client'

import { useEffect, useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef, FilterFn, Table } from '@tanstack/react-table'
import TablePagination from '@mui/material/TablePagination'
import { CircularProgress } from '@mui/material'
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
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableFilters from '@/views/apps/user/list/TableFilters'
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils'
import { GridColDef } from '@mui/x-data-grid'
import DataTable from '@/@core/components/mui/DataTable'

// Updated interfaces to match your data structure
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

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

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

interface Signature {
  id: number
  clientSignStatus: string
  tsApprovalStatus: string
  duration: string
  caregiverSignature: string
  clientSignature: string
  caregiver: Caregiver
  client: Client
  timeLog: any[]
}

type SignatureWithAction = Signature & {
  action?: string
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

const SubmittedBatchTable = () => {
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
      flex: 1,
      renderCell: params => (
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            params.value === 'Completed' ? 'bg-[#72E1281F] text-[#67C932]' : 'bg-[#26C6F91F] text-[#21AEDB'
          }`}
        >
          {params.value}
        </span>
      )
    },
    {
      field: 'finalStatus',
      headerName: 'FINAL STATUS',
      flex: 1,
      renderCell: params => (
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            params.value === 'Completed' ? 'bg-[#72E1281F] text-[#67C932]' : 'bg-[#666CFF1F] text-[#6062E8'
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
      {/* <CardHeader title='Submitted Batch' className='pb-4' /> */}
      <DataTable data={filteredData} columns={columns} />
    </Card>
  )
}

export default SubmittedBatchTable

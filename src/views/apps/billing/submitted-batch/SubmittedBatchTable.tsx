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
import ReactTable from '@/@core/components/mui/ReactTable'

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

const dummyData = [
  {
    id: 1,
    batchName: 'Exercise',
    dateOfSubmission: '2025-01-10',
    submissionDate: '2025-01-12',
    remitanceStatus: 'Pending',
    finalStatus: 'In Progress',
    subRows: [
      {
        id: 2,
        batchName: 'Running',
        dateOfSubmission: '2025-01-08',
        submissionDate: '2025-01-09',
        remitanceStatus: 'Completed',
        finalStatus: 'Completed'
      }
    ]
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
  const [filteredData, setFilteredData] = useState(dummyData)
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const columns = [
    {
      accessorKey: 'batchName',
      header: 'BATCH NAME'
    },
    {
      accessorKey: 'dateOfSubmission',
      header: 'DATE OF SUBMISSION'
    },
    {
      accessorKey: 'submissionDate',
      header: 'SUBMISSION DATE'
    },
    {
      accessorKey: 'remitanceStatus',
      header: 'REMITANCE STATUS'
    },
    {
      accessorKey: 'finalStatus',
      header: 'FINAL STATUS'
    }
  ]

  useEffect(() => {
    // Simulate data loading and theme initialization
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      {isLoading ? (
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      ) : (
        <ReactTable columns={columns} data={dummyData} enableExpanding={true} enableExpandAll={false} />
      )}
    </Card>
  )
}

export default SubmittedBatchTable

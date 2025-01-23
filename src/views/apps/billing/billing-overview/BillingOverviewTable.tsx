'use client'

import { useEffect, useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { createColumnHelper, Table } from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
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
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableFilters from '@/views/apps/user/list/TableFilters'
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils'
import DataTable from '@/@core/components/mui/DataTable'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

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
    clientName: 'Cody Fisher',
    caregiverName: 'Kathryn Murphy',
    claimAmount: '$214.31',
    payer: 'MA',
    proCode: 'T1020',
    serviceDateRange: '04/15/2024 - 04/15/2024',
    claimStatus: 'Completed'
  },
  {
    id: 2,
    clientName: 'Robert Fox',
    caregiverName: 'Leslie Alexander',
    claimAmount: '$214.31',
    payer: 'MA',
    proCode: 'T1020',
    serviceDateRange: '04/15/2024 - 04/15/2024',
    claimStatus: 'Pending'
  },
  {
    id: 3,
    clientName: 'Esther Howard',
    caregiverName: 'Courtney Henry',
    claimAmount: '$214.31',
    payer: 'MA',
    proCode: 'T1020',
    serviceDateRange: '04/15/2024 - 04/15/2024',
    claimStatus: 'Completed'
  },
  {
    id: 4,
    clientName: 'Jenny Wilson',
    caregiverName: 'Kristin Watson',
    claimAmount: '$214.31',
    payer: 'MA',
    proCode: 'T1020',
    serviceDateRange: '04/15/2024 - 04/15/2024',
    claimStatus: 'Pending'
  }
]

const BillingOverviewTable = () => {
  const [data, setData] = useState<Signature[]>([])
  const [filteredData, setFilteredData] = useState(dummyData)
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const columns: GridColDef[] = [
    {
      field: 'serviceDateRange',
      headerName: 'SERVICE DATE RANGE',
      flex: 1.5
    },
    {
      field: 'clientName',
      headerName: 'CLIENT NAME',
      flex: 1
    },
    {
      field: 'caregiverName',
      headerName: 'CAREGIVER NAME',
      flex: 1
    },
    {
      field: 'claimAmount',
      headerName: 'CLAIM AMOUNT',
      flex: 1
    },
    {
      field: 'claimStatus',
      headerName: 'BILLED STATUS',
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
      <CardHeader title='Billing Overview' className='pb-4' />
      <DataTable data={filteredData} columns={columns} />
    </Card>
  )
}

export default BillingOverviewTable

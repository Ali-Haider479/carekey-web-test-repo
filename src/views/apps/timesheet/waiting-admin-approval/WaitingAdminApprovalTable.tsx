'use client'

import { useEffect, useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef, FilterFn, Table } from '@tanstack/react-table'
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
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import DataTableWithSearchBarAndFilters from '@/@core/components/mui/DataTableWithSearchBarAndFilters'

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

const WaitingAdminApprovalTable = () => {
  const [data, setData] = useState<Signature[]>([])
  const [filteredData, setFilteredData] = useState<Signature[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  // Fetch signatures data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/signatures`)
        setData(response.data)
        setFilteredData(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching signatures:', error)
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'clientName',
        headerName: 'Client Name',
        flex: 1.5,
        renderCell: (params: GridRenderCellParams) => (
          <div style={{ height: '50px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}>
            <Avatar alt={params.row.clientName} src={params.row.client.avatar} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong className='h-4'>{params.row.clientName}</strong>
              <span style={{ fontSize: '12px', color: '#757575' }}>{params.row.client.email}</span>
            </div>
          </div>
        )
      },
      {
        field: 'caregiverName',
        headerName: 'Caregiver Assigned',
        flex: 1.5,
        renderCell: (params: GridRenderCellParams) => (
          <div style={{ height: '50px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}>
            <Avatar alt={params.row.caregiverName} src={params.row.caregiver.avatar} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong className='h-4'>{params.row.caregiverName}</strong>
            </div>
          </div>
        )
      },
      {
        field: 'service',
        headerName: 'Service',
        flex: 1.5,
        renderCell: (params: GridRenderCellParams) => {
          const services = params.row.client.clientServices
          if (services && services.length > 0) {
            const serviceNames = services.map((service: any) => service?.service?.name).join(', ')
            return <span>{serviceNames}</span>
          }
          return <span>No services available</span>
        }
      },
      {
        field: 'logsRecorded',
        headerName: 'Logs Recorded',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              params.value === 'Taken' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Yes
          </span>
        )
      },
      {
        field: 'clientSignStatus',
        headerName: 'Sign Status',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              params.value === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {params.value}
          </span>
        )
      },
      {
        field: 'timesheetApproved',
        headerName: 'Timesheet Approved',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              params.value === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}
          >
            Pending
          </span>
        )
      }
    ],
    []
  )

  // const table = useReactTable({
  //   data: filteredData,
  //   columns,
  //   filterFns: {
  //     fuzzy: fuzzyFilter
  //   },
  //   state: {
  //     rowSelection,
  //     globalFilter
  //   },
  //   initialState: {
  //     pagination: {
  //       pageSize: 10
  //     }
  //   },
  //   enableRowSelection: true,
  //   onRowSelectionChange: setRowSelection,
  //   getCoreRowModel: getCoreRowModel(),
  //   onGlobalFilterChange: setGlobalFilter,
  //   getFilteredRowModel: getFilteredRowModel(),
  //   getSortedRowModel: getSortedRowModel(),
  //   getPaginationRowModel: getPaginationRowModel()
  // })

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
      <CardHeader title='Signatures Status' className='pb-4' />
      <div style={{ overflowX: 'auto', padding: '0px' }}>
        <DataTableWithSearchBarAndFilters data={filteredData} columns={columns} />
      </div>
    </Card>
  )
}

export default WaitingAdminApprovalTable

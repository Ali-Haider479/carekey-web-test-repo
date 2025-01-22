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
import { GridRenderCellParams } from '@mui/x-data-grid'

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

const SavedBatchTable = () => {
  const [data, setData] = useState<Signature[]>([])
  const [filteredData, setFilteredData] = useState<Signature[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [isLoading, setIsLoading] = useState(true)

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

  const columns = useMemo(
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
        field: 'timeLogDate',
        headerName: 'TimeLog Date',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => <>{formatDate(params.row.timeLog?.dateOfService)}</>
      },
      {
        field: 'startTime',
        headerName: 'Start Time',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => <>{params.row.timeLog?.clockIn || 'N/A'}</>
      },
      {
        field: 'endTime',
        headerName: 'End Time',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => <>{params.row.timeLog?.clockOut || 'N/A'}</>
      },
      {
        field: 'duration',
        headerName: 'Duration',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => (
          <>{calculateDuration(params.row.timeLog?.clockIn, params.row.timeLog?.clockOut)}</>
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
        <DataTable data={filteredData} columns={columns} />
      </div>
    </Card>
  )
}

export default SavedBatchTable

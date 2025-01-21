'use client'

import { useEffect, useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { createColumnHelper, Table } from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
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
import { GridRenderCellParams } from '@mui/x-data-grid'
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

const SignatureStatusTable = () => {
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

  const columns = useMemo(
    () => [
      {
        field: 'clientName',
        headerName: 'Client Name',
        flex: 1.5,
        renderCell: (params: GridRenderCellParams) => (
          <>
            **{`${params.row.client.firstName} ${params.row.client.lastName}`}**
            {params.row.client.email}
          </>
        )
      },
      {
        field: 'caregiverName',
        headerName: 'Caregiver Assigned',
        flex: 1.5,
        renderCell: (params: GridRenderCellParams) => (
          <>**{`${params.row.caregiver.firstName} ${params.row.caregiver.lastName}`}**</>
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
            return serviceNames
          }
          return 'No services available'
        }
      },
      {
        field: 'timeLog',
        headerName: 'Logs Recorded',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => <>{params.value?.length || 0}</>
      },
      {
        field: 'clientSignStatus',
        headerName: 'Sign Status',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => <>{params.value}</>
      },
      {
        field: 'tsApprovalStatus',
        headerName: 'Service Status',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => <>{params.value}</>
      },
      {
        field: 'duration',
        headerName: 'Hours Worked',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => <>{params.value}</>
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

export default SignatureStatusTable

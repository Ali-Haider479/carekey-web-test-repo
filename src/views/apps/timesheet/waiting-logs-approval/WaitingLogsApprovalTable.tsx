'use client'

import { useEffect, useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
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
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef, FilterFn, Table } from '@tanstack/react-table'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils'

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

const WaitingLogsApprovalTable = () => {
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

  const columns = useMemo<ColumnDef<Signature, any>[]>(
    () => [
      columnHelper.accessor(row => `${row.client.firstName} ${row.client.lastName}`, {
        id: 'clientName',
        header: 'Client Name',
        cell: info => info.getValue()
      }),
      columnHelper.accessor(row => `${row.caregiver.firstName} ${row.caregiver.lastName}`, {
        id: 'caregiverName',
        header: 'Caregiver Assigned',
        cell: info => info.getValue()
      }),
      columnHelper.accessor(row => row.timeLog?.dateOfService, {
        id: 'timeLogDate',
        header: 'TimeLog Date',
        cell: info => formatDate(info.getValue())
      }),
      columnHelper.accessor(row => row.timeLog?.clockIn, {
        id: 'startTime',
        header: 'Start Time',
        cell: info => info.getValue() || 'N/A'
      }),
      columnHelper.accessor(row => row.timeLog?.clockOut, {
        id: 'endTime',
        header: 'End Time',
        cell: info => info.getValue() || 'N/A'
      }),
      columnHelper.accessor(row => calculateDuration(row.timeLog?.clockIn, row.timeLog?.clockOut), {
        id: 'duration',
        header: 'Duration',
        cell: info => info.getValue()
      })
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

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
    <Card>
      <CardHeader title='TimeLogs Status' className='pb-4' />
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} style={{
                backgroundColor: '#f5f5f5', // Explicitly set gray background
                borderBottom: '1px solid #E0E0E0'
              }}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <i className='bx-chevron-up text-xl' />,
                          desc: <i className='bx-chevron-down text-xl' />
                        }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='text-center p-4'>
                  No time logs found
                </td>
              </tr>
            ) : (
              table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        component={() => <CustomTablePagination table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
      />
    </Card>
  )
}

export default WaitingLogsApprovalTable

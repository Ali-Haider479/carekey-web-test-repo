import React, { useEffect, useState } from 'react'
import { Checkbox, SxProps, Theme, TextField, Select, MenuItem } from '@mui/material'
import { useTheme } from '@emotion/react'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import {
  ColumnDef,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table'

export interface Column<T> {
  id: string
  label: string
  render?: (item: T) => React.ReactNode
  width?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  editable?: boolean
  cellStyle?: SxProps<Theme>
  headerStyle?: SxProps<Theme>
}

const mapColumnsToColumnDefs = <T,>(columns: Column<T>[]): ColumnDef<T>[] => {
  return columns.map(col => ({
    id: col.id,
    accessorKey: col.id,
    header: col.label,
    cell: col.render ? info => col.render!(info.row.original) : info => info.getValue(),
    enableSorting: col.sortable ?? true,
    meta: {
      align: col.align,
      cellStyle: col.cellStyle,
      headerStyle: col.headerStyle
    }
  }))
}

type StatusOption = 'Approved' | 'Rejected' | 'Pending' | 'Mixed'

const STATUS_OPTIONS: StatusOption[] = ['Approved', 'Rejected', 'Pending', 'Mixed']

interface ReactTableProps<T extends { subRows?: T[] }> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  enableRowSelect?: boolean
  enableRowExpand?: boolean
  enablePagination?: boolean
  pageSize?: number
  onSelectionChange?: (selectedItems: T[]) => void
  expandedContent?: (item: T) => React.ReactNode
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void
  containerStyle?: SxProps<Theme>
  headerStyle?: SxProps<Theme>
  rowStyle?: SxProps<Theme>
  selectedRowStyle?: SxProps<Theme>
  expandedRowStyle?: SxProps<Theme>
  stickyHeader?: boolean
  maxHeight?: string | number
  showBorder?: boolean
  dense?: boolean
  size?: 'small' | 'medium'
  isEditing?: boolean
  onSave?: any
  editingId?: any
  onEditChange?: any
  page?: number
  onPageChange?: (page: number) => void
  caregiverTable?: boolean
  clientTable?: boolean
}

function TanStackTable<T extends { subRows?: T[] }>({
  columns,
  data,
  keyExtractor,
  enableRowSelect = false,
  enablePagination = false,
  pageSize = 10,
  onSelectionChange,
  onSort,
  editingId = null,
  onEditChange,
  page: externalPage = 0, // Default to 0
  onPageChange,
  caregiverTable = false
}: ReactTableProps<T>) {
  const [selected, setSelected] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>([])
  const [page, setPage] = useState(externalPage)
  const [rowsPerPage, setRowsPerPage] = useState(pageSize)
  const [sortConfig, setSortConfig] = useState<{ columnId: string; direction: 'asc' | 'desc' } | null>({
    columnId: caregiverTable ? 'caregiverName' : 'clientName',
    direction: 'asc'
  })
  const [editedData, setEditedData] = useState<{ [key: string]: any }>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([
    { id: caregiverTable ? 'caregiverName' : 'clientName', desc: false }
  ])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const theme: any = useTheme()

  const globalFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
    if (!filterValue) return true

    const searchValue = filterValue.toLowerCase()
    const rowData = row.original

    const searchableFields = [
      rowData.name,
      rowData.umpi,
      rowData.email,
      rowData.phoneNumber,
      rowData.dateOfBirth,
      rowData.hiringDate,
      rowData.level || 'no level',
      rowData.status,
      new Date(rowData.dateOfBirth).toLocaleDateString('en-US'),
      new Date(rowData.hiringDate).toLocaleDateString('en-US'),
      Math.floor((Date.now() - new Date(rowData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString()
    ]

    return searchableFields.some(field => field?.toString().toLowerCase().includes(searchValue))
  }

  const columnDefs = mapColumnsToColumnDefs(columns)

  const table = useReactTable({
    data,
    columns: columnDefs,
    state: {
      globalFilter,
      sorting,
      columnVisibility
    },
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
    defaultColumn: {
      size: 100,
      minSize: 50,
      maxSize: 300
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn,
    filterFns: {
      fuzzy: globalFilterFn
    }
  })

  useEffect(() => {
    if (editingId === null) {
      setEditedData({})
    }
  }, [editingId])

  useEffect(() => {
    setPage(externalPage)
  }, [externalPage])

  // Initialize default sorting by id in ascending order
  useEffect(() => {
    if (data.length > 0 && sortConfig?.columnId === 'caregiverName' && sortConfig?.direction === 'asc') {
      onSort?.('caregiverName', 'asc')
    }
    if (data.length > 0 && sortConfig?.columnId === 'clientName' && sortConfig?.direction === 'asc') {
      onSort?.('clientName', 'asc')
    }
  }, [data, onSort, sortConfig])

  // Function to sort data
  const getSortedData = (data: T[]): T[] => {
    if (!sortConfig) return data

    const { columnId, direction } = sortConfig

    // Only sort top-level rows; preserve subRows
    const sortedData = [...data].sort((a, b) => {
      const aValue = (a as any)[columnId]
      const bValue = (b as any)[columnId]

      if (aValue == null && bValue == null) return 0
      if (aValue == null) return direction === 'asc' ? -1 : 1
      if (bValue == null) return direction === 'asc' ? 1 : -1

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Handle strings or other types
      return direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue))
    })

    // Recursively sort subRows if needed (optional)
    return sortedData.map(item => ({
      ...item,
      subRows: item.subRows ? getSortedData(item.subRows) : item.subRows
    }))
  }

  const handleEditChange = (id: string | number, columnId: string, value: any, item?: any) => {
    const newEditedData = {
      ...editedData,
      [id]: {
        ...(editedData[id] || {}),
        [columnId]: value
      }
    }
    setEditedData(newEditedData)

    if (onEditChange) {
      const originalRow = data.find(item => keyExtractor(item) === id)
      const updatedRow = {
        id: item?.id,
        ...originalRow,
        ...newEditedData[id]
      }
      onEditChange(updatedRow)
    }
  }

  const getEditedValue = (item: T, columnId: string) => {
    const id = keyExtractor(item)
    return editedData[id]?.[columnId] ?? (item as any)[columnId]
  }

  const renderCell = (item: T, column: Column<T>) => {
    // const id = Number(keyExtractor(item))
    const id = keyExtractor(item)
    const isRowEditing = editingId == id
    if (isRowEditing && column.editable) {
      const value = getEditedValue(item, column.id)

      // Handle status dropdown
      if (column.id === 'tsApprovalStatus') {
        return (
          <Select
            value={value || 'Active'}
            onChange={e => handleEditChange(id, column.id, e.target.value, item)}
            variant='standard'
            sx={{
              paddingLeft: 2,
              minWidth: 115,
              '&:before': { borderBottomColor: 'rgba(0, 0, 0, 0.1)' },
              '&:hover:not(.Mui-disabled):before': { borderBottomColor: 'primary.main' }
            }}
          >
            {STATUS_OPTIONS.map(status => (
              <MenuItem key={status} value={status} disabled={status === 'Mixed'}>
                {status}
              </MenuItem>
            ))}
          </Select>
        )
      }

      // Handle datetime fields
      if (column.id === 'clockIn' || column.id === 'clockOut') {
        return (
          <AppReactDatepicker
            selected={value ? new Date(value) : null}
            onChange={(date: Date | null) => {
              handleEditChange(id, column.id, date?.toISOString(), item)
            }}
            showTimeSelect
            timeFormat='HH:mm'
            timeIntervals={15}
            dateFormat='MM/dd/yyyy h:mm aa'
            customInput={
              <TextField
                variant='standard'
                fullWidth
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: 'rgba(0, 0, 0, 0.1)' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'primary.main' }
                }}
              />
            }
          />
        )
      }

      // Handle other editable fields
      return (
        <TextField
          variant='standard'
          value={value}
          onChange={e => handleEditChange(id, column.id, e.target.value)}
          sx={{
            '& .MuiInput-underline:before': { borderBottomColor: 'rgba(0, 0, 0, 0.1)' },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'primary.main' }
          }}
        />
      )
    }

    if (column.render) {
      return column.render(item)
    }

    return (item as any)[column.id]
  }

  const getAllIds = (items: T[]): string[] => {
    return items.reduce((acc: string[], item) => {
      const itemId = keyExtractor(item)
      const subRowIds = item.subRows ? getAllIds(item.subRows) : []
      return [...acc, itemId, ...subRowIds]
    }, [])
  }

  const getSubRowIds = (item: T): string[] => {
    if (!item.subRows) return []
    return getAllIds(item.subRows)
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = getAllIds(data)
      setSelected(allIds)
      onSelectionChange?.(getAllItems(data))
    } else {
      setSelected([])
      onSelectionChange?.([])
    }
  }

  const getAllItems = (items: T[]): T[] => {
    return items.reduce((acc: T[], item) => {
      const subItems = item.subRows ? getAllItems(item.subRows) : []
      return [...acc, item, ...subItems]
    }, [])
  }

  const handleSelect = (id: string, item: T) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected: string[] = []

    if (selectedIndex === -1) {
      // Selecting an item
      newSelected = [...selected, id]

      // If the item has subRows (is a dummy row), select all subRows too
      if (item.subRows && item.subRows.length > 0) {
        const subRowIds = getSubRowIds(item)
        newSelected = [...new Set([...newSelected, ...subRowIds])] // Remove duplicates
      }
    } else {
      // Deselecting an item
      newSelected = selected.filter(itemId => itemId !== id)

      // If the item has subRows, deselect all subRows too
      if (item.subRows && item.subRows.length > 0) {
        const subRowIds = getSubRowIds(item)
        newSelected = newSelected.filter(itemId => !subRowIds.includes(itemId))
      }
    }

    setSelected(newSelected)
    const selectedItems = getAllItems(data).filter(item => newSelected.includes(keyExtractor(item)))
    onSelectionChange?.(selectedItems)
  }

  const handleExpand = (id: string) => {
    setExpanded(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  const handleSort = (columnId: string) => {
    if (!columns.find(col => col.id === columnId)?.sortable) return

    const direction = sortConfig?.columnId === columnId && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    setSortConfig({ columnId, direction })
    onSort?.(columnId, direction)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
    onPageChange?.(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
    onPageChange?.(0)
  }

  const totalPages = Math.ceil(data.length / rowsPerPage)

  // Apply sorting to data
  const sortedData = getSortedData(data)
  const paginatedData = enablePagination
    ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sortedData

  return (
    <>
      <div className='overflow-hidden'>
        <div className='w-full'>
          <table
            className={`w-full divide-y ${theme.palette.mode === 'light' ? 'divide-gray-200' : 'divide-gray-700'}`}
            style={{ borderSpacing: 0, borderCollapse: 'collapse' }}
          >
            <thead className={`${theme.palette.mode === 'light' ? 'bg-gray-50' : 'bg-gray-900/50'}`}>
              {enableRowSelect && (
                <tr>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < getAllIds(data).length}
                    checked={data.length > 0 && selected.length === getAllIds(data).length}
                    onChange={handleSelectAll}
                  />
                </tr>
              )}
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className={`px-3 py-3 text-left text-xs font-medium ${theme.palette.mode === 'light' ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-400 hover:bg-gray-800 '} uppercase tracking-wider cursor-pointer transition-colors`}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        width: header.getSize(),
                        minWidth: header.column.columnDef.minSize || header.getSize(),
                        maxWidth: header.column.columnDef.maxSize || 'none',
                        borderLeft: 0,
                        borderRight: 0
                      }}
                    >
                      <div className='flex items-center space-x-1'>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <div className='flex flex-col'>
                            <div
                              className={`w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent ${
                                header.column.getIsSorted() === 'asc'
                                  ? theme.palette.mode === 'light'
                                    ? 'border-b-indigo-600'
                                    : 'border-b-indigo-400'
                                  : theme.palette.mode === 'light'
                                    ? 'border-b-gray-300'
                                    : 'border-b-gray-600'
                              }`}
                              style={{ borderBottomWidth: '4px', marginBottom: '1px', marginLeft: '5px' }}
                            />
                            <div
                              className={`w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent ${
                                header.column.getIsSorted() === 'desc'
                                  ? theme.palette.mode === 'light'
                                    ? 'border-t-indigo-600'
                                    : 'border-t-indigo-400'
                                  : theme.palette.mode === 'light'
                                    ? 'border-t-gray-300'
                                    : 'border-t-gray-600'
                              }`}
                              style={{ borderTopWidth: '4px', marginLeft: '5px' }}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody
              className={`divide-y ${theme.palette.mode === 'light' ? 'bg-white divide-gray-200' : 'bg-[#2b2c3f] divide-gray-700'}`}
            >
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={`divide-y ${theme.palette.mode === 'light' ? 'hover:bg-gray-50 divide-gray-200' : 'hover:bg-gray-700/50 divide-gray-700'} transition-colors`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className='px-3 py-3'
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize() || cell.column.columnDef.minSize,
                        maxWidth: cell.column.columnDef.maxSize || 'none',
                        borderRight: 0,
                        borderLeft: 0
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {enablePagination && (
        // <TablePagination
        //   rowsPerPageOptions={[25]}
        //   component='div'
        //   count={data.length}
        //   rowsPerPage={rowsPerPage}
        //   page={page}
        //   onPageChange={handleChangePage}
        //   onRowsPerPageChange={handleChangeRowsPerPage}
        // />
        <div
          className={`${theme.palette.mode === 'light' ? 'bg-white border-gray-200' : 'bg-[#2b2c3f] border-gray-700'} px-6 py-3 border-t flex items-center justify-between`}
        >
          <div
            className={`flex items-center text-sm ${theme.palette.mode === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
          >
            <span>
              Showing {table.getRowModel().rows.length} of {data.length} {caregiverTable ? 'caregivers' : 'clients'}
            </span>
            {table.getSelectedRowModel().rows.length > 0 && (
              <span className='ml-4 text-indigo-600 dark:text-indigo-400'>
                {table.getSelectedRowModel().rows.length} selected
              </span>
            )}
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => handleChangePage(null, page - 1)}
              disabled={page === 0}
              className={`bg-transparent cursor-pointer px-3 py-1 text-sm ${theme.palette.mode === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'} disabled:opacity-50 transition-colors`}
            >
              Previous
            </button>
            <span className={`px-3 py-1 text-sm ${theme.palette.mode === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
              Page 1 of 1
            </span>
            <button
              onClick={() => handleChangePage(null, page + 1)}
              disabled={page === totalPages - 1}
              className={`bg-transparent cursor-pointer px-3 py-1 text-sm ${theme.palette.mode === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'} disabled:opacity-50 transition-colors`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default TanStackTable

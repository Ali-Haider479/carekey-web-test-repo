import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Checkbox,
  IconButton,
  Box,
  Typography,
  SxProps,
  Theme,
  TextField,
  Select,
  MenuItem
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { useTheme } from '@emotion/react'

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

type StatusOption = 'Approved' | 'Rejected' | 'Pending'

const STATUS_OPTIONS: StatusOption[] = ['Approved', 'Rejected', 'Pending']
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
}

function ReactTable<T extends { subRows?: T[] }>({
  columns,
  data,
  keyExtractor,
  enableRowSelect = false,
  enableRowExpand = false,
  enablePagination = true,
  pageSize = 10,
  onSelectionChange,
  expandedContent,
  onSort,
  containerStyle,
  headerStyle,
  rowStyle,
  selectedRowStyle,
  expandedRowStyle,
  stickyHeader = false,
  maxHeight,
  showBorder = true,
  dense = false,
  size = 'medium',
  editingId = null,
  onEditChange
}: ReactTableProps<T>) {
  const [selected, setSelected] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(pageSize)
  const [sortConfig, setSortConfig] = useState<{ columnId: string; direction: 'asc' | 'desc' } | null>(null)
  const [editedData, setEditedData] = useState<{ [key: string]: any }>({})

  const theme: any = useTheme()

  useEffect(() => {
    if (editingId === null) {
      setEditedData({})
    }
  }, [editingId])

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
    console.log('EDIT item', item, column)
    const id = Number(keyExtractor(item))
    const isRowEditing = editingId === id
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
              minWidth: 120,
              '&:before': { borderBottomColor: 'rgba(0, 0, 0, 0.1)' },
              '&:hover:not(.Mui-disabled):before': { borderBottomColor: 'primary.main' }
            }}
          >
            {STATUS_OPTIONS.map(status => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
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
      newSelected = [...selected, id]
    } else {
      newSelected = selected.filter(itemId => itemId !== id)
    }

    setSelected(newSelected)
    const selectedItems = getAllItems(data).filter(item => newSelected.includes(keyExtractor(item)))
    onSelectionChange?.(selectedItems)
  }

  const handleExpand = (id: string) => {
    setExpanded(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const renderRow = (item: T, level: number = 0, parentExpanded: boolean = true) => {
    const id = keyExtractor(item)
    const isItemSelected = selected.includes(id.toString())
    const isItemExpanded = expanded.includes(id.toString())
    const hasSubRows = item.subRows && item.subRows.length > 0

    return (
      <React.Fragment key={id}>
        <TableRow
          hover
          sx={
            {
              ...rowStyle,
              ...(isItemSelected ? selectedRowStyle : {}),
              backgroundColor:
                level > 0
                  ? theme.palette.mode === 'light'
                    ? 'rgba(0, 0, 0, 0.02)'
                    : 'rgba(255, 255, 255, 0.02)'
                  : 'inherit',
              display: level === 0 || parentExpanded ? 'table-row' : 'none',
              '& > td': {
                borderBottom: `1px solid ${theme.palette.divider}`
              }
            } as SxProps<Theme>
          }
        >
          <TableCell padding='none' sx={{ width: '48px' }}>
            {hasSubRows && (
              <IconButton size='small' onClick={() => handleExpand(id.toString())} sx={{ ml: 1 }}>
                {isItemExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            )}
          </TableCell>
          {enableRowSelect && (
            <TableCell padding='checkbox'>
              <Checkbox checked={isItemSelected} onChange={() => handleSelect(id.toString(), item)} />
            </TableCell>
          )}
          {columns.map((column, index) => (
            <TableCell
              key={column.id}
              align={column.align}
              sx={{
                ...column.cellStyle,
                pl: level > 0 && index === 0 ? 6 : undefined
              }}
            >
              {renderCell(item, column)}
            </TableCell>
          ))}
        </TableRow>
        {hasSubRows && item.subRows?.map(subRow => renderRow(subRow, level + 1, isItemExpanded))}
      </React.Fragment>
    )
  }

  const paginatedData = enablePagination ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : data
  return (
    <Box>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight,
          boxShadow: showBorder ? undefined : 'none',
          ...containerStyle,
          backgroundColor: 'transparent'
        }}
      >
        <Table stickyHeader={stickyHeader} size={size}>
          <TableHead>
            <TableRow sx={headerStyle}>
              <TableCell padding='none' sx={{ width: '48px' }} />
              {enableRowSelect && (
                <TableCell padding='checkbox'>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < getAllIds(data).length}
                    checked={data.length > 0 && selected.length === getAllIds(data).length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column, index) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{
                    ...column.headerStyle,
                    borderBottom: `1px solid ${theme.palette.divider}`, // Bottom border for the header
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    fontSize: '0.875rem'
                    // position: 'relative', // Required for the pseudo-element
                    // '&:not(:last-child)::after': {
                    //   content: '""', // Add a pseudo-element for the vertical divider
                    //   position: 'absolute',
                    //   right: '20%',
                    //   top: '50%', // Center vertically
                    //   transform: 'translateY(-50%)', // Center vertically
                    //   height: '40%', // Adjust the height of the divider
                    //   width: '1px', // Width of the divider
                    //   backgroundColor: theme.palette.divider // Use the theme's divider color
                    // }
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{paginatedData.map(item => renderRow(item))}</TableBody>
        </Table>
      </TableContainer>

      {enablePagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component='div'
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Box>
  )
}

export default ReactTable

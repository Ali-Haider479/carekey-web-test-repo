'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { UsersType } from '@/types/apps/userTypes'
import type { Locale } from '@configs/i18n'

// Component Imports
import TenantTableFilters from './TenantTableFilters'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import axios from 'axios'
import DropdownMenu from '@/components/layout/front-pages/DropdownMenu'
import { CircularProgress } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTenants, setCurrentViewTenant } from '@/redux-store/slices/tenant'
import { useAppDispatch } from '@/hooks/useDispatch'
import { dark, light } from '@mui/material/styles/createPalette'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type UsersTypeWithAction = UsersType & {
  action?: string
}

type UserRoleType = {
  [key: string]: { icon: string; color: string }
}

type UserStatusType = {
  [key: string]: ThemeColor
}

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <TextField
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      size='small'
      sx={{
        '& .MuiOutlinedInput-root': {
          '&.Mui-focused fieldset': {
            borderColor: '#A081D6' // Update border color when focused
          }
        }
      }}
    />
  )
}

// Vars
const userRoleObj: UserRoleType = {
  admin: { icon: 'bx-crown', color: 'error' },
  author: { icon: 'bx-desktop', color: 'warning' },
  editor: { icon: 'bx-edit', color: 'info' },
  maintainer: { icon: 'bx-pie-chart-alt', color: 'success' },
  subscriber: { icon: 'bx-user', color: 'primary' }
}

const userStatusObj: UserStatusType = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

interface Tenant {
  id: number
  companyName: string
  billingEmail: string
  contactNumber: string
  country: string
  address: string
  vatNumber: string
  subscriptionStartDate: string
  subscriptionRenewalDate: string
  status: string
  users: any
}

type TenantWithAction = Tenant & {
  action: string
  plan: string
}

// Column Definitions
const columnHelper = createColumnHelper<TenantWithAction>()

const UserListTable = ({ tableData }: { tableData?: UsersType[] }) => {
  // States
  const [addUserOpen, setAddUserOpen] = useState(false)
  const dispatch = useAppDispatch()
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<any>([])
  const [filteredData, setFilteredData] = useState<any>(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const tenantStore = useSelector((state: { tenantReducer: any }) => state.tenantReducer)

  // Hooks
  const { lang: locale } = useParams()

  useEffect(() => {
    dispatch(fetchTenants())
  }, [dispatch])

  // Update data when tenants change
  useEffect(() => {
    if (tenantStore.tenants && tenantStore.tenants.length > 0) {
      setData(tenantStore.tenants)
      setFilteredData(tenantStore.tenants) // Also update filteredData
    }
  }, [tenantStore.tenants]) // Add dependency on tenantStore.tenants

  const columns = useMemo<ColumnDef<TenantWithAction, any>[]>(
    () => [
      columnHelper.accessor('companyName', {
        header: 'Company Name'
      }),
      columnHelper.accessor('users', {
        header: 'Admin User',
        cell: ({ row }) => {
          const userName = row?.original?.users[0]?.userName
          return userName
        }
      }),
      columnHelper.accessor('plan', {
        header: 'Current Plan',
        cell: ({ row }) => {
          return 'Free tier'
        }
      }),
      columnHelper.accessor('billingEmail', {
        header: 'Billing Email'
      }),
      columnHelper.accessor('contactNumber', {
        header: 'Contact Number'
      }),
      // columnHelper.accessor('country', {
      //   header: 'Country'
      // }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                row.original.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {row.original.status}
            </span>
          </div>
        )
      }),
      // columnHelper.accessor('subscriptionRenewalDate', {
      //   header: 'Renewal Date',
      //   cell: ({ row }) => {
      //     const date = new Date(row.original.subscriptionRenewalDate)
      //     return date.toLocaleDateString()
      //   }
      // }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => {
          const dispatch = useDispatch()
          const handleViewClick = () => {
            // dispatch(setCurrentViewTenant(row.original))
            localStorage.setItem('view-tenant', JSON.stringify(row.original))
          }

          return (
            <div className='flex items-center'>
              <IconButton onClick={() => setData(data?.filter((product: any) => product.id !== row.original.id))}>
                <i className='bx-trash text-textSecondary text-[22px]' />
              </IconButton>
              <IconButton>
                <Link
                  href={getLocalizedUrl(`/apps/accounts/${row.original.id}/detail`, locale as Locale)}
                  className='flex'
                  onClick={handleViewClick}
                >
                  <i className='bx-show text-textSecondary text-[22px]' />
                </Link>
              </IconButton>
              <OptionMenu
                iconButtonProps={{ size: 'medium' }}
                iconClassName='text-textSecondary'
                options={[
                  {
                    text: 'Download',
                    icon: 'bx-download text-[22px]',
                    menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
                  },
                  {
                    text: 'Edit',
                    icon: 'bx-edit text-[22px]',
                    menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
                  }
                ]}
              />
            </div>
          )
        },
        enableSorting: false
      })
    ],
    [data, setData, locale]
  )

  const table = useReactTable({
    data: filteredData as unknown as TenantWithAction[],
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
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  // const getAvatar = (params: Pick<UsersType, 'avatar' | 'fullName'>) => {
  //   const { avatar, fullName } = params

  //   if (avatar) {
  //     return <CustomAvatar src={avatar} size={34} />
  //   } else {
  //     return <CustomAvatar size={34}>{getInitials(fullName as string)}</CustomAvatar>
  //   }
  // }

  // Update loading state
  useEffect(() => {
    if (data && data.length > 0) {
      setIsLoading(false)
    }
  }, [data])

  const handleClick = () => {
    const localizedUrl = getLocalizedUrl('/apps/user/view', locale as Locale) // Adjust based on how your localization works
    // router.push(localizedUrl) // Use router.push for navigation
  }

  return (
    <>
      {isLoading ? (
        <Card>
          <div className='flex items-center justify-center p-10'>
            <CircularProgress />
          </div>
        </Card>
      ) : !data?.length ? (
        <Card>
          <div className='flex flex-col items-center justify-center p-10 gap-2'>
            <Icon className='bx-folder-open text-6xl text-textSecondary' />
            <Typography variant='h6'>No Data Available</Typography>
            <Typography variant='body2' className='text-textSecondary'>
              No records found. Click 'Add New User' to create one.
            </Typography>
            <Button
              variant='contained'
              startIcon={<i className='bx-plus' />}
              component={Link}
              href={getLocalizedUrl('/apps/accounts/create-tenant', locale as Locale)}
              className='mt-4'
              sx={{ backgroundColor: '#4B0082' }}
            >
              Add New User
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader title='Filters' className='pbe-4' />
            <TenantTableFilters setData={setFilteredData} tableData={data} />
            <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
              <Button
                color='secondary'
                variant='tonal'
                startIcon={<i className='bx-export' />}
                className='max-sm:is-full'
              >
                Export
              </Button>
              <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
                <DebouncedInput
                  value={globalFilter ?? ''}
                  onChange={value => setGlobalFilter(String(value))}
                  placeholder='Search User'
                  className='max-sm:is-full'
                />

                <Button
                  variant='contained'
                  startIcon={<i className='bx-plus' />}
                  href={getLocalizedUrl('/apps/accounts/create-tenant', locale as Locale)}
                  className='max-sm:is-full'
                  sx={{ backgroundColor: '#4B0082' }}
                >
                  Add New User
                </Button>
              </div>
            </div>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  {table?.getHeaderGroups?.()?.map(headerGroup => (
                    <tr
                      key={headerGroup.id}
                      style={{
                        backgroundColor: `${dark ? '#2b2c3f' : '#f5f5f5'} ${light ? '#f5f5f5' : '#2b2c3f'}`, // Explicitly set gray background
                        borderBottom: `1px solid ${dark ? '#36374a' : '#E0E0E0'} ${light ? '#E0E0E0' : '#36374a'}`
                      }}
                    >
                      {headerGroup.headers.map(header => (
                        <th key={header.id}>
                          {header.isPlaceholder ? null : (
                            <>
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
                            </>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {!table?.getRowModel?.() ? (
                    <tr>
                      <td colSpan={table?.getAllColumns?.()?.length ?? 1} className='text-center p-4'>
                        Loading...
                      </td>
                    </tr>
                  ) : table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={table.getAllColumns().length} className='text-center p-4'>
                        No data available
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
              component={() => <TablePaginationComponent table={table} />}
              count={table.getFilteredRowModel().rows.length}
              rowsPerPage={table.getState().pagination.pageSize}
              page={table.getState().pagination.pageIndex}
              onPageChange={(_, page) => {
                table.setPageIndex(page)
              }}
            />
          </Card>
        </>
      )}
    </>
  )
}

export default UserListTable

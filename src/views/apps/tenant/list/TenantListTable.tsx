'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { styled } from '@mui/material/styles'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports

import { Avatar, CircularProgress, useTheme } from '@mui/material'

import { useSelector } from 'react-redux'

import type { ThemeColor } from '@core/types'
import type { UsersType } from '@/types/apps/userTypes'
import type { Locale } from '@configs/i18n'

// Component Imports
import TenantTableFilters from './TenantTableFilters'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import { fetchTenants } from '@/redux-store/slices/tenant'
import { useAppDispatch } from '@/hooks/useDispatch'
import ReactTable from '@/@core/components/mui/ReactTable'
import TenantActionButton from '@/@core/components/mui/TenantActionButton'
import axios from 'axios'
import { CarekeyTenantDarkLogo, CarekeyTenantLightLogo } from '@/@core/svg/CarekeyTenantLogo'

type UserRoleType = {
  [key: string]: { icon: string; color: string }
}

type UserStatusType = {
  [key: string]: ThemeColor
}

// Styled Components
const Icon = styled('i')({})

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

// Column Definitions

const UserListTable = ({ tableData }: { tableData?: UsersType[] }) => {
  // States
  const dispatch = useAppDispatch()
  const [data, setData] = useState<any>([])
  const [filteredData, setFilteredData] = useState<any>(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const tenantStore = useSelector((state: { tenantReducer: any }) => state.tenantReducer)
  const [tenantFilteredList, setTenantFilteredList] = useState<any>([])
  const theme = useTheme()
  const dark = theme.palette.mode === 'dark'

  const fetchInitialData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tenant`)

      setTenantFilteredList(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching initial data:', error)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const handleFilteredData = (filteredData: any) => {
    setTenantFilteredList(filteredData)
  }

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

  console.log('Filtreddata', filteredData)

  const handleEdit = () => {
    console.log(' CLICKED EDIT')
  }

  const handleDownload = () => {
    console.log(' CLICKED DOWNLOAD')
  }

  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ').filter(Boolean) // Split and remove extra spaces

    if (names.length === 1) {
      return names[0][0].toUpperCase() // Only one name, return its initial
    }

    if (names.length >= 2) {
      return `${names[0][0].toUpperCase()}${names[names.length - 1][0].toUpperCase()}` // First and last name initials
    }
    return '' // Return empty string if no valid names
  }

  const columns = [
    {
      id: 'companyName',
      label: 'COMPANY NAME',
      minWidth: 170,
      render: (user: any) => (
        <div className='flex flex-row'>
          <div className='flex items-center justify-center'>
            {dark ? <CarekeyTenantDarkLogo /> : <CarekeyTenantLightLogo />}
          </div>
          <div className='ml-2'>
            <Typography className={`font-semibold`} color='primary'>
              {user?.companyName}
            </Typography>
            <Typography className='text-sm'>{user?.billingEmail}</Typography>
          </div>
        </div>
      )
    },
    {
      id: 'caregiverName',
      label: 'CONTACT',
      minWidth: 170,
      render: (user: any) => (
        <div className='flex flex-row'>
          <div>
            <Avatar src={user?.users?.[0].profileImageUrl} alt={user?.firstName} />
          </div>
          <div className='ml-2'>
            <Typography className='font-semibold' color='primary'>
              {user?.users?.[0].userName}
            </Typography>
            <Typography className='text-sm'>{user?.users?.[0].emailAddress}</Typography>
          </div>
        </div>
      )
    },
    {
      id: 'plan',
      label: 'PLAN',
      minWidth: 170,
      render: (user: any) => <Typography color='primary'>Enterprise</Typography>
    },
    {
      id: 'contactNumber',
      label: 'PHONE NUMBER',
      minWidth: 170,
      render: (user: any) => <Typography color='primary'>{user?.contactNumber}</Typography>
    },
    {
      id: 'claimStatus',
      label: 'STATUS',
      minWidth: 170,
      render: (user: any) => (
        <div
          className={`flex items-center justify-center rounded-md ${
            user?.tsApprovalStatus === 'Pending'
              ? 'bg-[#FDB528]'
              : user?.tsApprovalStatus === 'Inactive'
                ? 'bg-[#6D788D]'
                : 'bg-[#eefbe5]'
          }`}
        >
          <Typography
            color='primary'
            className={`font-semibold !text-opacity-100 !opacity-100 ${
              user?.tsApprovalStatus === 'Pending'
                ? 'text-[#FFAB00]'
                : user?.tsApprovalStatus === 'Inactive'
                  ? 'text-[#8592A3]'
                  : 'text-[#71DD37]'
            }`}
          >
            {user?.tsApprovalStatus || 'Active'}
          </Typography>
        </div>
      )
    },
    {
      id: 'actions',
      label: 'ACTION',
      editable: false,
      render: (row: any) => (
        <TenantActionButton
          actions={['view', 'delete', 'download', 'edit']}
          row={row}
          locale={locale as any}
          getLocalizedUrl={getLocalizedUrl}
          onDelete={row => setData(data?.filter((product: any) => product.id !== row.id))}
          onEdit={handleEdit}
          onDownload={handleDownload}
          showEdit={false}
          showDelete={true}
          showDownload={true}
          onViewClick={row => {
            localStorage.setItem('view-tenant', JSON.stringify(row))
          }}
        />
      )
    }
  ]

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
              No records found. Click 'Add New Tenant' to create one.
            </Typography>
            <Button
              variant='contained'
              startIcon={<i className='bx-plus' />}
              component={Link}
              href={getLocalizedUrl('/apps/accounts/create-tenant', locale as Locale)}
              className='mt-4'
              sx={{ backgroundColor: '#4B0082' }}
            >
              Add New Tenant
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader title='Filters' className='pbe-4' />
            <TenantTableFilters setData={setFilteredData} tableData={data} onFilterApplied={handleFilteredData} />
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
                  Add New Tenant
                </Button>
              </div>
            </div>
            {isLoading ? (
              <div className='flex items-center justify-center p-10'>
                <CircularProgress />
              </div>
            ) : (
              <ReactTable
                columns={columns}
                data={filteredData}
                keyExtractor={user => user.id.toString()}
                enableRowSelect
                enablePagination
                pageSize={5}
                stickyHeader
                maxHeight={600}
                containerStyle={{ borderRadius: 2 }}
              />
            )}
          </Card>
        </>
      )}
    </>
  )
}

export default UserListTable

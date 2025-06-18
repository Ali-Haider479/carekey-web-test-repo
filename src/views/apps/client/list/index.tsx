'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import { useEffect, useState } from 'react'
import axios from 'axios'

// Component Imports
import Dropdown from '@/@core/components/mui/DropDown'

import type { ClientTypes } from '@/types/apps/clientTypes'
import { Avatar, Button, Card, Icon, MenuItem, TextField, Typography, CircularProgress } from '@mui/material'
import { useRouter } from 'next/navigation'
import ReactTable from '@/@core/components/mui/ReactTable'
import { useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/mui/TextField'
import { USStates } from '@/utils/constants'
import api from '@/utils/api'
import ClientTable from './ClientsTable'
import TanStackTable from '@/@core/components/mui/TanStackTable'
import { Mail, PeopleOutline, Phone } from '@mui/icons-material'
import { useTheme } from '@emotion/react'

interface DefaultStateType {
  pmiNumber: string
  state: string
  clientName: string
  primaryPhoneNumber: string
  serviceTypes: string
}

const defaultState: DefaultStateType = {
  pmiNumber: '',
  state: '',
  serviceTypes: '',
  clientName: '',
  primaryPhoneNumber: ''
}

const ClientListApps = () => {
  const router = useRouter()
  const [data, setData] = useState<ClientTypes[]>([])
  const [dataWithProfileImg, setDataWithProfileImg] = useState<ClientTypes[]>([])
  const [search, setSearch] = useState('')
  const [filteredData, setFilteredData] = useState<ClientTypes[]>([])
  const [pmiNumber, setPmiNumber] = useState<DefaultStateType>(defaultState)
  const [state, setState] = useState<DefaultStateType>(defaultState)
  const [serviceTypes, setServiceTypes] = useState<DefaultStateType>(defaultState)
  const [clientName, setClientName] = useState<DefaultStateType>(defaultState)
  const [primaryPhoneNumber, setPrimaryPhoneNumber] = useState<DefaultStateType>(defaultState)
  const [totalClients, setTotalClients] = useState(0)
  const [filterData, setFilterData] = useState()
  const [isLoading, setIsLoading] = useState(true)

  const theme: any = useTheme()
  const lightTheme = theme.palette.mode === 'light'
  const darkTheme = theme.palette.mode === 'dark'

  const statusOptions = [
    { key: 1, value: 'pending', displayValue: 'Pending' },
    { key: 2, value: 'active', displayValue: 'Active' },
    { key: 3, value: 'inactive', displayValue: 'Inactive' }
  ]

  useEffect(() => {
    fetchData()
    getServiceTypes()
  }, [])

  const fetchData = async () => {
    try {
      const response = await api.get(`/client`)
      console.log('RESPONSE CLIENT DATA', response)
      setData(response.data)
      setTotalClients(response.data.length)
    } catch (error) {
      console.log('CLIENT DATA ERROR', error)
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 600)
    }
  }

  useEffect(() => {
    if (data?.length > 0) {
      fetchProfileImages()
    }
  }, [data])

  useEffect(() => {
    if (!search) {
      setFilteredData(dataWithProfileImg)
      return
    }

    const filtered = dataWithProfileImg.filter(item => {
      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase()
      return fullName.includes(search.toLowerCase())
    })

    setFilteredData(filtered)
  }, [search, dataWithProfileImg])

  const getProfileImage = async (key: string) => {
    try {
      const res = await api.get(`/client/getProfileUrl/${key}`)
      return res.data
    } catch (err) {
      throw Error(`Error in fetching profile image url, ${err}`)
    }
  }

  const fetchProfileImages = async () => {
    if (data) {
      const dataWithPhotoUrls = await Promise.all(
        data?.map(async (item: any) => {
          const profileImgUrl =
            item?.profileImgUrl !== null ? await getProfileImage(item?.profileImgUrl) : item?.profileImgUrl
          return {
            ...item,
            profileImgUrl: profileImgUrl
          }
        })
      )
      setDataWithProfileImg(dataWithPhotoUrls)
      setFilteredData(dataWithPhotoUrls)
    }
  }

  const getServiceTypes = async () => {
    try {
      const serviceTypesResponse = await api.get(`/service`)
      console.log('Service Types --> ', serviceTypesResponse)
      setServiceTypes(serviceTypesResponse.data)
    } catch (error) {
      console.error('Error getting service types: ', error)
    }
  }

  const handleNext = (id: any) => {
    router.push(`/en/apps/client/${id}/detail`)
  }

  const {
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const onSubmit = async () => {
    try {
      // Only add parameters that have values
      const queryParams = new URLSearchParams()

      if (pmiNumber.pmiNumber) queryParams.append('pmiNumber', pmiNumber.pmiNumber)
      if (primaryPhoneNumber.primaryPhoneNumber) {
        queryParams.append('primaryPhoneNumber', primaryPhoneNumber.primaryPhoneNumber)
      }
      if (clientName.clientName) {
        queryParams.append('clientName', clientName.clientName)
      }
      if (state.state) queryParams.append('state', state.state)
      if (serviceTypes.serviceTypes) queryParams.append('serviceType', serviceTypes.serviceTypes)
      queryParams.append('page', '1')
      queryParams.append('limit', '10')

      // If no filters are applied, fetch all data
      if (queryParams.toString() === 'page=1&limit=10') {
        const response = await api.get(`/client`)
        setDataWithProfileImg(response.data)
        setFilteredData(response.data)
        return
      }
      console.log('QUERY PARAMS', queryParams)
      // Fetch filtered data
      const filterResponse = await api.get(`/client/filtered/?${queryParams.toString()}`)
      console.log('Filter response ----> ', filterResponse.data.data)
      setDataWithProfileImg(filterResponse.data.data)
      setFilteredData(filterResponse.data.data)
    } catch (error) {
      console.error('error filtering data', error)
    }
  }

  const handleReset = async () => {
    try {
      setPmiNumber(defaultState)
      setState(defaultState)
      setServiceTypes(defaultState)
      setClientName(defaultState)
      setPrimaryPhoneNumber(defaultState)

      const response = await api.get(`/client`)
      setDataWithProfileImg(response.data)
    } catch (error) {
      console.error('Error Reseting Filters: ', error)
    }
  }

  const newColumns = [
    {
      id: 'clientName',
      label: 'CLIENT NAME',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        const getInitials = (name: string) => {
          return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
        }
        return (
          <div className='cursor-pointer flex items-center space-x-2 min-w-0' onClick={() => handleNext(user?.id)}>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs shadow-lg'>
                {user?.profileImgUrl ? (
                  <Avatar alt={user.firstName} src={user?.profileImgUrl} className='w-full h-full' />
                ) : (
                  getInitials(`${user.firstName} ${user.lastName}`)
                )}
              </div>
            </div>
            <div className='min-w-0 flex-1'>
              <p className={`text-sm font-medium ${lightTheme ? 'text-gray-900' : 'text-gray-100'} truncate`}>
                {(() => {
                  const nameParts = user?.firstName.trim().split(' ')
                  if (nameParts.length >= 2) {
                    const firstName = nameParts[0]
                    const lastName = nameParts.slice(1).join(' ')
                    return `${lastName}, ${firstName}`
                  }
                  return `${user?.firstName} ${user?.lastName}`
                })()}
              </p>
              <p className={`text-sm ${lightTheme ? 'text-gray-500' : 'text-gray-400'} truncate`}>
                PMI: {user?.pmiNumber || 'N/A'}
              </p>
            </div>
          </div>
        )
      }
    },
    {
      id: 'admissionDate',
      label: 'ADMISSION DATE',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (item: any) => {
        const formatDate = (dateString: string) => {
          if (!dateString) return 'N/A'
          const date = new Date(dateString)
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
          })
        }
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
            <Typography color='primary' className='text-sm'>
              {formatDate(item?.admissionDate)}
            </Typography>
          </div>
        )
      }
    },
    {
      id: 'dateOfBirth',
      label: 'BIRTH DATE',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (item: any) => {
        const formatDate = (dateString: string) => {
          if (!dateString) return 'N/A'
          const date = new Date(dateString)
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
          })
        }
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
            <Typography color='primary'>{formatDate(item?.dateOfBirth)}</Typography>
          </div>
        )
      }
    },
    {
      id: 'ssn',
      label: 'SOCIAL SECURITY',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (item: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
            <Typography color='primary' className='text-sm'>
              {item?.ssn}
            </Typography>
          </div>
        )
      }
    },
    {
      id: 'insuranceCode',
      label: 'INSURANCE CODE',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (item: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
            <Typography color='primary' className='text-sm'>
              {item?.insuranceCode ? item?.insuranceCode : 'N/A'}
            </Typography>
          </div>
        )
      }
    },
    {
      id: 'emailId',
      label: 'CONTACT',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(user?.id)}>
            <div className='space-y-1 min-w-0'>
              <div className='flex items-center text-sm min-w-0'>
                <Mail
                  className={`w-3 h-3 mr-1 ${theme.palette.mode === 'light' ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`}
                />
                <Typography
                  className={`${theme.palette.mode === 'light' ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'} truncate transition-colors min-w-0 text-sm`}
                >
                  {user?.emailId ? user?.emailId : 'N/A'}
                </Typography>
              </div>
              <div className='flex items-center text-sm min-w-0'>
                <Phone
                  className={`w-3 h-3 mr-1 ${theme.palette.mode === 'light' ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`}
                />
                <Typography
                  className={`${lightTheme ? 'text-gray-600 hover:text-gray-800' : 'text-gray-300 hover:text-gray-100'} transition-colors whitespace-nowrap text-sm`}
                >
                  {user?.primaryPhoneNumber}
                </Typography>
              </div>
            </div>
          </div>
        )
      }
    }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 1, boxShadow: 3, padding: 6 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <span className='text-[20px]'>
                <strong>Filters</strong>
              </span>
            </Grid>
            <Grid container spacing={6} marginTop={4}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant='h6' className='mb-2'>
                  Client Name
                </Typography>
                <CustomTextField
                  fullWidth
                  id='client Name'
                  placeholder='Client Name'
                  value={clientName.clientName}
                  onChange={e => setClientName({ ...clientName, clientName: e.target.value })}
                  slotProps={{
                    select: { displayEmpty: true }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant='h6' className='mb-2'>
                  PMI Number
                </Typography>
                <CustomTextField
                  fullWidth
                  id='pmi-number'
                  placeholder='PMI Number'
                  value={pmiNumber.pmiNumber}
                  onChange={e => setPmiNumber({ ...pmiNumber, pmiNumber: e.target.value })}
                  slotProps={{
                    select: { displayEmpty: true }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant='h6' className='mb-2'>
                  Service types
                </Typography>
                <CustomTextField
                  select
                  fullWidth
                  id='caregiver-state'
                  placeholder='Caregiver State'
                  value={serviceTypes.serviceTypes}
                  onChange={e => setServiceTypes({ ...serviceTypes, serviceTypes: e.target.value })}
                  slotProps={{
                    select: { displayEmpty: true }
                  }}
                >
                  <MenuItem value={'Personal Care Assistant (PCA)'}>Personal Care Assistant (PCA)</MenuItem>
                  <MenuItem value={'Individualized Home Supports (IHS)'}>Individualized Home Supports (IHS)</MenuItem>
                </CustomTextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant='h6' className='mb-2'>
                  Client Phone Number
                </Typography>
                <CustomTextField
                  fullWidth
                  id='primary-phone-number'
                  placeholder='Client Phone Number'
                  value={primaryPhoneNumber.primaryPhoneNumber}
                  onChange={e => setPrimaryPhoneNumber({ ...primaryPhoneNumber, primaryPhoneNumber: e.target.value })}
                  slotProps={{
                    select: { displayEmpty: true }
                  }}
                />
              </Grid>
              <Grid container spacing={12}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button
                    type='submit'
                    variant='contained'
                    className={`p-1 ${lightTheme ? 'bg-[#4B0082]' : 'bg-[#7112B7]'}`}
                  >
                    Apply
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button
                    onClick={handleReset}
                    variant='contained'
                    className={`p-1 ${lightTheme ? 'bg-[#FF5B35]' : 'bg-[#FF5B3F]'}`}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          {/* <ClientTable isLoading={isLoading} data={data} /> */}
          <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
            <Grid
              container
              spacing={2}
              sx={{ mb: 2, pt: 4, pb: 2, px: 5, display: 'flex', justifyContent: 'flex-end' }}
            >
              <Grid size={{ xs: 12, sm: 6, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                <span
                  className={`inline-flex border-[1px] items-center px-3 py-1 rounded-full text-sm font-medium ${theme.palette.mode === 'light' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-900/30 text-indigo-300 border-indigo-700'}`}
                >
                  <PeopleOutline className='w-4 h-4 mr-1' />
                  {totalClients} {totalClients === 1 ? 'Client' : 'Clients'}
                </span>
                <Button
                  onClick={() => router.push('/en/apps/client/add-client')}
                  variant='contained'
                  sx={{ backgroundColor: lightTheme ? '#4B0082' : '#7112B7', color: '#fff', fontWeight: 'bold' }}
                >
                  Add Client
                </Button>
              </Grid>
            </Grid>
            {isLoading ? (
              <div className='flex items-center justify-center p-10'>
                <CircularProgress />
              </div>
            ) : !data.length ? ( // Changed from dataWithProfileImg to filteredData
              <Card>
                <div className='flex flex-col items-center justify-center p-10 gap-2'>
                  <Icon className='bx-folder-open text-6xl text-textSecondary' />
                  <Typography variant='h6'>No Data Available</Typography>
                  <Typography variant='body2' className='text-textSecondary'>
                    No records found. Click 'Add New Client' to create one.
                  </Typography>
                  <Button
                    variant='contained'
                    startIcon={<i className='bx-plus' />}
                    onClick={() => {
                      router.push('/en/apps/client/add-client')
                    }}
                    className='mt-4'
                    sx={{ backgroundColor: lightTheme ? '#4B0082' : '#7112B7' }}
                  >
                    Add New Client
                  </Button>
                </div>
              </Card>
            ) : (
              <TanStackTable
                columns={newColumns}
                data={filteredData} // Changed from dataWithProfileImg to filteredData
                keyExtractor={item => item.id.toString()}
                enablePagination
                pageSize={25}
                stickyHeader
                maxHeight={600}
                containerStyle={{ borderRadius: 2 }}
              />
            )}
          </Card>
        </Grid>
      </Grid>
    </form>
  )
}

export default ClientListApps

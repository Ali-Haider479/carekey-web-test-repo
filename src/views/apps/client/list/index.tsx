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

interface DefaultStateType {
  pmiNumber: string
  state: string
  serviceTypes: string
}

const defaultState: DefaultStateType = {
  pmiNumber: '',
  state: '',
  serviceTypes: ''
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
  const [filterData, setFilterData] = useState()
  const [isLoading, setIsLoading] = useState(true)

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
      render: (item: any) => {
        return (
          <div className='w-full h-full cursor-pointer'>
            <div
              style={{ height: '50px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}
              onClick={() => handleNext(item?.id)}
            >
              <Avatar alt={item.firstName} src={item.profileImgUrl} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong>{`${item.firstName} ${item.lastName}`}</strong>
              </div>
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
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
            <Typography color='primary'>{item?.admissionDate}</Typography>
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
            <Typography color='primary'>{item?.ssn}</Typography>
          </div>
        )
      }
    },
    {
      id: 'pmiNumber',
      label: 'PMI NUMBER',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (item: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
            <Typography color='primary'>{item?.pmiNumber}</Typography>
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
            <Typography color='primary'>{item?.insuranceCode}</Typography>
          </div>
        )
      }
    },
    {
      id: 'emailId',
      label: 'EMAIL ADDRESS',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (item: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
            <Typography color='primary'>{item?.emailId}</Typography>
          </div>
        )
      }
    },
    {
      id: 'primaryPhoneNumber',
      label: 'PHONE NUMBER',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (item: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
            <Typography color='primary'>{item?.primaryPhoneNumber}</Typography>
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
              <Grid size={{ xs: 12, sm: 4 }}>
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
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant='h6' className='mb-2'>
                  State
                </Typography>
                <CustomTextField
                  select
                  fullWidth
                  id='caregiver-state'
                  placeholder='Caregiver State'
                  value={state.state}
                  onChange={e => setState({ ...state, state: e.target.value })}
                  slotProps={{
                    select: { displayEmpty: true }
                  }}
                >
                  {USStates.map((state: any) => (
                    <MenuItem key={state.key} value={state.value}>
                      {state.optionString}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
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
              <Grid container spacing={12}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button type='submit' variant='outlined' className='p-1'>
                    Apply
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button onClick={handleReset} color='error' variant='outlined' className='p-1'>
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
            <Grid sx={{ p: 5 }}>
              <div className='flex flex-row justify-between'>
                <TextField
                  className='w-[50%]' // Ensures the input takes up most of the width
                  placeholder='Search name'
                  variant='outlined'
                  size='small'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <span className='text-gray-500 ml-2 mt-2'>
                        <i className='bx bx-search' />
                      </span>
                    )
                  }}
                />
                <Button
                  variant='contained'
                  onClick={() => {
                    router.push('/en/apps/client/add-client')
                  }}
                >
                  Add Client
                </Button>
              </div>
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
                    sx={{ backgroundColor: '#4B0082' }}
                  >
                    Add New Client
                  </Button>
                </div>
              </Card>
            ) : (
              <ReactTable
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

'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import { useEffect, useState } from 'react'
import axios from 'axios'

// Component Imports
import Dropdown from '@/@core/components/mui/DropDown'

import type { ClientTypes } from '@/types/apps/clientTypes'
import { Avatar, Button, Card, Icon, MenuItem, TextField, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import ReactTable from '@/@core/components/mui/ReactTable'
import { useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/mui/TextField'
import USStates from '@/utils/constants'

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
  const [pmiNumber, setPmiNumber] = useState<DefaultStateType>(defaultState)
  const [state, setState] = useState<DefaultStateType>(defaultState)
  const [serviceTypes, setServiceTypes] = useState<DefaultStateType>(defaultState)
  const [filterData, setFilterData] = useState()

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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client`)
      console.log('RESPONSE CLIENT DATA', response)
      setData(response.data)
    } catch (error) {
      console.log('CLIENT DATA ERROR', error)
    }
  }

  useEffect(() => {
    if (data?.length > 0) {
      fetchProfileImages()
    }
  }, [data])

  const getProfileImage = async (key: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client/getProfileUrl/${key}`)
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
    }
  }

  const getServiceTypes = async () => {
    try {
      const serviceTypesResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/service`)
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
      if (serviceTypes.serviceTypes) queryParams.append('service', serviceTypes.serviceTypes)
      queryParams.append('page', '1')
      queryParams.append('limit', '10')

      // If no filters are applied, fetch all data
      if (queryParams.toString() === 'page=1&limit=10') {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client`)
        setDataWithProfileImg(response.data)
        return
      }
      console.log('QUERY PARAMS', queryParams)
      // Fetch filtered data
      const filterResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/client/filtered/?${queryParams.toString()}`
      )
      console.log('Filter response ----> ', filterResponse.data.data)
      setDataWithProfileImg(filterResponse.data.data)
    } catch (error) {
      console.error('error filtering data', error)
    }
  }

  const newColumns = [
    // {
    //   field: 'itemNumber',
    //   headerName: '#',
    //   flex: 0.5,
    //   renderCell: (params: GridRenderCellParams) => <span>{params.row.index + 1}</span>
    // },
    {
      id: 'id',
      label: 'ID',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (item: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
            <Typography color='primary'>{item.id}</Typography>
          </div>
        )
      }
    },
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
      id: 'firstName',
      label: 'FIRST NAME',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (item: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
            <Typography color='primary'>{item?.firstName}</Typography>
          </div>
        )
      }
    },
    {
      id: 'lastName',
      label: 'LAST NAME',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (item: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
            <Typography color='primary'>{item?.lastName}</Typography>
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
                </CustomTextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Button type='submit' variant='outlined'>
                  Apply
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
            <Grid sx={{ p: 5 }}>
              <div className='flex flex-row justify-between'>
                <TextField
                  className='w-[50%]' // Ensures the input takes up most of the width
                  placeholder='Search name, phone number, PMI number'
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
            {!dataWithProfileImg.length ? (
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
                data={dataWithProfileImg}
                keyExtractor={item => item.id.toString()}
                enablePagination
                pageSize={5}
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

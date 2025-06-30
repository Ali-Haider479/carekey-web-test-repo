'use client'
import DataTable from '@/@core/components/mui/DataTable'
import ReactTable from '@/@core/components/mui/ReactTable'
import CustomTextField from '@/@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import api from '@/utils/api'
import { formatDateTime } from '@/utils/helperFunctions'
import { SearchOutlined } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Input,
  InputAdornment,
  MenuItem,
  TextField,
  Typography
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useState, forwardRef, useEffect } from 'react'

interface DefaultStateType {
  actionType: string
  startDate: string // Changed to string to match ISO format
}

interface Column {
  id: string
  label: string
  minWidth: number
  render: (item: any) => JSX.Element
}

interface PickerProps {
  placeholder?: string
  error?: boolean
  className?: string
  id?: string
  registername?: string
}

const defaultState: DefaultStateType = {
  actionType: '',
  startDate: '' // Empty string instead of new Date()
}

const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
  return (
    <CustomTextField
      inputRef={ref}
      fullWidth
      {...props}
      placeholder={props.placeholder || ''}
      className={props.className}
      id={props.id}
      error={props.error}
    />
  )
})

const AccountHistory = () => {
  const [search, setSearch] = useState('')
  const [values, setValues] = useState(defaultState)
  const [userActions, setUserActions] = useState<any>([])
  const [originalUserActions, setOriginalUserActions] = useState([])
  const [loading, setLoading] = useState(true)
  const { id } = useParams()

  useEffect(() => {
    const fetchUserActions = async () => {
      try {
        const response = await api.get(`/account-history/client/${id}`)
        setUserActions(response.data)
        setOriginalUserActions(response.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserActions()
  }, [id])

  const newColumns: Column[] = [
    {
      id: 'createdAt',
      label: 'DATE & TIME',
      minWidth: 170,
      render: item => <Typography className='font-light text-sm my-3'>{formatDateTime(item.createdAt)}</Typography>
    },
    {
      id: 'userId',
      label: 'ADMIN',
      minWidth: 170,
      render: item => <Typography className='font-light text-sm my-3'>{item.user.userName}</Typography>
    },
    {
      id: 'actionType',
      label: 'SECTION',
      minWidth: 170,
      render: item => <Typography className='font-light text-sm my-3'>{item.actionType}</Typography>
    },
    {
      id: 'details',
      label: 'CHANGES MADE',
      minWidth: 170,
      render: item => <Typography className='font-light text-sm my-3'>{item.details}</Typography>
    }
  ]

  const applyFilters = (data: any[], filters: typeof defaultState, searchQuery: string) => {
    return data.filter(action => {
      const matchesActionType = filters.actionType ? action.actionType === filters.actionType : true

      const filterDate = filters.startDate ? new Date(filters.startDate).toDateString() : null
      const actionDate = new Date(action.createdAt).toDateString()

      const matchesDate = filterDate ? actionDate === filterDate : true

      const matchesSearch = searchQuery ? action.user.userName.toLowerCase().includes(searchQuery.toLowerCase()) : true

      return matchesActionType && matchesDate && matchesSearch
    })
  }

  useEffect(() => {
    if (!search) {
      setUserActions(originalUserActions)
      return
    }

    const filteredBySearch = originalUserActions.filter((action: any) =>
      action.user.userName.toLowerCase().includes(search.toLowerCase())
    )
    setUserActions(filteredBySearch)
  }, [search, originalUserActions])

  const onSubmit = async (e: any) => {
    e.preventDefault()
    try {
      console.log('FILTER VALUES:', values)
      const filteredActions = applyFilters(originalUserActions, values, search)
      console.log('FILTERED ACTIONS:', filteredActions)
      setUserActions(filteredActions)
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  const handleReset = async () => {
    try {
      setValues(defaultState)
      setSearch('')
      setUserActions(originalUserActions)
    } catch (error) {
      console.error('Error resetting filters:', error)
    }
  }

  console.log('USER ACTIONS', userActions)
  return (
    <>
      <form onSubmit={onSubmit} autoComplete='off'>
        <Card className='w-full' sx={{ borderRadius: 1, boxShadow: 2, mb: 3 }}>
          <CardHeader title='Filters' titleTypographyProps={{ variant: 'h3', sx: { fontWeight: 500 } }} />
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }} sx={{ ml: 6 }}>
              <AppReactDatepicker
                id='event-start-date'
                selected={values.startDate ? new Date(values.startDate) : null}
                startDate={values.startDate ? new Date(values.startDate) : null}
                dateFormat={'yyyy-MM-dd'}
                customInput={
                  <TextField
                    fullWidth
                    size='small'
                    label='Start Date'
                    name='startDate'
                    className='mbe-6'
                    id='event-start-date'
                  />
                }
                onChange={(date: Date | null) =>
                  date !== null && setValues({ ...values, startDate: date.toISOString() })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                placeholder='Actions'
                label='Actions'
                size='small'
                value={values.actionType}
                id='event-actions'
                onChange={e => setValues({ ...values, actionType: e.target.value })}
              >
                <MenuItem value=''>All Actions</MenuItem> {/* Added for no filter */}
                <MenuItem value='ClientProfileImageUpdate'>Profile Image</MenuItem>
                <MenuItem value='ClientProfileInfoUpdate'>Profile Info</MenuItem>
                <MenuItem value='ClientServiceAuthCreate'>Service Auth Create</MenuItem>
                <MenuItem value='ClientServiceAuthUpdate'>Service Auth Update</MenuItem>
              </TextField>
            </Grid>
            <Grid container spacing={13}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Button type='submit' variant='contained' className='px-1'>
                  Apply
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Button onClick={handleReset} variant='contained' className={`px-1`} color='error'>
                  Reset
                </Button>
              </Grid>
              {/* <Grid size={{ xs: 12, sm: 4 }}>
                <Button onClick={handleReset} color='error' variant='outlined' className='px-1'>
                  Reset
                </Button>
              </Grid> */}
            </Grid>
          </Grid>
        </Card>
      </form>
      <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
        <Grid container spacing={2} alignItems='center' sx={{ mb: 2, p: 10 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder='Search admin name'
              variant='outlined'
              size='small'
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <i className='bx-search' style={{ color: '#757575' }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
        {/* <Input endAdornment={<SearchOutlined />} className='w-[534px] !h-[40px] m-4' placeholder='Search Admin name' /> */}

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
                width: '100%'
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <ReactTable
              data={userActions}
              columns={newColumns}
              keyExtractor={user => user.id.toString()}
              enablePagination
              pageSize={25}
              stickyHeader
              maxHeight={600}
              containerStyle={{ borderRadius: 2 }}
            />
          )}
        </div>
      </Card>
    </>
  )
}

export default AccountHistory

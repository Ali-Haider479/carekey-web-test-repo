'use client'

// React Imports
import { useEffect, useState, forwardRef } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'
import { Button, CardHeader, InputAdornment, MenuItem, Typography } from '@mui/material'

// Third-party Imports
import axios from 'axios'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useParams } from 'next/navigation'

// Component Imports
import DataTable from '@/@core/components/mui/DataTable'
import CustomTextField from '@/@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Utility Imports
import { formatDateTime } from '@/utils/helperFunctions'
import api from '@/utils/api'

interface DefaultStateType {
  actionType: string
  startDate: string // ISO string format
}

interface PickerProps {
  label?: string
  error?: boolean
  className?: string
  id?: string
  registername?: string
}

const defaultState: DefaultStateType = {
  actionType: '',
  startDate: ''
}

const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
  return (
    <CustomTextField
      inputRef={ref}
      fullWidth
      {...props}
      label={props.label || ''}
      className={props.className}
      id={props.id}
      error={props.error}
    />
  )
})

const AccountHistoryTable = () => {
  const [search, setSearch] = useState('')
  const [values, setValues] = useState(defaultState)
  const [userActions, setUserActions] = useState<any>([])
  const [originalUserActions, setOriginalUserActions] = useState([]) // Store original data for reset
  const [loading, setLoading] = useState(true)
  const { id } = useParams()

  useEffect(() => {
    const fetchUserActions = async () => {
      try {
        const response = await api.get(`/account-history/caregiver/${id}`)
        setUserActions(response.data)
        setOriginalUserActions(response.data) // Save original data
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserActions()
  }, [id])

  const newColumns: GridColDef[] = [
    {
      field: 'createdAt',
      headerName: 'DATE & TIME',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='font-light text-sm my-3'>{formatDateTime(params.value)}</Typography>
      )
    },
    {
      field: 'userId',
      headerName: 'ADMIN',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='font-light text-sm my-3'>{params.row.user.userName}</Typography>
      )
    },
    {
      field: 'actionType',
      headerName: 'SECTION',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='font-light text-sm my-3'>{params.value}</Typography>
      )
    },
    {
      field: 'details',
      headerName: 'CHANGES MADE',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='font-light text-sm my-3'>{params.value}</Typography>
      )
    }
  ]

  const applyFilters = (data: any[], filters: typeof defaultState, searchQuery: string) => {
    return data.filter(action => {
      // Filter by actionType
      const matchesActionType = filters.actionType ? action.actionType === filters.actionType : true

      // Filter by startDate
      const filterStartDate = filters.startDate ? new Date(filters.startDate).getTime() : null
      const actionCreatedAt = new Date(action.createdAt).getTime()
      const matchesStartDate = filterStartDate ? actionCreatedAt >= filterStartDate : true

      // Filter by search (admin name)
      const matchesSearch = searchQuery ? action.user.userName.toLowerCase().includes(searchQuery.toLowerCase()) : true

      return matchesActionType && matchesStartDate && matchesSearch
    })
  }

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
        <Card sx={{ borderRadius: 1, boxShadow: 2, mb: 3 }}>
          <CardHeader title='Filters' titleTypographyProps={{ variant: 'h4', sx: { fontWeight: 500 } }} />
          <Grid container spacing={4} sx={{ px: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <AppReactDatepicker
                id='event-start-date'
                selected={values.startDate ? new Date(values.startDate) : null}
                startDate={values.startDate ? new Date(values.startDate) : null}
                dateFormat={'yyyy-MM-dd'}
                customInput={<PickersComponent registername='startDate' className='mbe-6' id='event-start-date' />}
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
                <MenuItem value=''>All Actions</MenuItem>
                <MenuItem value='CaregiverProfileImageUpdate'>Profile Image</MenuItem>
                <MenuItem value='CaregiverProfileInfoUpdate'>Profile Info</MenuItem>
                <MenuItem value='CaregiverScheduleCreation'>Schedule Create</MenuItem>
                <MenuItem value='CaregiverScheduleUpdate'>Schedule Update</MenuItem>
                <MenuItem value='ClientAssignedToCaregiver'>Client Assign</MenuItem>
              </TextField>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Button type='submit' variant='contained' className='px-1'>
                  Apply
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

        <div style={{ overflowX: 'auto' }}>
          {loading ? <Typography>Loading...</Typography> : <DataTable columns={newColumns} data={userActions} />}
        </div>
      </Card>
    </>
  )
}

export default AccountHistoryTable

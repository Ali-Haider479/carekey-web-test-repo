'use client'

// React Imports
import { useEffect, useState, forwardRef, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'
import { Button, CardHeader, CircularProgress, InputAdornment, MenuItem, Typography } from '@mui/material'

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
import ReactTable from '@/@core/components/mui/ReactTable'
import { useTheme } from '@emotion/react'

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

interface Column {
  id: string
  label: string
  minWidth: number
  render: (item: any) => JSX.Element
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
  const [userActions, setUserActions] = useState<any[]>([])
  const [originalUserActions, setOriginalUserActions] = useState([]) // Store original data for reset
  const [loading, setLoading] = useState(true)
  const { id } = useParams()

  const theme: any = useTheme()
  const lightTheme = theme.palette.mode === 'light'
  const darkTheme = theme.palette.mode === 'dark'

  useEffect(() => {
    const fetchUserActions = async () => {
      try {
        setLoading(true)
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
      // 1. Action Type Filter (unchanged)
      const matchesActionType = filters.actionType ? action.actionType === filters.actionType : true

      // 2. DATE FILTER - NOW CHECKS FOR EXACT MATCH
      const filterDate = filters.startDate ? new Date(filters.startDate).toDateString() : null
      const actionDate = new Date(action.createdAt).toDateString()

      const matchesDate = filterDate
        ? actionDate === filterDate // Exact date comparison
        : true

      // 3. Search Filter (unchanged)
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

  const sortedData = useMemo(() => {
    return userActions?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [userActions])

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
                customInput={
                  <TextField
                    fullWidth
                    size='small'
                    label='Select Date'
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
                <MenuItem value=''>All Actions</MenuItem>
                <MenuItem value='CaregiverProfileImageUpdate'>Profile Image</MenuItem>
                <MenuItem value='CaregiverProfileInfoUpdate'>Profile Info</MenuItem>
                <MenuItem value='CaregiverScheduleCreation'>Schedule Create</MenuItem>
                <MenuItem value='CaregiverScheduleUpdate'>Schedule Update</MenuItem>
                <MenuItem value='ClientAssignedToCaregiver'>Client Assign</MenuItem>
              </TextField>
            </Grid>
            <Grid container spacing={13}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Button type='submit' variant='contained' className={`px-1`}>
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

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className='flex items-center justify-center p-10'>
              <CircularProgress />
            </div>
          ) : (
            <ReactTable
              data={sortedData}
              columns={newColumns}
              keyExtractor={user => user.id.toString()}
              enablePagination
              pageSize={20}
              stickyHeader
              maxHeight={600}
              containerStyle={{ borderRadius: 2 }}
              sorted //as we are sending sorted data
            />
          )}
        </div>
      </Card>
    </>
  )
}

export default AccountHistoryTable

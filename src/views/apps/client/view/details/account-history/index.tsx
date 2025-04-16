'use client'
import DataTable from '@/@core/components/mui/DataTable'
import CustomTextField from '@/@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import api from '@/utils/api'
import { formatDateTime } from '@/utils/helperFunctions'
import { SearchOutlined } from '@mui/icons-material'
import { Button, Card, CardHeader, Input, MenuItem, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useState, forwardRef, useEffect } from 'react'

interface DefaultStateType {
  actionType: string
  startDate: string // Changed to string to match ISO format
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

  const applyFilters = (data: any[], filters: typeof defaultState) => {
    return data.filter(action => {
      const matchesActionType = filters.actionType ? action.actionType === filters.actionType : true

      const filterStartDate = filters.startDate ? new Date(filters.startDate).getTime() : null
      const actionCreatedAt = new Date(action.createdAt).getTime()

      const matchesStartDate = filterStartDate ? actionCreatedAt >= filterStartDate : true

      console.log('FILTER DEBUG:', {
        actionType: action.actionType,
        matchesActionType,
        createdAt: action.createdAt,
        startDate: filters.startDate,
        matchesStartDate
      })

      return matchesActionType && matchesStartDate
    })
  }

  const onSubmit = async (e: any) => {
    e.preventDefault()
    try {
      console.log('FILTER VALUES:', values)
      const filteredActions = applyFilters(originalUserActions, values)
      console.log('FILTERED ACTIONS:', filteredActions)
      setUserActions(filteredActions)
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  const handleReset = async () => {
    try {
      setValues(defaultState)
      setUserActions(originalUserActions)
    } catch (error) {
      console.error('Error resetting filters:', error)
    }
  }

  console.log('USER ACTIONS', userActions)
  return (
    <>
      <form onSubmit={onSubmit} autoComplete='off'>
        <Card className='w-full' sx={{ borderRadius: 1, boxShadow: 2 }}>
          <CardHeader title='Filters' titleTypographyProps={{ variant: 'h3', sx: { fontWeight: 500 } }} />
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }} sx={{ ml: 6 }}>
              <AppReactDatepicker
                id='event-start-date'
                selected={values.startDate ? new Date(values.startDate) : null}
                startDate={values.startDate ? new Date(values.startDate) : null}
                dateFormat={'yyyy-MM-dd'}
                customInput={
                  <PickersComponent
                    placeholder='Start Date'
                    registername='startDate'
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
            <Grid container spacing={12}>
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
      <Card className='h-full w-full mt-3 shadow-md rounded-lg p-1'>
        <Input endAdornment={<SearchOutlined />} className='w-[534px] !h-[40px] m-4' placeholder='Search Admin name' />
        {loading ? <Typography>Loading...</Typography> : <DataTable columns={newColumns} data={userActions} />}
      </Card>
    </>
  )
}

export default AccountHistory

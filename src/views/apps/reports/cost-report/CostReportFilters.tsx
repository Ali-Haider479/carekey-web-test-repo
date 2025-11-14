'use client'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import api from '@/utils/api'
import { Card, CardContent, Grid2 as Grid, TextField, Typography, Button, IconButton } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { parseISO, startOfDay } from 'date-fns'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface DefaultStateType {
  serviceName: string
  payer: string
  procedureCode: string
  modifierCode: string
  startDate: string
  endDate: string
}

const defaultState: DefaultStateType = {
  serviceName: '',
  payer: '',
  procedureCode: '',
  modifierCode: '',
  startDate: '',
  endDate: ''
}

const CostReportFilters = ({ onFilterApplied }: { onFilterApplied: (data: any) => void }) => {
  const [costReportFilters, setCostReportFilters] = useState<DefaultStateType>(defaultState)

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const {
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const onSubmit = async () => {
    try {
      const queryParams = new URLSearchParams()

      // Add accountStatus filter if provided
      if (costReportFilters.payer) {
        queryParams.append('payer', costReportFilters.payer)
      }

      if (costReportFilters.serviceName) {
        queryParams.append('serviceName', costReportFilters.serviceName)
      }

      if (costReportFilters.procedureCode) {
        queryParams.append('procedureCode', costReportFilters.procedureCode)
      }

      if (costReportFilters.modifierCode) {
        queryParams.append('modifierCode', costReportFilters.modifierCode)
      }

      if (costReportFilters.startDate) {
        queryParams.append('startDate', costReportFilters.startDate)
      }

      if (costReportFilters.endDate) {
        queryParams.append('endDate', costReportFilters.endDate)
      }

      queryParams.append('page', '1')
      queryParams.append('limit', '10')
      // queryParams.append('tenantId', authUser?.tenant?.id)

      console.log('Query Params:', queryParams.toString())

      // If no filters are applied, fetch all data
      if (queryParams.toString() === `page=1&limit=10&tenantId=${authUser?.tenant?.id}`) {
        const response = await api.get(`/reports/${authUser?.tenant?.id}/service-cost`)
        onFilterApplied(response.data)
        return
      }
      // Fetch filtered data
      const filterResponse = await api.get(
        `/reports/service-cost/${authUser?.tenant?.id}/filtered/?${queryParams.toString()}`
      )
      onFilterApplied(filterResponse.data.data)
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  const handleReset = async () => {
    try {
      setCostReportFilters(defaultState)

      // Fetch all data without filters
      const response = await api.get(`/reports/${authUser?.tenant?.id}/service-cost`)
      onFilterApplied(response.data)
    } catch (error) {
      console.error('Error resetting filters:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        {/* <CardHeader title='Filters' /> */}
        <CardContent>
          <div className='flex justify-between items-center'>
            <Grid size={{ xs: 12, sm: 4 }}>
              <span className='text-[20px]'>
                <strong>Filters</strong>
              </span>
            </Grid>
          </div>
          <Grid container spacing={4} marginTop={4}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <Typography variant='h6' className='mb-2'>
                Service Name
              </Typography>
              <TextField
                fullWidth
                label='Service Name'
                placeholder='Service Name'
                variant='outlined'
                size='small'
                value={costReportFilters.serviceName}
                onChange={e => setCostReportFilters({ ...costReportFilters, serviceName: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <Typography variant='h6' className='mb-2'>
                Payer Name
              </Typography>
              <TextField
                fullWidth
                label='Payer'
                placeholder='Payer'
                variant='outlined'
                size='small'
                value={costReportFilters.payer}
                onChange={e => setCostReportFilters({ ...costReportFilters, payer: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <Typography variant='h6' className='mb-2'>
                Procedure Code
              </Typography>
              <TextField
                fullWidth
                label='Procedure Code'
                placeholder='Procedure Code'
                variant='outlined'
                size='small'
                value={costReportFilters.procedureCode}
                onChange={e => setCostReportFilters({ ...costReportFilters, procedureCode: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <Typography variant='h6' className='mb-2'>
                Modifier Code
              </Typography>
              <TextField
                fullWidth
                label='Modifier Code'
                placeholder='Modifier Code'
                variant='outlined'
                size='small'
                value={costReportFilters.modifierCode}
                onChange={e => setCostReportFilters({ ...costReportFilters, modifierCode: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <Typography variant='h6' className='mb-2'>
                Date Range
              </Typography>
              <AppReactDatepicker
                selectsRange
                startDate={costReportFilters.startDate ? startOfDay(parseISO(costReportFilters.startDate)) : null}
                endDate={costReportFilters.endDate ? startOfDay(parseISO(costReportFilters.endDate)) : null}
                id={`dateRange`}
                onChange={(dates: [Date | null, Date | null]) =>
                  setCostReportFilters({
                    ...costReportFilters,
                    startDate: dates[0] ? dates[0].toISOString().split('T')[0] : '',
                    endDate: dates[1] ? dates[1].toISOString().split('T')[0] : ''
                  })
                }
                placeholderText='MM/DD/YYYY - MM/DD/YYYY'
                customInput={
                  <TextField
                    fullWidth
                    size='small'
                    label='Start and End Date'
                    placeholder='MM/DD/YYYY - MM/DD/YYYY'
                    // disabled={isLoading}
                    InputProps={{
                      endAdornment: (
                        <IconButton size='small'>
                          <CalendarTodayIcon style={{ scale: 1 }} />
                        </IconButton>
                      )
                    }}
                  />
                }
                // popperPlacement='bottom'
              />
            </Grid>

            <Grid container spacing={12} marginTop={8} marginLeft={2} className='mb-4'>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Button type='submit' variant='contained' className={`p-1`}>
                  Apply
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Button onClick={handleReset} variant='contained' color='error' className={`p-1`}>
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </form>
  )
}

export default CostReportFilters

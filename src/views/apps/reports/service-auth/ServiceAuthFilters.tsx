'use client'
import api from '@/utils/api'
import {
  Card,
  CardContent,
  Grid2 as Grid,
  TextField,
  Typography,
  MenuItem,
  FormLabel,
  Switch,
  Button
} from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface DefaultStateType {
  showExpired: boolean
  payer: string
  client: string
  diagnosisCode: string
  expiringWithin: number
}

const defaultState: DefaultStateType = {
  showExpired: false,
  payer: '',
  client: '',
  diagnosisCode: '',
  expiringWithin: 30
}

const ServiceAuthFilters = ({ onFilterApplied }: { onFilterApplied: (data: any) => void }) => {
  const [serviceAuthFilters, setServiceAuthFilters] = useState<DefaultStateType>(defaultState)

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const {
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const label = { inputProps: { 'aria-label': 'Switch demo' } }

  const onSubmit = async () => {
    try {
      const queryParams = new URLSearchParams()

      // Add accountStatus filter if provided
      if (serviceAuthFilters.payer) {
        queryParams.append('payer', serviceAuthFilters.payer)
      }

      // Add caregiverUMPI filter if provided
      if (serviceAuthFilters.client) {
        queryParams.append('clientName', serviceAuthFilters.client)
      }

      if (serviceAuthFilters.diagnosisCode) {
        queryParams.append('diagnosisCode', serviceAuthFilters.diagnosisCode)
      }

      if (serviceAuthFilters.showExpired) {
        queryParams.append('expired', 'true')
      }

      if (serviceAuthFilters.expiringWithin && !serviceAuthFilters.showExpired) {
        queryParams.append('expiryDays', serviceAuthFilters.expiringWithin.toString())
      }

      queryParams.append('page', '1')
      queryParams.append('limit', '10')
      // queryParams.append('tenantId', authUser?.tenant?.id)

      console.log('Query Params:', queryParams.toString())

      // If no filters are applied, fetch all data
      if (queryParams.toString() === `expiryDays=30&page=1&limit=10&tenantId=${authUser?.tenant?.id}`) {
        const response = await api.get(`/reports/service-auth/${authUser?.tenant?.id}`)
        onFilterApplied(response.data)
        return
      }
      // Fetch filtered data
      const filterResponse = await api.get(
        `/reports/service-auth/${authUser?.tenant?.id}/filtered/?${queryParams.toString()}`
      )
      onFilterApplied(filterResponse.data.data)
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  const handleReset = async () => {
    try {
      setServiceAuthFilters(defaultState)

      // Fetch all data without filters
      const response = await api.get(`/reports/service-auth/${authUser?.tenant?.id}`)
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
                Payer Name
              </Typography>
              <TextField
                fullWidth
                label='Payer'
                placeholder='Payer'
                variant='outlined'
                size='small'
                value={serviceAuthFilters.payer}
                onChange={e => setServiceAuthFilters({ ...serviceAuthFilters, payer: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <Typography variant='h6' className='mb-2'>
                Client Name
              </Typography>
              <TextField
                fullWidth
                label='Client'
                placeholder='Client'
                variant='outlined'
                size='small'
                value={serviceAuthFilters.client}
                onChange={e => setServiceAuthFilters({ ...serviceAuthFilters, client: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <Typography variant='h6' className='mb-2'>
                DiagnosisCode
              </Typography>
              <TextField
                fullWidth
                label='Diagnosis Code'
                placeholder='Diagnosis Code'
                variant='outlined'
                size='small'
                value={serviceAuthFilters.diagnosisCode}
                onChange={e => setServiceAuthFilters({ ...serviceAuthFilters, diagnosisCode: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant='h6' className='mb-2'>
                Expiring Within
              </Typography>
              <TextField
                select
                size='small'
                fullWidth
                placeholder='Expiry'
                id='select-expiry'
                disabled={serviceAuthFilters.showExpired}
                value={serviceAuthFilters.expiringWithin}
                onChange={e => setServiceAuthFilters({ ...serviceAuthFilters, expiringWithin: Number(e.target.value) })}
                slotProps={{
                  select: { displayEmpty: true }
                }}
              >
                <MenuItem value={30} className=''>
                  30 Days
                </MenuItem>
                <MenuItem value={60} className=''>
                  60 Days
                </MenuItem>
                <MenuItem value={90} className=''>
                  90 Days
                </MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }} marginTop={8}>
              <FormLabel>Show Expired</FormLabel>
              <Switch
                {...label}
                checked={serviceAuthFilters.showExpired}
                onChange={() =>
                  setServiceAuthFilters({ ...serviceAuthFilters, showExpired: !serviceAuthFilters.showExpired })
                }
                color='primary'
              />
            </Grid>
            <Grid container spacing={12} marginTop={2} marginLeft={2} className='mb-2'>
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

export default ServiceAuthFilters

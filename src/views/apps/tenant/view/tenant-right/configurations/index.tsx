'use client'
import api from '@/utils/api'
import React, { useEffect, useState } from 'react'
import EditPayPeriodModal from './EditPayPeriodModal'
import { Box, Button, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import CustomSwitch from '@/@core/components/mui/CustomSwitch'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { addDays } from 'date-fns'
import './calender.css'
import './payperiod-calendar.css'

type EvvEnforcement = 'relaxed' | 'full' | 'none'
interface EvvConfig {
  enableEVV: boolean
  evvEnforcement: EvvEnforcement
  locationService: boolean
}

interface DayContentsProps {
  date: Date
  label: string
}

const TenantConfiguration = () => {
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const [payPeriod, setPayPeriod] = useState<any[]>([])
  const [currentPayPeriod, setCurrentPayPeriod] = useState<any>()
  const [openAddPayPeriodModal, setOpenAddPayPeriodModal] = useState<boolean>(false)
  const [evvConfig, setEvvConfig] = useState<EvvConfig>(
    authUser?.tenant.evvConfig || {
      enableEVV: false,
      evvEnforcement: 'none',
      locationService: false
    }
  )
  const [allowManualEdits, setAllowManualEdits] = useState<boolean>(authUser?.tenant.allowManualEdits || false)
  const [allowOverlappingVisits, setAllowOverlappingVisits] = useState<boolean>(
    authUser?.tenant.allowOverLappingVisits || false
  )
  const [enableNotification, setEnableNotification] = useState<boolean>(authUser?.tenant.enableNotification || false)

  const fetchInitialData = async () => {
    const payPeriodRes = await api.get(`/pay-period/history/tenant/${authUser?.tenant?.id}`)
    if (payPeriodRes.data) {
      setPayPeriod(payPeriodRes.data)
    } else {
      console.log('failed to fetch pay period')
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (payPeriod.length > 0) {
      const currentPayPeriod = payPeriod.filter(item => item.endDate === null)
      setCurrentPayPeriod(currentPayPeriod[0])
    }
  }, [payPeriod])

  useEffect(() => {
    const payload = {
      evvConfig,
      allowManualEdits,
      allowOverlappingVisits,
      enableNotification
    }
    api
      .patch(`/tenant/${authUser?.tenant?.id}`, payload)
      .then(res => console.log('tenant configuration updated successfully', res))
      .catch(err => console.log('Error Updating tenant configuration', err))
  }, [evvConfig, allowManualEdits, allowOverlappingVisits, enableNotification])

  const handlePayPeriodSetup = async (data: { startDate: Date; weeks: number }) => {
    try {
      if (!data.startDate || !data.weeks || data.weeks <= 0) {
        throw new Error('Invalid input data')
      }

      if (!currentPayPeriod?.id || !authUser?.tenant?.id) {
        throw new Error('Missing required context data')
      }

      const startDateRaw = data.startDate

      const UpdatePayload = {
        ...currentPayPeriod,
        endDate: startDateRaw.toISOString().split('T')[0],
        endTime: startDateRaw.toISOString().split('T')[1].split('.')[0],
        tenantId: authUser?.tenant?.id
      }

      const startDate = startDateRaw.toISOString().split('T')[0]
      const startTime = startDateRaw.toISOString().split('T')[1].split('.')[0]
      const payload = {
        startDate: startDate,
        startTime: startTime,
        endDate: null,
        endTime: null,
        tenantId: authUser?.tenant?.id,
        numberOfWeeks: data.weeks
      }
      const newPayPeriod = await api.post(`/pay-period`, payload)
      if (newPayPeriod.data) {
        await api.patch(`/pay-period/${currentPayPeriod.id}`, UpdatePayload)
      }
      fetchInitialData()
    } catch (error) {
      console.error('Pay period update failed:', error)
      throw error
    }
  }

  const handleEvvEnforcementChange = (event: React.MouseEvent<HTMLElement>, newValue: EvvEnforcement) => {
    if (newValue !== null) {
      if (newValue === 'relaxed' || newValue === 'none') {
        setEvvConfig({ ...evvConfig, locationService: false, evvEnforcement: newValue })
      } else {
        setEvvConfig({ ...evvConfig, evvEnforcement: newValue })
      }
    }
  }

  const today = new Date()

  // Define your pay periods
  const newCurrentPayPeriod = {
    startDate: currentPayPeriod?.startDate ? new Date(currentPayPeriod.startDate) : today,
    endDate: currentPayPeriod?.startDate
      ? addDays(new Date(currentPayPeriod.startDate), currentPayPeriod?.numberOfWeeks === 2 ? 13 : 6)
      : addDays(today, currentPayPeriod?.numberOfWeeks === 2 ? 13 : 6)
  }

  const nextPayPeriodStartDate = addDays(
    new Date(newCurrentPayPeriod.startDate),
    currentPayPeriod?.numberOfWeeks === 2 ? 14 : 7
  )

  console.log('nextPayPeriodStartDate----->', nextPayPeriodStartDate)

  const nextPayPeriod = {
    startDate: nextPayPeriodStartDate,
    endDate: addDays(new Date(nextPayPeriodStartDate), currentPayPeriod?.numberOfWeeks === 2 ? 13 : 6)
  }

  const DayContents: React.FC<DayContentsProps> = ({ date, label }) => {
    let className = 'custom-day'

    // Create date-only versions (time set to 00:00:00)
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)

    // Current pay period check
    if (newCurrentPayPeriod.startDate && newCurrentPayPeriod.endDate) {
      const currentStart = new Date(newCurrentPayPeriod.startDate)
      currentStart.setHours(0, 0, 0, 0)

      const currentEnd = new Date(newCurrentPayPeriod.endDate)
      currentEnd.setHours(23, 59, 59, 999) // Include entire end day

      if (dateOnly >= currentStart && dateOnly <= currentEnd) {
        className += ' current-period'
      }
    }

    // Next pay period check
    if (nextPayPeriod.startDate && nextPayPeriod.endDate) {
      const nextStart = new Date(nextPayPeriod.startDate)
      nextStart.setHours(0, 0, 0, 0)

      const nextEnd = new Date(nextPayPeriod.endDate)
      nextEnd.setHours(23, 59, 59, 999) // Include entire end day

      if (dateOnly >= nextStart && dateOnly <= nextEnd) {
        className += ' next-period'
      }
    }

    // Today check
    const todayOnly = new Date(today)
    todayOnly.setHours(0, 0, 0, 0)
    if (dateOnly.getTime() === todayOnly.getTime()) {
      className += ' today'
    }

    return <div className={className}>{label}</div>
  }

  return (
    <>
      <Box
        component={'div'}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          backgroundColor: 'background.paper',
          p: 4,
          borderRadius: 1
        }}
      >
        <Typography variant='h5'>Tenant Configurations</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h6'>Pay Periods</Typography>
          <Button
            variant='contained'
            onClick={() => {
              setOpenAddPayPeriodModal(true)
            }}
            size='small'
            sx={{ width: 'fit-content', ml: 'auto' }}
            disabled={true}
          >
            Edit Pay Period
          </Button>
        </Box>

        <AppReactDatepicker
          // selected={new Date()}
          inline
          className='clean-calendar-override'
          calendarClassName='clean-calendar custom-calendar'
          renderDayContents={(day, date) => <DayContents date={date} label={day.toString()} />}
          showDisabledMonthNavigation={false}
          minDate={newCurrentPayPeriod.startDate}
          maxDate={nextPayPeriod.endDate}
          formatWeekDay={day => day.substring(0, 3)}
        />

        <div className='legend'>
          <div className='legend-item'>
            <span className='current-color'></span> Current Pay Period
          </div>
          <div className='legend-item'>
            <span className='next-color'></span> Next Pay Period
          </div>
        </div>

        <Typography variant='h5' sx={{ mt: 3 }}>
          EVV Configuration
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant='h6'>Enable EVV</Typography>
          <CustomSwitch
            checked={evvConfig.enableEVV}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.checked === false) {
                setEvvConfig({
                  ...evvConfig,
                  enableEVV: e.target.checked,
                  locationService: false,
                  evvEnforcement: 'none'
                })
              } else {
                setEvvConfig({
                  ...evvConfig,
                  enableEVV: e.target.checked,
                  locationService: true,
                  evvEnforcement: 'full'
                })
              }
            }}
            sx={{ ml: 'auto' }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h6'>EVV Enforcement</Typography>

          <ToggleButtonGroup
            value={evvConfig.evvEnforcement}
            exclusive
            onChange={handleEvvEnforcementChange}
            aria-label='EVV toggle'
            sx={{
              '& .MuiToggleButton-root': {
                px: 3,
                py: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }
              }
            }}
          >
            <ToggleButton value='relaxed' aria-label='Relaxed'>
              Relaxed
            </ToggleButton>
            <ToggleButton value='full' aria-label='Full'>
              Full
            </ToggleButton>
            <ToggleButton value='none' aria-label='None'>
              None
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant='h6'>Require Location Service</Typography>
          <CustomSwitch
            checked={evvConfig.locationService}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEvvConfig({ ...evvConfig, locationService: e.target.checked })
            }
            sx={{ ml: 'auto' }}
          />
        </Box>

        <Typography variant='h5' sx={{ mt: 3 }}>
          Other Configurations
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant='h6'>Add Manual Edits</Typography>
          <CustomSwitch
            checked={allowManualEdits}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAllowManualEdits(e.target.checked)}
            sx={{ ml: 'auto' }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant='h6'>Add Overlapping Visits</Typography>
          <CustomSwitch
            checked={allowOverlappingVisits}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAllowOverlappingVisits(e.target.checked)}
            sx={{ ml: 'auto' }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant='h6'>Enable Notification</Typography>
          <CustomSwitch
            checked={enableNotification}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnableNotification(e.target.checked)}
            sx={{ ml: 'auto' }}
          />
        </Box>
      </Box>

      <EditPayPeriodModal
        isModalOpen={openAddPayPeriodModal}
        setIsModalOpen={setOpenAddPayPeriodModal}
        onSubmit={handlePayPeriodSetup}
      />
    </>
  )
}

export default TenantConfiguration

'use client'
import api from '@/utils/api'
import React, { useEffect, useState } from 'react'
import EditPayPeriodModal from './EditPayPeriodModal'
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  MenuItem,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme
} from '@mui/material'
import CustomSwitch from '@/@core/components/mui/CustomSwitch'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { addDays } from 'date-fns'
import './calender.css'
import './payperiod-calendar.css'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import ReactTable from '@/@core/components/mui/ReactTable'
import { useParams } from 'next/navigation'

type EvvEnforcement = 'evvRelaxed' | 'evvEnabled' | 'evvDisabled'
interface Column {
  id: string
  label: string
  minWidth: number
  render: (item: any) => JSX.Element
}
interface EvvConfig {
  enableEVV: boolean
  evvEnforcement: EvvEnforcement
  locationService: boolean
}

interface DayContentsProps {
  date: Date
  label: string
}

interface CardProps {
  evvSelected: string
}

const GenericCard: React.FC<CardProps> = ({ evvSelected }) => {
  const theme = useTheme()
  let headerText = ''
  let bodyText = ''
  let icon = null
  if (evvSelected === 'evvDisabled') {
    icon = (
      <span role='img' aria-label='red block'>
        🔴
      </span>
    )
    headerText = 'EVV is turned off'
    bodyText =
      'Clock-ins, geofencing, and EVV tracking are disabled for this tenant, NO data is collected. Service-level EVV settings are ignored.'
  } else if (evvSelected === 'evvEnforced') {
    icon = (
      <span role='img' aria-label='checkmark'>
        ✅
      </span>
    )
    headerText = 'EVV is strictly enforced'
    bodyText =
      'Caregivers must clock in within 500ft of the client`s location. Service-Level EVV settings apply. This is the default and most secure mode.'
  } else if (evvSelected === 'evvRelaxed') {
    icon = (
      <span role='img' aria-label='yellow triangle'>
        ⚠️
      </span>
    )
    headerText = 'EVV is relaxed'
    bodyText =
      'EVV is active, but geofencing is not enforced. Caregivers can clock-in from any location. Client & Caregiver`s Service-level toggles apply.'
  }
  return (
    <Card sx={{ maxWidth: 345, mt: 2, borderRadius: 2, boxShadow: 3, borderLeft: '4px solid #1976d2' }}>
      <CardContent sx={{ backgroundColor: theme.palette.mode === 'light' ? '#F0F4FF' : '#4c4c59' }}>
        <Typography variant='h6' color='primary' gutterBottom>
          {icon} <strong>{headerText}</strong>
        </Typography>
        <Typography variant='body2'>{bodyText}</Typography>
      </CardContent>
    </Card>
  )
}

const TenantConfiguration = () => {
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const tenantEvvConfig: any = JSON.parse(localStorage?.getItem('evvConfig') ?? '{}')

  console.log("Auth User's Data --->> ", authUser)
  const [payPeriod, setPayPeriod] = useState<any[]>([])
  const [currentPayPeriod, setCurrentPayPeriod] = useState<any>()
  const [openAddPayPeriodModal, setOpenAddPayPeriodModal] = useState<boolean>(false)
  const [allServicesList, setAllServicesList] = useState<any>()
  const [filteredServicesList, setFilteredServicesList] = useState<any>()
  const [isServiceEvvModalSHow, setIsServiceEvvModalShow] = useState<boolean>(false)
  const [serviceToChange, setServiceToChange] = useState<any>()
  const [evvConfig, setEvvConfig] = useState<EvvConfig>(
    tenantEvvConfig || {
      enableEVV: false,
      evvEnforcement: 'evvRelaxed',
      locationService: false
    }
  )
  const [evvEnforcementValue, setEvvEnforcementValue] = useState<EvvEnforcement>(tenantEvvConfig.evvEnforcement)
  const [allowManualEdits, setAllowManualEdits] = useState<boolean>(authUser?.tenant?.allowManualEdits || false)
  const [allowOverlappingVisits, setAllowOverlappingVisits] = useState<boolean>(
    authUser?.tenant?.allowOverLappingVisits || false
  )
  const [enableNotification, setEnableNotification] = useState<boolean>(authUser?.tenant?.enableNotification || false)
  const [isModalShow, setIsModalShow] = useState<boolean>(false)
  const [serviceSearchValue, setServiceSearchValue] = useState<string>('')

  const { id } = useParams()

  const label = { inputProps: { 'aria-label': 'Switch demo' } }

  const theme = useTheme()
  const lightTheme = theme.palette.mode === 'light'

  const handleModalOpen = (value: EvvEnforcement) => {
    console.log('EVV Value --> ', value)
    setEvvEnforcementValue(value)
    setIsModalShow(true)
  }

  const handleServiceEvvModalShow = (item: any) => {
    setIsServiceEvvModalShow(true)
    setServiceToChange(item)
  }

  const handleModalClose = () => {
    setIsModalShow(false)
  }

  const handleServiceEvvModalClose = () => {
    setIsServiceEvvModalShow(false)
  }

  const fetchInitialData = async () => {
    const payPeriodRes = await api.get(`/pay-period/history/tenant/${id}`)
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
      .patch(`/tenant/${id}`, payload)
      .then(res => {
        console.log('tenant configuration updated successfully', res)
        localStorage.setItem('evvConfig', JSON.stringify(evvConfig))
      })
      .catch(err => console.log('Error Updating tenant configuration', err))
  }, [evvConfig, allowManualEdits, allowOverlappingVisits, enableNotification])

  const handlePayPeriodSetup = async (data: { startDate: Date; weeks: number }) => {
    try {
      if (!data.startDate || !data.weeks || data.weeks <= 0) {
        throw new Error('Invalid input data')
      }

      if (!currentPayPeriod?.id || !id) {
        throw new Error('Missing required context data')
      }

      const startDateRaw = data.startDate

      const UpdatePayload = {
        ...currentPayPeriod,
        endDate: startDateRaw.toISOString().split('T')[0],
        endTime: startDateRaw.toISOString().split('T')[1].split('.')[0],
        tenantId: id
      }

      const startDate = startDateRaw.toISOString().split('T')[0]
      const startTime = startDateRaw.toISOString().split('T')[1].split('.')[0]
      const payload = {
        startDate: startDate,
        startTime: startTime,
        endDate: null,
        endTime: null,
        tenantId: id,
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

  const handleEvvEnforcementChange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setEvvConfig({ ...evvConfig, evvEnforcement: evvEnforcementValue })
    setIsModalShow(false)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase()
    setServiceSearchValue(searchValue)

    if (!allServicesList) return

    if (searchValue.trim() === '') {
      setFilteredServicesList(allServicesList)
    } else {
      const filtered = allServicesList.filter((item: any) =>
        Object.values(item).some((value: any) => value && value.toString().toLowerCase().includes(searchValue))
      )
      setFilteredServicesList(filtered)
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

  const getAllServices = async () => {
    const servicesRes = await api.get(`/service/tenant/${id}`)
    console.log('SERVICES RES ----->> ', servicesRes.data)
    setAllServicesList(servicesRes.data)
    setFilteredServicesList(servicesRes.data)
  }

  useEffect(() => {
    getAllServices()
  }, [])

  const updateEVV = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    let newEVV = serviceToChange.evv
    if (serviceToChange.evv === true) {
      newEVV = false
    }
    if (serviceToChange.evv === false) {
      newEVV = true
    }
    const updateServiceEvv = await api.patch(`/service/${serviceToChange.id}`, { evv: newEVV })
    console.log('UPDATED SERVICE RESPONSE ---->> ', updateServiceEvv)
    getAllServices()
    setIsServiceEvvModalShow(false)
  }

  const newColumns: Column[] = [
    {
      id: 'services',
      label: 'SERVICES',
      minWidth: 170,
      render: item => (
        <div className='flex flex-row gap-2 mt-0'>
          <div
            className={`p-1 border ${lightTheme ? 'border-[#4B0082]' : 'border-gray-200'} border-opacity-[50%] px-2 rounded-sm`}
          >
            <Typography className={`${lightTheme ? 'text-[#4B0082]' : null}`}>{item?.name}</Typography>
          </div>
        </div>
      )
    },
    {
      id: 'procedureCode',
      label: 'PROCEDURE CODE',
      minWidth: 170,
      render: item => <Typography className='mt-0'> {item?.procedureCode}</Typography>
    },
    {
      id: 'modifierCode',
      label: 'MODIFIER CODE',
      minWidth: 170,
      render: item => <Typography className='mt-0'>{item?.modifierCode ? item?.modifierCode : '....'}</Typography>
    },
    {
      id: 'evvEnforce',
      label: 'EVV',
      minWidth: 170,
      render: item => (
        <div>
          <div className='p-0 flex rounded-sm'>
            <Switch
              {...label}
              checked={item?.evv === true}
              onChange={() => handleServiceEvvModalShow(item)}
              color='primary'
              disabled={authUser?.userRoles?.title !== 'Super Admin' && authUser?.userRoles?.title !== 'Tenant Admin'}
            />
          </div>
        </div>
      )
    }
  ]

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h6'>EVV Enforcement</Typography>

          <TextField
            select
            size='small'
            placeholder='EVV Enforcement'
            id='select-evv-enforcement'
            value={evvConfig.evvEnforcement}
            defaultValue={evvConfig.evvEnforcement}
            onChange={e => handleModalOpen(e.target.value as EvvEnforcement)}
            slotProps={{
              select: { displayEmpty: true }
            }}
            className='w-1/4'
          >
            <MenuItem value={'evvRelaxed'}>EVV Relaxed</MenuItem>
            <MenuItem value={'evvEnforced'}>EVV Enforced</MenuItem>
            <MenuItem value={'evvDisabled'}>EVV Disabled</MenuItem>
          </TextField>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <GenericCard evvSelected={evvConfig.evvEnforcement} />
        </Box>

        <Box
          sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}
        >
          <Typography variant='h5' sx={{ mt: 0 }}>
            Service EVV
          </Typography>
          <TextField
            size='small'
            placeholder='Search Service'
            id='service-search'
            value={serviceSearchValue}
            onChange={handleSearchChange}
            className='w-2/4'
            slotProps={{
              input: {
                startAdornment: <i className='bx bx-search-alt-2 text-gray-500' style={{ fontSize: '1.2rem' }} />
              }
            }}
          />
        </Box>

        <ReactTable
          data={filteredServicesList ? filteredServicesList : []}
          columns={newColumns}
          keyExtractor={user => user?.id?.toString()}
          enablePagination
          pageSize={10}
          stickyHeader
          maxHeight={600}
          containerStyle={{ borderRadius: 2 }}
        />

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

      <Dialog
        open={isModalShow}
        onClose={handleModalClose}
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        maxWidth='sm'
      >
        <DialogCloseButton onClick={handleModalClose} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <div className='flex items-center justify-center w-full px-5 flex-col'>
          <form onSubmit={handleEvvEnforcementChange}>
            <div>
              <h2 className='text-xl font-semibold mt-5 mb-4'>EVV Mode Change Warning</h2>
            </div>
            <div>
              <Typography className='mb-7'>Are you sure you want to change the EVV mode?</Typography>
            </div>
            <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
              <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                No
              </Button>
              <Button type='submit' variant='contained'>
                Yes
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
      <Dialog
        open={isServiceEvvModalSHow}
        onClose={handleServiceEvvModalClose}
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        maxWidth='sm'
      >
        <DialogCloseButton onClick={handleServiceEvvModalClose} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <div className='flex items-center justify-center w-full px-5 flex-col'>
          <form onSubmit={updateEVV}>
            <div>
              <h2 className='text-xl font-semibold mt-5 mb-4'>Potential Non-Compliance Warning</h2>
            </div>
            <div>
              <Typography className='mb-7'>
                You are disabling EVV for a service that may be subject to electronic visit verification (EVV)
                requirements under state or federal guidelines, including those of the Minnesota Department of Human
                Services (DHS). Disabling EVV may result in non-compliance with those requirements. Proceed only if you
                understand and accept responsibility for this configuration
              </Typography>
            </div>
            <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
              <Button variant='outlined' color='secondary' onClick={handleServiceEvvModalClose}>
                Cancel
              </Button>
              <Button type='submit' variant='contained'>
                Yes, I Understand and Accept Responsibility
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </>
  )
}

export default TenantConfiguration

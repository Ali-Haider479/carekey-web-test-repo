'use client'
import api from '@/utils/api'
import React, { useEffect, useState } from 'react'
import EditPayPeriodModal from './EditPayPeriodModal'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  MenuItem,
  Switch,
  Grid2 as Grid,
  TextField,
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
import { FormProvider, useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import CustomAlert from '@/@core/components/mui/Alter'
import { Delete, Edit } from '@mui/icons-material'

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
  // const tenantEvvConfig: any = JSON.parse(localStorage?.getItem('evvConfig') ?? '{}')
  const { id } = useParams()

  console.log("Auth User's Data --->> ", authUser)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()
  const [payPeriod, setPayPeriod] = useState<any[]>([])
  const [currentPayPeriod, setCurrentPayPeriod] = useState<any>()
  const [openAddPayPeriodModal, setOpenAddPayPeriodModal] = useState<boolean>(false)
  const [allServicesList, setAllServicesList] = useState<any>()
  const [filteredServicesList, setFilteredServicesList] = useState<any>()
  const [isServiceEvvModalSHow, setIsServiceEvvModalShow] = useState<boolean>(false)
  const [serviceToChange, setServiceToChange] = useState<any>()
  const [tenantEvvConfig, setTenantEvvConfig] = useState<any>()
  const [initialDataLoading, setInitialDataLoading] = useState<boolean>(false)
  const [evvConfig, setEvvConfig] = useState<EvvConfig>(
    tenantEvvConfig
    // || {
    //   enableEVV: false,
    //   evvEnforcement: 'evvRelaxed',
    //   locationService: false
    // }
  )
  const [evvEnforcementValue, setEvvEnforcementValue] = useState<EvvEnforcement>(tenantEvvConfig?.evvEnforcement)
  const [allowManualEdits, setAllowManualEdits] = useState<boolean>(authUser?.tenant?.allowManualEdits || false)
  const [allowOverlappingVisits, setAllowOverlappingVisits] = useState<boolean>(
    authUser?.tenant?.allowOverLappingVisits || false
  )
  const [enableNotification, setEnableNotification] = useState<boolean>(authUser?.tenant?.enableNotification || false)
  const [isModalShow, setIsModalShow] = useState<boolean>(false)
  const [serviceSearchValue, setServiceSearchValue] = useState<string>('')
  const [dhsServicesModal, setDhsServicesModal] = useState<boolean>(false)
  const [dhsUploadData, setDhsUploadData] = useState<any>(null)
  const [isAddServiceModalShow, setIsAddServiceModalShow] = useState<boolean>(false)
  const [isEditServiceModalShow, setIsEditServiceModalShow] = useState<boolean>(false)
  const [serviceToEdit, setServiceToEdit] = useState<any>(null)
  const [addServiceLoading, setAddServiceLoading] = useState<boolean>(false)
  const [editServiceLoading, setEditServiceLoading] = useState<boolean>(false)

  const methods = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = methods

  const handleAddServiceModalShow = () => {
    setIsAddServiceModalShow(true)
  }

  const handleEditServiceModalShow = (item: any) => {
    setIsEditServiceModalShow(true)
    setServiceToEdit(item)
  }

  const handleEditServiceModalClose = () => {
    setServiceToEdit(null)
    reset()
    setIsEditServiceModalShow(false)
  }

  const handleAddServiceModalClose = () => {
    setIsAddServiceModalShow(false)
    reset()
  }

  const handleAddNewService = async (data: any) => {
    setAddServiceLoading(true)
    try {
      const payload = {
        name: data.serviceName,
        description: data.serviceDescription,
        procedureCode: data.procedureCode,
        modifierCode: data.modifierCode === '' ? null : data.modifierCode,
        rate: data.serviceRate === '' ? 100 : parseFloat(data.serviceRate),
        tenantId: id,
        evv: false
      }

      const response = await api.post('/service', payload)
      handleAddServiceModalClose()
      getAllServices()
    } catch (error) {
      console.error('Error adding new service: ', error)
      setAlertOpen(true)
      setAlertProps({
        severity: 'error',
        message: 'Service with the same procedure code and modifier code already exists for this tenant'
      })
    } finally {
      setAddServiceLoading(false)
    }
  }

  const handleServiceEdit = async (data: any) => {
    setEditServiceLoading(true)
    console.log('Service to Edit --->> ', data)
    try {
      const payload = {
        name: data.serviceName,
        description: data.serviceDescription,
        procedureCode: data.procedureCode,
        modifierCode: data.modifierCode === '' ? null : data.modifierCode,
        rate: data.serviceRate === '' ? 100 : parseFloat(data.serviceRate)
      }
      const updateResponse = await api.patch(`/service/${serviceToEdit?.id}`, payload)
      console.log('Update Service Response ---->> ', updateResponse)
      getAllServices()
      handleEditServiceModalClose()
    } catch (error) {
      console.error('Error editing service: ', error)
      setAlertOpen(true)
      setAlertProps({
        severity: 'error',
        message: 'Service with the same procedure code and modifier code already exists for this tenant'
      })
    } finally {
      setEditServiceLoading(false)
    }
  }

  const handleDhsServicesModalClose = () => {
    setDhsServicesModal(false)
  }

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
    setInitialDataLoading(true)
    const payPeriodRes = await api.get(`/pay-period/history/tenant/${id}`)
    if (payPeriodRes.data) {
      setPayPeriod(payPeriodRes.data)
    } else {
      console.log('failed to fetch pay period')
    }
    const tenantDataRes = await api.get(`/tenant/${id}`)
    console.log('TENANT DATA RES ---->> ', tenantDataRes.data)
    if (tenantDataRes.data) {
      setTenantEvvConfig(tenantDataRes.data.evvConfig)
      setEvvConfig(tenantDataRes.data.evvConfig)
    } else {
      console.log('failed to fetch tenant data')
    }
    setInitialDataLoading(false)
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
      evvConfig
      // allowManualEdits,
      // allowOverlappingVisits,
      // enableNotification
    }
    api
      .patch(`/tenant/${id}`, payload)
      .then(res => {
        console.log('tenant configuration updated successfully', res)
        localStorage.setItem('evvConfig', JSON.stringify(evvConfig))
      })
      .catch(err => console.log('Error Updating tenant configuration', err))
  }, [evvConfig]) //allowManualEdits, allowOverlappingVisits, enableNotification

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

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      if (file.type !== 'application/pdf') {
        alert('Please upload a valid PDF file.')
        return
      }

      // Create FormData and append file + tenantId
      const formData = new FormData()
      formData.append('files', file) // 'files' matches FilesInterceptor field name
      formData.append('tenantId', String(id)) // Send as string, will be parsed

      const response = await api.post('/service/extract-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('PDF Upload Response:', response.data)
      setDhsUploadData(response.data)
      getAllServices()
      setDhsServicesModal(true)
    } catch (error: any) {
      console.error('Error uploading PDF:', error)
      alert('Failed to upload PDF: ' + (error.response?.data?.message || error.message))
    }
  }

  console.log('DHS upload data --->> ', dhsUploadData)

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
      id: 'actions',
      label: 'ACTIONS',
      minWidth: 170,
      render: item => {
        return (
          <div className='flex flex-row gap-3'>
            <Edit className='cursor-pointer hover:text-blue-400' onClick={() => handleEditServiceModalShow(item)} />
            {/* <Delete className='cursor-pointer hover:text-red-500' /> */}
          </div>
        )
      }
    }
    // {
    //   id: 'evvEnforce',
    //   label: 'EVV',
    //   minWidth: 170,
    //   render: item => (
    //     <div>
    //       <div className='p-0 flex rounded-sm'>
    //         <Switch
    //           {...label}
    //           checked={item?.evv === true}
    //           onChange={() => handleServiceEvvModalShow(item)}
    //           color='primary'
    //           disabled={authUser?.userRoles?.title !== 'Super Admin' && authUser?.userRoles?.title !== 'Tenant Admin'}
    //         />
    //       </div>
    //     </div>
    //   )
    // }
  ]

  return (
    <>
      <FormProvider {...methods}>
        <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />
        {initialDataLoading ? (
          <Box
            component={'div'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              // backgroundColor: 'background.paper',
              p: 4,
              borderRadius: 1
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : (
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
                value={evvConfig?.evvEnforcement}
                defaultValue={evvConfig?.evvEnforcement}
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
              <GenericCard evvSelected={evvConfig?.evvEnforcement} />
            </Box>

            <Typography variant='h5' sx={{ mt: 0 }}>
              Service EVV
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 3
              }}
            >
              <Box sx={{ width: '55%' }}>
                <TextField
                  size='small'
                  placeholder='Search Service'
                  id='service-search'
                  fullWidth
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
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 0, gap: 2 }}>
                <Button variant='contained' component='label'>
                  Upload DHS File
                  <input type='file' hidden accept='application/pdf' onChange={handlePDFUpload} />
                </Button>
                <Button variant='contained' onClick={handleAddServiceModalShow}>
                  Add New Service
                </Button>
              </Box>
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
        )}

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
                  Services (DHS). Disabling EVV may result in non-compliance with those requirements. Proceed only if
                  you understand and accept responsibility for this configuration
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

        <Dialog
          open={dhsServicesModal}
          onClose={handleDhsServicesModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible', minWidth: 500 } }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleDhsServicesModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex w-full px-5 flex-col'>
            <div>
              <h2 className='text-xl font-semibold mt-5 mb-4'>DHS Services Mapped Successfully</h2>
            </div>
            <div>
              <Typography className='mb-3'>
                Total Services Extracted: {dhsUploadData?.data?.totalExtractedServices}
              </Typography>
            </div>
            <div>
              <Typography className='mb-3'>
                Services Uploaded Successfully: {dhsUploadData?.data?.successfulUploads}
              </Typography>
            </div>
            <div>
              <Typography className='mb-3'>Failed Entries: {dhsUploadData?.data?.failedEntries}</Typography>
            </div>
            <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
              <Button variant='contained' onClick={handleDhsServicesModalClose}>
                OK
              </Button>
            </div>
          </div>
        </Dialog>

        {/** Add New Service Modal **/}

        <Dialog
          open={isAddServiceModalShow}
          onClose={handleAddServiceModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleAddServiceModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            <form onSubmit={handleSubmit(handleAddNewService)}>
              <div>
                <h2 className='text-xl font-semibold mt-5 mb-4'>Add New Service</h2>
              </div>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Service Name'}
                    placeHolder={'Service Name'}
                    name={'serviceName'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.serviceName}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Service Description'}
                    placeHolder={'Service Description'}
                    name={'serviceDescription'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.serviceDescription}
                    control={control}
                    isRequired={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Procedure Code'}
                    placeHolder={'Procedure Code'}
                    name={'procedureCode'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.procedureCode}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Modifier Code'}
                    placeHolder={'Modifier Code'}
                    name={'modifierCode'}
                    defaultValue={''}
                    type={'text'}
                    error={errors.modifierCode}
                    control={control}
                    isRequired={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Service Rate'}
                    placeHolder={'Service Rate'}
                    name={'serviceRate'}
                    defaultValue={''}
                    type={'number'}
                    error={errors.serviceRate}
                    control={control}
                    isRequired={false}
                  />
                </Grid>
              </Grid>
              <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                <Button variant='outlined' color='secondary' onClick={handleAddServiceModalClose}>
                  CANCEL
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  disabled={addServiceLoading}
                  startIcon={addServiceLoading ? <CircularProgress size={16} /> : null}
                >
                  CREATE
                </Button>
              </div>
            </form>
          </div>
        </Dialog>

        {/** Edit Existing Service Modal **/}

        <Dialog
          open={isEditServiceModalShow}
          onClose={handleEditServiceModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
          maxWidth='md'
        >
          <DialogCloseButton onClick={handleEditServiceModalClose} disableRipple>
            <i className='bx-x' />
          </DialogCloseButton>
          <div className='flex items-center justify-center w-full px-5 flex-col'>
            <form onSubmit={handleSubmit(handleServiceEdit)}>
              <div>
                <h2 className='text-xl font-semibold mt-5 mb-4'>Edit Service</h2>
              </div>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Service Name'}
                    placeHolder={'Service Name'}
                    name={'serviceName'}
                    defaultValue={serviceToEdit?.name || ''}
                    type={'text'}
                    error={errors.serviceName}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Service Description'}
                    placeHolder={'Service Description'}
                    name={'serviceDescription'}
                    defaultValue={serviceToEdit?.description || ''}
                    type={'text'}
                    error={errors.serviceDescription}
                    control={control}
                    isRequired={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Procedure Code'}
                    placeHolder={'Procedure Code'}
                    name={'procedureCode'}
                    defaultValue={serviceToEdit?.procedureCode || ''}
                    type={'text'}
                    error={errors.procedureCode}
                    control={control}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Modifier Code'}
                    placeHolder={'Modifier Code'}
                    name={'modifierCode'}
                    defaultValue={serviceToEdit?.modifierCode || ''}
                    type={'text'}
                    error={errors.modifierCode}
                    control={control}
                    isRequired={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomTextField
                    label={'Service Rate'}
                    placeHolder={'Service Rate'}
                    name={'serviceRate'}
                    defaultValue={serviceToEdit?.rate || ''}
                    type={'number'}
                    error={errors.serviceRate}
                    control={control}
                    isRequired={false}
                  />
                </Grid>
              </Grid>
              <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
                <Button variant='outlined' color='secondary' onClick={handleEditServiceModalClose}>
                  CANCEL
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  disabled={editServiceLoading}
                  startIcon={editServiceLoading ? <CircularProgress size={16} /> : null}
                >
                  UPDATE
                </Button>
              </div>
            </form>
          </div>
        </Dialog>
      </FormProvider>
    </>
  )
}

export default TenantConfiguration

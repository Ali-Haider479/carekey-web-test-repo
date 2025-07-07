'use client'
import { Add, MoreVert } from '@mui/icons-material'
import {
  Button,
  Card,
  Grid2 as Grid,
  Dialog,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Autocomplete,
  TextField,
  CircularProgress,
  CardHeader,
  CardContent,
  FormControlLabel,
  Checkbox,
  Box,
  Divider
} from '@mui/material'
import { useEffect, useState } from 'react'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { FormProvider, useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import { useParams } from 'next/navigation'
import axios from 'axios'
import ReactTable from '@/@core/components/mui/ReactTable'
import TabContext from '@mui/lab/TabContext'
import CustomTabList from '@/@core/components/mui/TabList'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import { ServiceAuthListModal } from './ServiceAuthModal'
import api from '@/utils/api'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import OcrCustomDropDown from '@/@core/components/custom-inputs/OcrCustomDropdown'
import { placeOfServiceOptions, payerOptions } from '@/utils/constants'
import { useTheme } from '@emotion/react'

const options = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' }
]

interface ServiceAuthPayload {
  payer: string
  memberId: number
  serviceAuthNumber: number
  procedureCode: string
  modifierCode: string
  startDate: Date
  endDate: Date
  serviceRate: number
  units: number
  diagnosisCode: string
  umpiNumber: string
  reimbursementType: string
  taxonomy: string
  frequency: string
  clientId: number
  billable: boolean
  placeOfService: string
  serviceName: string
}

interface FormRow {
  procedureCode: string
  modifier: string
  startDate: string
  endDate: string
  serviceRate: string
  quantity: string
  frequency: string
  reimbursement: string
  serviceName: string
}

const ServiceAuthorization = () => {
  const { id } = useParams()
  const clientId = Number(id)
  const [selectedTab, setSelectedTab] = useState('active-service-auth')
  const [isModalShow, setIsModalShow] = useState(false)
  const [isListModalShow, setIsListModalShow] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serviceAuthData, setServiceAuthData] = useState<any[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [currentItem, setCurrentItem] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const currentDate = new Date()
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const [billable, setBillable] = useState<boolean>(true)
  const theme: any = useTheme()

  const activeServices = serviceAuthData.filter(item => {
    const endDate = new Date(item.endDate)
    return endDate >= currentDate
  })

  const expiredServices = serviceAuthData.filter(item => {
    const endDate = new Date(item.endDate)
    return endDate < currentDate
  })

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: any) => {
    setAnchorEl(event.currentTarget)
    setCurrentItem(item)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleListModalClose = () => {
    setIsListModalShow(false)
  }

  const handleModalClose = () => {
    reset({
      payer: '',
      memberId: '',
      serviceAuthNumber: '',
      procedureCode: '',
      modifierCode: '',
      startDate: undefined,
      endDate: undefined,
      serviceRate: '',
      units: '',
      diagnosisCode: '',
      umpiNumber: '',
      reimbursementType: '',
      taxonomy: '',
      frequency: '',
      placeOfService: 'home',
      serviceName: ''
    })
    setBillable(true)
    setIsModalShow(false)
    setCurrentItem(null)
    setIsEditMode(false)
  }

  const handleAddNew = () => {
    setIsEditMode(false)
    setCurrentItem(null)
    setIsModalShow(true)
  }

  const handleEdit = (item: any) => {
    setIsEditMode(true)
    setCurrentItem(item)
    setBillable(item.billable !== undefined ? item.billable : true)

    const formattedStartDate = item.startDate ? new Date(item.startDate) : undefined
    const formattedEndDate = item.endDate ? new Date(item.endDate) : undefined

    reset({
      payer: item.payer || '',
      memberId: item.memberId || '',
      serviceAuthNumber: item.serviceAuthNumber || '',
      procedureCode: item.procedureCode || '',
      modifierCode: item.modifierCode || '',
      startDate: formattedStartDate || undefined,
      endDate: formattedEndDate || undefined,
      serviceRate: item.serviceRate || '',
      units: item.units || '',
      diagnosisCode: item.diagnosisCode || '',
      umpiNumber: item.umpiNumber || '',
      reimbursementType: item.reimbursementType || '',
      taxonomy: item.taxonomy || '',
      frequency: item.frequency || '',
      placeOfService: item.placeOfService || 'home',
      serviceName: item.serviceName || ''
    })

    setIsModalShow(true)
    handleMenuClose()
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Search query:', event.target.value)
  }

  const methods = useForm<any>({
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

  const calculateQuantityPerFrequency = ({
    startDate,
    endDate,
    quantity,
    frequency
  }: {
    startDate?: string | Date
    endDate?: string | Date
    quantity?: string | number
    frequency?: string
  }): number => {
    const parseQuantity = (qty: string | number | undefined): number => {
      if (qty === undefined || qty === null) return NaN
      if (typeof qty === 'number') return isNaN(qty) ? NaN : qty
      const cleaned = qty.replace(/,/g, '')
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? NaN : parsed
    }

    const parsedQuantity = parseQuantity(quantity)

    if (!startDate || !endDate || isNaN(parsedQuantity) || !frequency) {
      return NaN
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return NaN
    }

    const timeDiffMs = end.getTime() - start.getTime()
    let frequencyUnits: number
    switch (frequency.toLowerCase()) {
      case 'daily':
        frequencyUnits = timeDiffMs / (1000 * 60 * 60 * 24)
        break
      case 'weekly':
        frequencyUnits = timeDiffMs / (1000 * 60 * 60 * 24 * 7)
        break
      case 'monthly':
        frequencyUnits = timeDiffMs / (1000 * 60 * 60 * 24 * 30.42)
        break
      default:
        return NaN
    }

    return frequencyUnits <= 0 ? NaN : parsedQuantity / frequencyUnits
  }

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true)
      const serviceAuthPayload: ServiceAuthPayload = {
        payer: data.payer,
        memberId: Number(data.memberId),
        serviceAuthNumber: Number(data.serviceAuthNumber),
        procedureCode: data.procedureCode,
        modifierCode: data.modifierCode,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        serviceRate: Number(data.serviceRate),
        units: Number(data.units),
        diagnosisCode: data.diagnosisCode,
        umpiNumber: data.umpiNumber,
        reimbursementType: data.reimbursementType,
        taxonomy: data.taxonomy,
        frequency: data.frequency,
        clientId: clientId,
        billable: billable,
        placeOfService: data.placeOfService,
        serviceName: data.serviceName
      }

      if (isEditMode && currentItem) {
        const response = await api.patch(`/client/service-auth/${currentItem.id}`, serviceAuthPayload)
        const accountHistoryPayLoad = {
          actionType: 'ClientServiceAuthUpdate',
          details: `Service authorization updated for Client (ID: ${id}) by User (ID: ${authUser?.id})`,
          userId: authUser?.id,
          clientId: id
        }
        await api.post(`/account-history/log`, accountHistoryPayLoad)
        setServiceAuthData(serviceAuthData.map(item => (item.id === currentItem.id ? response.data : item)))
      } else {
        const response = await api.post(`/client/service-auth`, serviceAuthPayload)
        const accountHistoryPayLoad = {
          actionType: 'ClientServiceAuthCreate',
          details: `Service authorization created for Client (ID: ${id}) by User (ID: ${authUser?.id})`,
          userId: authUser?.id,
          clientId: id
        }
        await api.post(`/account-history/log`, accountHistoryPayLoad)
        setServiceAuthData([...serviceAuthData, response.data])
      }
      setIsLoading(false)
      handleModalClose()
    } catch (error) {
      setIsLoading(false)
      console.error('Error posting data: ', error)
    }
  }

  const fetchClientServiceAuthData = async () => {
    try {
      const fetchedData = await api.get(`/client/${clientId}/service-auth`)
      setServiceAuthData(fetchedData?.data.length > 0 ? fetchedData?.data : [])
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  useEffect(() => {
    fetchClientServiceAuthData()
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue)
  }

  const newColumns = [
    {
      id: 'payer',
      label: 'PAYER',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.payer}</Typography>
    },
    {
      id: 'memberId',
      label: 'MEMBER ID',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.memberId}</Typography>
    },
    {
      id: 'serviceAuthNumber',
      label: 'SERVICE AUTH NO.',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.serviceAuthNumber}</Typography>
    },
    {
      id: 'procedureAndModifier',
      label: 'PRO & MOD',
      minWidth: 170,
      render: (item: any) => (
        <Typography>
          {item?.procedureCode}, {item?.modifierCode}
        </Typography>
      )
    },
    {
      id: 'startDateEndDate',
      label: 'START DATE / END DATE',
      minWidth: 170,
      render: (item: any) => {
        const formatDate = (dateString: string) => {
          const date = new Date(dateString)
          return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          })
        }
        const startDate = formatDate(item?.startDate)
        const endDate = formatDate(item?.endDate)
        return (
          <Typography>
            {startDate} - {endDate}
          </Typography>
        )
      }
    },
    {
      id: 'serviceRate',
      label: 'RATE',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.serviceRate}</Typography>
    },
    {
      id: 'totalUnits',
      label: 'TOTAL UNITS',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.units}</Typography>
    },
    {
      id: 'remainingUnits',
      label: 'REMIANING UNITS',
      minWidth: 170,
      render: (item: any) => {
        const remianingUnits = item?.units - item?.usedUnits
        return <Typography>{remianingUnits}</Typography>
      }
    },
    {
      id: 'perDayHours',
      label: 'PER DAY (HRS)',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.units}</Typography>
    },
    {
      id: 'perWeekHours',
      label: 'PER WEEK (HRS)',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.units}</Typography>
    },
    {
      id: 'bankedHours',
      label: 'BANKED HOURS',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.units}</Typography>
    },
    {
      id: 'action',
      label: 'ACTION',
      minWidth: 170,
      render: (item: any) => (
        <>
          <IconButton onClick={e => handleMenuClick(e, item)}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleEdit(currentItem)}>Edit</MenuItem>
          </Menu>
        </>
      )
    }
  ]

  const handleChange = (event: any, newValue: any) => {
    console.log('Selected:', newValue)
  }

  return (
    <>
      <FormProvider {...methods}>
        <Card className=' w-full flex flex-col h-36 p-4 shadow-md rounded-lg'>
          <span className='ml-2 text-2xl font-bold '>Filters</span>
          <div className='flex justify-between'>
            <div className='w-[530px] mt-4'>
              <Autocomplete
                options={options}
                getOptionLabel={option => option.label}
                onInputChange={() => handleSearch}
                onChange={handleChange}
                renderInput={params => (
                  <TextField {...params} placeholder='Show All' variant='outlined' size='small' className='h-[56px]' />
                )}
                filterOptions={x => x}
              />
            </div>
            <div className='flex justify-end gap-3'>
              <Button startIcon={<Add />} className='w-[160px] h-10' onClick={() => setIsListModalShow(true)}>
                ADD SA LIST
              </Button>
            </div>
          </div>
        </Card>
        <Card className='w-full flex flex-col h-auto mt-5 shadow-md rounded-lg gap-5 p-5'>
          {isLoading ? (
            <span className='text-center'>
              <CircularProgress />
            </span>
          ) : (
            <>
              <div className='flex justify-between items-start'>
                <TabContext value={selectedTab}>
                  <Grid container spacing={6}>
                    <Grid size={{ xs: 12, md: 12 }}>
                      <CustomTabList orientation='horizontal' onChange={handleTabChange} className='is-fit' pill='true'>
                        <Tab
                          label='Active Service'
                          iconPosition='start'
                          value='active-service-auth'
                          className='flex-row justify-start'
                        />
                        <Tab
                          label='Expired Service'
                          iconPosition='start'
                          value='expired-service-auth'
                          className='flex-row justify-start'
                        />
                      </CustomTabList>
                    </Grid>
                  </Grid>
                </TabContext>
              </div>
              {!serviceAuthData?.length ? (
                <Typography className='p-5 flex items-center justify-center'>No Data Available</Typography>
              ) : (
                <ReactTable
                  columns={newColumns}
                  data={selectedTab === 'active-service-auth' ? activeServices : expiredServices}
                  keyExtractor={item => item.id.toString()}
                  enablePagination
                  pageSize={25}
                  stickyHeader
                  maxHeight={600}
                  containerStyle={{ borderRadius: 2 }}
                />
              )}
            </>
          )}
        </Card>
        <div>
          <Dialog
            open={isModalShow}
            onClose={handleModalClose}
            maxWidth='lg'
            sx={{
              '& .MuiDialog-paper': {
                overflow: 'visible',
                maxHeight: '90vh',
                width: '100%'
              },
              '& .MuiDialogContent-root': {
                overflowY: 'auto'
              }
            }}
          >
            <DialogCloseButton onClick={handleModalClose} disableRipple>
              <i className='bx-x' />
            </DialogCloseButton>
            <Box sx={{ overflowY: 'auto', maxHeight: 'calc(90vh - 64px)', position: 'relative' }}>
              {isLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                  }}
                >
                  <CircularProgress size={40} color='success' />
                </Box>
              )}
              <Box sx={{ filter: isLoading ? 'blur(0.8px)' : 'none', pointerEvents: isLoading ? 'none' : 'auto' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    position: 'sticky',
                    top: 0,
                    zIndex: 5,
                    padding: '1rem 1rem',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                >
                  <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                    {isEditMode ? 'Edit Service Authorization' : 'Add Service Authorization'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginRight: '1rem' }}>
                    <Button variant='contained' onClick={handleModalClose} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button variant='contained' onClick={handleSubmit(onSubmit)} disabled={isLoading}>
                      {isEditMode ? 'Update' : 'Save'}
                    </Button>
                  </Box>
                </Box>

                <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
                  <Card sx={{ mx: 2, mb: 2, boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 20px' }}>
                    <CardHeader title='General Info' />
                    <CardContent>
                      <Grid container spacing={4}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <OcrCustomDropDown
                            label='Payer'
                            name='payer'
                            value={watch('payer')}
                            onChange={(e: any) => setValue('payer', e.target.value)}
                            optionList={payerOptions}
                            disabled={isLoading}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <CustomTextField
                            label='Member ID'
                            placeHolder='Member ID'
                            name='memberId'
                            type='number'
                            error={errors.memberId}
                            control={control}
                            defaultValue={''}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <CustomTextField
                            label='Service Auth Number'
                            placeHolder='Service Auth Number'
                            name='serviceAuthNumber'
                            type='number'
                            error={errors.serviceAuthNumber}
                            control={control}
                            defaultValue={''}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <CustomTextField
                            label='Diagnosis Code'
                            placeHolder='Diagnosis Code'
                            name='diagnosisCode'
                            type='text'
                            error={errors.diagnosisCode}
                            control={control}
                            defaultValue={''}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <CustomTextField
                            label='Taxonomy'
                            placeHolder='Taxonomy'
                            name='taxonomy'
                            type='text'
                            error={errors.taxonomy}
                            control={control}
                            defaultValue={''}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <CustomTextField
                            label='Npi/Umpi'
                            placeHolder='Npi/Umpi'
                            name='umpiNumber'
                            type='text'
                            error={errors.umpiNumber}
                            control={control}
                            defaultValue={''}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <OcrCustomDropDown
                            label='Place Of Service'
                            name='placeOfService'
                            value={watch('placeOfService')}
                            onChange={(e: any) => setValue('placeOfService', e.target.value)}
                            optionList={placeOfServiceOptions}
                            disabled={isLoading}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>

                    <Box
                      sx={{
                        height: '20px',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: '-16px',
                          right: '-16px',
                          height: '5px',
                          backgroundColor: theme.palette.mode === 'light' ? '#C1C1C1' : '#212131',
                          boxShadow: 'rgba(0, 0, 0, 0.1) 0px -2px 5px, rgba(0, 0, 0, 0.1) 0px 2px 5px',
                          zIndex: 0
                        }
                      }}
                    />

                    <Typography
                      variant='h5'
                      sx={{
                        marginInlineStart: '25px'
                      }}
                    >
                      Services
                    </Typography>
                    <CardContent>
                      <Box sx={{ mb: 4, position: 'relative' }}>
                        <Grid container spacing={2} alignItems='center'>
                          <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                              <Divider sx={{ flex: 1 }} />
                              <Typography variant='h6' sx={{ textAlign: 'center', minWidth: '2rem' }}>
                                1
                              </Typography>
                              <Divider sx={{ flex: 1 }} />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={billable}
                                    onChange={() => setBillable(!billable)}
                                    disabled={isLoading}
                                  />
                                }
                                label='Billable'
                              />
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <CustomTextField
                              label='Service Description'
                              placeHolder='Service Description'
                              name='serviceName'
                              type='text'
                              error={errors.serviceName}
                              control={control}
                              defaultValue={''}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <CustomTextField
                              label='Procedure Code'
                              placeHolder='Procedure Code'
                              name='procedureCode'
                              type='text'
                              error={errors.procedureCode}
                              control={control}
                              defaultValue={''}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <CustomTextField
                              label='Modifier'
                              placeHolder='Modifier'
                              name='modifierCode'
                              type='text'
                              error={errors.modifierCode}
                              control={control}
                              isRequired={false}
                              defaultValue={''}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <AppReactDatepicker
                              selectsRange
                              startDate={watch('startDate') ? new Date(watch('startDate')) : null}
                              endDate={watch('endDate') ? new Date(watch('endDate')) : null}
                              id='dateRange'
                              onChange={(dates: [Date | null, Date | null]) => {
                                setValue('startDate', dates[0] || undefined)
                                setValue('endDate', dates[1] || undefined)
                              }}
                              placeholderText='MM/DD/YYYY - MM/DD/YYYY'
                              customInput={
                                <TextField
                                  fullWidth
                                  size='small'
                                  label='Start and End Date'
                                  placeholder='MM/DD/YYYY - MM/DD/YYYY'
                                  disabled={isLoading}
                                  InputProps={{
                                    endAdornment: (
                                      <IconButton size='small'>
                                        <CalendarTodayIcon style={{ scale: 1 }} />
                                      </IconButton>
                                    )
                                  }}
                                />
                              }
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <CustomTextField
                              label='Service Rate'
                              placeHolder='Service Rate'
                              name='serviceRate'
                              type='text'
                              error={errors.serviceRate}
                              control={control}
                              defaultValue={''}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <OcrCustomDropDown
                              label='Reimbursement'
                              name='reimbursementType'
                              value={watch('reimbursementType')}
                              onChange={(e: any) => setValue('reimbursementType', e.target.value)}
                              optionList={[
                                { key: 1, value: 'per unit', optionString: 'Per Unit' },
                                { key: 2, value: 'per diem', optionString: 'Per Diem' }
                              ]}
                              disabled={isLoading}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <CustomTextField
                              label='Quantity'
                              placeHolder='Quantity'
                              name='units'
                              type='text'
                              error={errors.units}
                              control={control}
                              defaultValue={''}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <OcrCustomDropDown
                              label='Frequency'
                              name='frequency'
                              value={watch('frequency')}
                              onChange={(e: any) => setValue('frequency', e.target.value)}
                              optionList={[
                                { key: 1, value: 'daily', optionString: 'Daily' },
                                { key: 2, value: 'weekly', optionString: 'Weekly' },
                                { key: 3, value: 'monthly', optionString: 'Monthly' }
                              ]}
                              disabled={isLoading}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <Typography sx={{ paddingBottom: 0, marginBottom: -0.8 }}>
                              Quantity per Frequency
                            </Typography>
                            {isNaN(
                              calculateQuantityPerFrequency({
                                startDate: watch('startDate'),
                                endDate: watch('endDate'),
                                quantity: watch('units'),
                                frequency: watch('frequency')
                              })
                            )
                              ? 'N/A'
                              : calculateQuantityPerFrequency({
                                  startDate: watch('startDate'),
                                  endDate: watch('endDate'),
                                  quantity: watch('units'),
                                  frequency: watch('frequency')
                                }).toFixed(2)}
                          </Grid>
                        </Grid>
                      </Box>
                    </CardContent>
                  </Card>
                </form>
              </Box>
            </Box>
          </Dialog>
          <ServiceAuthListModal
            open={isListModalShow}
            onClose={handleListModalClose}
            clientId={id}
            fetchClientServiceAuthData={fetchClientServiceAuthData}
          />
        </div>
      </FormProvider>
    </>
  )
}

export default ServiceAuthorization

'use client'
import { CheckOutlined, CloseOutlined, Search } from '@mui/icons-material'
import { Box, Button, Card, CardContent, CircularProgress, Typography, TextField, IconButton } from '@mui/material'
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import AcknowledgeSignature from './ClientSignatureSection'
import AcknowledgeSignatureCaregiver from './CaregiverSignatureSection'
import { useParams } from 'next/navigation'
import ReactTable from '@/@core/components/mui/ReactTable'
import './table.css'
import api from '@/utils/api'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, { AccordionSummaryProps, accordionSummaryClasses } from '@mui/material/AccordionSummary'
import { styled } from '@mui/material/styles'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import { exportToPDF } from './timesheetPDF'

// Define interfaces for type safety
interface Signature {
  clientSignature?: string
  caregiverSignature?: string
  createdAt?: string
  signatureStatus?: string
}

interface Caregiver {
  id: number
  firstName: string
  lastName: string
  caregiverUMPI?: string
  [key: string]: any
}

interface Client {
  id: number
  firstName: string
  lastName: string
  clientCode?: string
  pmiNumber?: string
  [key: string]: any
}

interface PayPeriodHistory {
  id: number
  startDate: string
  endDate: string | null
  numberOfWeeks: number
}

interface Activity {
  id: number
  title: string
}

interface CheckedActivity {
  id: number
  activities: Activity[]
}

export interface ServiceEntry {
  id: number
  dateOfService: string
  manualEntry: boolean
  clockIn: string
  clockOut: string
  notes: string
  serviceName: string
  caregiver: Caregiver
  client: Client
  checkedActivity: CheckedActivity
  payPeriodHistory: PayPeriodHistory
  locApproved: any
  startLocation: any
  signature?: Signature
}

interface DetailItemProps {
  label: string
  value: string | number
}

interface Column {
  id: string
  label: string
  minWidth: number
  align?: 'center' | 'right' | 'left'
  render?: (params: any) => JSX.Element
}

export interface SignatureState {
  image: string
  text: string
  date: string
}

interface DataByCaregiver {
  [key: number]: ServiceEntry[]
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div className='flex justify-between text-sm'>
    <Typography className='text-base font-bold'>{label}</Typography>
    <Typography className='text-base font-bold'>{value}</Typography>
  </div>
)

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
  ({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: 0
    },
    '&::before': {
      display: 'none'
    }
  })
)

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]: {
    transform: 'rotate(90deg)'
  },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1)
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(255, 255, 255, .05)'
  })
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)'
}))

const TimeSheets = () => {
  const { id } = useParams()
  const [timelogData, setTimelogData] = useState<ServiceEntry[][]>([])
  const [isLoading, setIsLoading] = useState(false)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [expanded, setExpanded] = React.useState<string | false>('panel0')
  const [timeSheetDataLoading, setTimeSheetDataLoading] = useState<boolean>(false)
  // const [clientSignature, setClientSignature] = useState<SignatureState>({ image: '', text: '', date: '' })
  // const [caregiverSignature, setCaregiverSignature] = useState<SignatureState>({ image: '', text: '', date: '' })

  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false)
  }

  const handleSearch = async () => {
    if (!dateRange || dateRange.length < 2) {
      console.log('Please select both start and end dates')
      return
    }
    setTimeSheetDataLoading(true)
    try {
      const [startDate, endDate] = dateRange

      // Format dates to YYYY-MM-DD (without time)
      if (!startDate || !endDate) {
        console.log('Please select both start and end dates')
        return
      }
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      console.log('Searching for date range:', startDateStr, 'to', endDateStr)

      // Add query parameters
      const params = new URLSearchParams({
        startDate: startDateStr,
        endDate: endDateStr
      })

      const filteredTimeLogRes = await api.get(`/time-log/by-client/${id}?${params.toString()}`)

      console.log('filteredTimeLogRes-------->', filteredTimeLogRes.data)
      const dataByCaregiver: DataByCaregiver = filteredTimeLogRes?.data?.reduce(
        (acc: DataByCaregiver, entry: ServiceEntry) => {
          const caregiverId: number | undefined = entry.caregiver?.id

          if (caregiverId === undefined) {
            console.warn('Entry missing caregiver ID:', entry)
            return acc
          }

          if (!acc[caregiverId]) {
            acc[caregiverId] = []
          }

          acc[caregiverId].push(entry)
          return acc
        },
        {} as DataByCaregiver
      )

      const dataByCaregiverArray = Object.values(dataByCaregiver)
      setTimelogData(dataByCaregiverArray)
    } catch (error) {
      console.error('Error fetching time logs:', error)
      throw error
    } finally {
      setTimeSheetDataLoading(false)
    }
  }

  // Helper function to get the latest signature

  const fetchTimeLog = async () => {
    setTimeSheetDataLoading(true)

    try {
      const response = await api.get<ServiceEntry[]>(`/time-log/client/${id}`)
      const data = response.data

      const dataByCaregiver: DataByCaregiver = data.reduce((acc, entry) => {
        const caregiverId = entry.caregiver?.id

        if (caregiverId === undefined) {
          console.warn('Entry missing caregiver ID:', entry)
          return acc
        }

        if (!acc[caregiverId]) {
          acc[caregiverId] = []
        }

        acc[caregiverId].push(entry)
        return acc
      }, {} as DataByCaregiver)

      const dataByCaregiverArray = Object.values(dataByCaregiver)
      setTimelogData(dataByCaregiverArray)
      if (dataByCaregiverArray.length > 0)
        setDateRange([
          new Date(dataByCaregiverArray[0][0].payPeriodHistory.startDate),
          new Date(dataByCaregiverArray[0][0].payPeriodHistory.endDate)
        ])
    } catch (error) {
      console.error('Error fetching time log data:', error)
    } finally {
      setTimeSheetDataLoading(false)
    }
  }

  useEffect(() => {
    fetchTimeLog()
  }, [])

  useEffect(() => {
    if (dateRange[0] === null && dateRange[1] === null) {
      fetchTimeLog()
    }
  }, [dateRange])

  const columns: Column[] = [
    {
      id: 'payPeriod',
      label: 'DATE',
      minWidth: 170,
      render: (params: any) => {
        const startTime = params?.clockIn
        return (
          <Typography className='font-normal text-base my-3'>
            {startTime
              ? new Date(startTime).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              : 'N/A'}
          </Typography>
        )
      }
    },
    {
      id: 'radio',
      label: 'RADIO',
      minWidth: 170,
      align: 'center',
      render: () => <Typography className='font-normal text-base my-3'>1:1</Typography>
    },
    {
      id: 'locationShared',
      label: 'SHARED LOCATION',
      minWidth: 170,
      align: 'center',
      render: (params: any) => (
        <Typography className='font-normal text-base my-3'>{params?.startLocation ? 'Yes' : 'No'}</Typography>
      )
    },
    {
      id: 'locApproved',
      label: 'LOC APPROVED',
      minWidth: 170,
      align: 'center',
      render: (params: any) => (
        <>
          {params.locApproved ? (
            <CheckOutlined className='text-[#71DD37]' />
          ) : (
            <CloseOutlined className='text-[#FF3E1D]' />
          )}
        </>
      )
    },
    {
      id: 'stayFacility',
      label: 'FACILITY STAY',
      minWidth: 170,
      align: 'center',
      render: () => <Typography className='font-normal text-base my-3'>NO</Typography>
    },
    {
      id: 'timeIn',
      label: 'TIME IN',
      minWidth: 170,
      render: (params: any) => {
        const startTime = params?.clockIn
        return (
          <Typography className='font-normal text-base my-3'>
            {startTime
              ? new Date(startTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })
              : 'N/A'}
          </Typography>
        )
      }
    },
    {
      id: 'timeOut',
      label: 'TIME-OUT',
      minWidth: 170,
      render: (params: any) => {
        const endTime = params?.clockOut
        return (
          <Typography className='font-normal text-base my-3'>
            {endTime
              ? new Date(endTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })
              : 'N/A'}
          </Typography>
        )
      }
    },
    {
      id: 'activities',
      label: 'ACTIVITIES',
      minWidth: 170,
      render: (params: any) =>
        params.checkedActivity ? (
          <Typography className='font-normal text-base my-3'>
            {params?.checkedActivity?.activities.map((activity: any) => activity.title).join(', ')}
          </Typography>
        ) : (
          <CloseOutlined className='text-[#FF3E1D]' />
        )
    }
  ]

  const generateWeekDates = (startDate: string, numberOfWeeks: number): moment.Moment[] => {
    if (!startDate) return []
    const dates: moment.Moment[] = []
    const start = moment(startDate).startOf('day')
    const end = moment(start).add(numberOfWeeks * 7 - 1, 'days')
    let current = moment(start)
    while (current.isSameOrBefore(end)) {
      dates.push(moment(current))
      current.add(1, 'days')
    }
    return dates
  }

  const calculateDuration = (clockIn: string, clockOut: string): number => {
    if (!clockIn || !clockOut) return 0
    const start = moment.parseZone(clockIn)
    const end = moment.parseZone(clockOut)
    const duration = end.diff(start, 'minutes')
    return Math.max(0, duration)
  }

  const processDurationsByDate = (serviceData: ServiceEntry[], weekDates: moment.Moment[]) => {
    const durationsByDate: { [key: string]: number } = {}
    weekDates.forEach(date => {
      durationsByDate[date.format('YYYY-MM-DD')] = 0
    })
    serviceData.forEach(entry => {
      const serviceDate = moment(entry.dateOfService).format('YYYY-MM-DD')
      const duration = calculateDuration(entry.clockIn, entry.clockOut)
      durationsByDate[serviceDate] = (durationsByDate[serviceDate] || 0) + duration
    })
    return durationsByDate
  }

  // Calculate total worked hours across all caregivers and dates
  const totalWorkedHrs = timelogData.reduce((total, caregiverEntries) => {
    return (
      total +
      caregiverEntries.reduce((sum, entry) => {
        return sum + calculateDuration(entry.clockIn, entry.clockOut)
      }, 0)
    )
  }, 0)
  // To display in hours and minutes:
  const totalWorkedHrsFormatted = `${Math.floor(totalWorkedHrs / 60)} hrs ${totalWorkedHrs % 60} min`
  const totalSignedHrs = timelogData.reduce((total, caregiverEntries) => {
    return (
      total +
      caregiverEntries.reduce((sum, entry) => {
        // Count only if either clientSignature or caregiverSignature exists
        if (entry.signature?.signatureStatus === 'Taken') {
          return sum + calculateDuration(entry.clockIn, entry.clockOut)
        }
        return sum
      }, 0)
    )
  }, 0)
  // To display in hours and minutes:
  const totalSignedHrsFormatted = `${Math.floor(totalSignedHrs / 60)} hrs ${totalSignedHrs % 60} min`

  // const formatDuration = (minutes: number): string => {
  //   if (!minutes || minutes < 0) return '0:00'
  //   const hours = Math.floor(minutes / 60)
  //   const mins = Math.round(minutes % 60)
  //   return `${hours}:${mins.toString().padStart(2, '0')}`
  // }

  const weekDates =
    timelogData.length > 0 && timelogData[0].length > 0
      ? generateWeekDates(
          timelogData[0][0]?.payPeriodHistory?.startDate,
          timelogData[0][0]?.payPeriodHistory?.numberOfWeeks
        )
      : []

  const durationsByDate =
    timelogData.length > 0 && timelogData[0].length > 0 ? processDurationsByDate(timelogData[0], weekDates) : {}

  // const tableData = [
  //   {
  //     id: '1',
  //     ...weekDates.reduce((acc: { [key: string]: string }, date) => {
  //       const dateStr = date.format('YYYY-MM-DD')
  //       const duration = durationsByDate[dateStr] || 0
  //       acc[dateStr] = formatDuration(duration)
  //       return acc
  //     }, {})
  //   }
  // ]

  // const tableColumns = weekDates.map(date => {
  //   const dayName = date.format('ddd').toUpperCase()
  //   const dateStr = date.format('D MMMM')
  //   const label = `${dayName}\n${dateStr}`
  //   const columnId = date.format('YYYY-MM-DD')
  //   return {
  //     id: columnId,
  //     minWidth: 170,
  //     label,
  //     render: (params: any) => <Typography>{params[columnId] || '0:00'}</Typography>
  //   }
  // })

  const generateAndDownloadCSV = async () => {
    // Fix the condition (you had length! which is incorrect)
    if (!timelogData || timelogData.length === 0) {
      console.log('No data available for writing csv file')
      return
    }

    // Prepare headers
    const data = [
      [
        'Date',
        'Client Name',
        'Caregiver Name',
        'Radio',
        'Shared Location',
        'Location Approved',
        'Facility Stay',
        'Time In',
        'Time Out',
        'Activities'
      ]
    ]

    // Process each item
    timelogData.forEach(element => {
      element.forEach(item => {
        // Safely handle potential undefined values
        const date = item?.clockIn
          ? new Date(item.clockIn).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
          : 'N/A'

        const clientName = item.client ? `${item.client.firstName} ${item.client.lastName}` : 'N/A'

        const caregiverName = item.caregiver ? `${item.caregiver.firstName} ${item.caregiver.lastName}` : 'N/A'

        const locationShared = item.startLocation ? 'Yes' : 'No'
        const locApproved = item.locApproved ? 'Yes' : 'No'

        const timeIn = item?.clockIn
          ? new Date(item.clockIn)
              .toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
              .replace(/^0/, '') // Remove leading zero for more natural format
          : 'N/A'

        const timeOut = item?.clockOut
          ? new Date(item.clockOut)
              .toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
              .replace(/^0/, '')
          : 'N/A'

        const activities = item.checkedActivity?.activities
          ? item.checkedActivity.activities.map((activity: any) => activity.title).join(', ')
          : 'N/A'

        data.push([
          date,
          clientName,
          caregiverName,
          '1:1', // Radio seems to be static
          locationShared,
          locApproved,
          'No', // Facility Stay seems to be static
          timeIn,
          timeOut,
          activities
        ])
      })
    })

    try {
      // Convert to CSV string
      const csvContent = data.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')).join('\n')

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `timesheet_${timelogData[0][0].client.firstName}_${timelogData[0][0].client.lastName}_${dateRange && dateRange[0] && dateRange[1] ? `${new Date(dateRange[0]).toISOString().slice(0, 10)}-${new Date(dateRange[1]).toISOString().slice(0, 10)}` : `${timelogData[0][0].payPeriodHistory.startDate}-${timelogData[0][0].payPeriodHistory.endDate}`}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Revoke the object URL to free memory
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch (error) {
      console.error('Error generating CSV:', error)
    }
  }
  return (
    <>
      <>
        <div id='timesheet-content'>
          <Box
            sx={{
              display: 'flex',
              p: 2,
              justifyContent: 'space-between'
            }}
          >
            <Box component={'div'} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='body1' sx={{ whiteSpace: 'nowrap' }}>
                Select Date Range:
              </Typography>

              <AppReactDatepicker
                selectsRange
                id='event-date-range'
                startDate={dateRange[0] || null}
                endDate={dateRange[1]}
                selected={dateRange[0] || null}
                dateFormat='yyyy-MM-dd'
                maxDate={new Date()}
                sx={{ width: '225px' }}
                customInput={
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='Select date range'
                    InputLabelProps={{ shrink: false }}
                  />
                }
                onChange={(range: [Date | null, Date | null]) => {
                  const adjustForTimezone = (date: Date | null) => {
                    if (!date) return null
                    const newDate = new Date(date)
                    newDate.setMinutes(newDate.getMinutes() + newDate.getTimezoneOffset())
                    return newDate
                  }

                  setDateRange([adjustForTimezone(range[0]), adjustForTimezone(range[1])])
                }}
                dropdownMode='select'
              />

              <IconButton
                color='primary'
                onClick={handleSearch}
                sx={theme => ({
                  bgcolor: theme.palette.mode === 'light' ? 'primary.main' : 'primary.dark',
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.lighterOpacity
                  },
                  '&:disabled': {
                    bgcolor: 'action.disabledBackground'
                  },
                  borderRadius: 1
                })}
                disabled={!dateRange}
              >
                <Search />
              </IconButton>
            </Box>
            <Box component={'div'}>
              <Button
                className='bg-[#E89C00] mr-6'
                variant='contained'
                disabled={timeSheetDataLoading}
                onClick={generateAndDownloadCSV}
              >
                Export to CSV
              </Button>
              <Button
                className='bg-[#67C932]'
                variant='contained'
                onClick={() => {
                  exportToPDF({
                    setIsLoading,
                    authUser,
                    pdfData: timelogData,
                    weekDates,
                    durationsByDate
                  })
                }}
                disabled={isLoading || timeSheetDataLoading}
                startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : null}
              >
                Export PDF
              </Button>
            </Box>
          </Box>
          {timeSheetDataLoading ? (
            <Box id='timesheet-content' className='flex justify-center items-center min-h-[250px] w-full'>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {timelogData.length > 0 ? (
                <>
                  <Card className='h-fit w-[99%] m-2 mt-1 mb-3 shadow-md rounded-lg border-solid border-2'>
                    <div className='grid grid-cols-3 p-6 gap-[152px]'>
                      <DetailItem
                        label='Name:'
                        value={
                          timelogData.length > 0 && timelogData[0].length > 0
                            ? `${timelogData[0][0]?.client?.firstName || ''} ${timelogData[0][0]?.client?.lastName || ''}`
                            : ''
                        }
                      />
                      <DetailItem label='Total Hours:' value={`${totalWorkedHrsFormatted}`} />
                      <DetailItem label='Signed Hours:' value={`${totalSignedHrsFormatted}`} />
                    </div>
                  </Card>
                  {timelogData.map((item, index) => {
                    const weekDates = generateWeekDates(
                      item[0]?.payPeriodHistory?.startDate,
                      item[0]?.payPeriodHistory?.numberOfWeeks
                    )

                    const durationsByDate = processDurationsByDate(item, weekDates)
                    console.log('durationsByDate', durationsByDate)
                    // Calculate total hours (sum of all durations in minutes, then convert to hours)
                    const totalMinutes = Object.values(durationsByDate).reduce((sum, minutes) => sum + minutes, 0)
                    const totalHours = (totalMinutes / 60).toFixed(2)
                    return (
                      <Accordion
                        key={index}
                        expanded={expanded === `panel${index}`}
                        onChange={handleChange(`panel${index}`)}
                        sx={{ mx: 2 }}
                      >
                        <AccordionSummary aria-controls='panel1d-content' id='panel1d-header'>
                          <DetailItem
                            label=''
                            value={`${item[0]?.caregiver?.firstName || ''} ${item[0]?.caregiver?.lastName || ''}`}
                          />
                        </AccordionSummary>
                        <AccordionDetails>
                          <Card className='h-fit w-[99%] m-2 mt-1 mb-3 shadow-md rounded-lg border-solid border-2'>
                            <div className='grid grid-cols-2 p-6 gap-[152px]'>
                              <DetailItem label='Total Hours Worked:' value={`${totalHours} hrs`} />
                            </div>
                            <ReactTable
                              columns={columns}
                              data={Array.isArray(item) ? item : [item]}
                              keyExtractor={user => user.id.toString()}
                              enableRowSelect={false}
                              enablePagination={false}
                              pageSize={25}
                              stickyHeader
                              maxHeight={600}
                              containerStyle={{ borderRadius: 2 }}
                            />
                          </Card>
                          <AcknowledgeSignature data={item} />
                          <AcknowledgeSignatureCaregiver data={item} />
                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
                </>
              ) : (
                // <>
                //   <Card className='h-fit w-[99%] m-2 mt-1 mb-3 shadow-md rounded-lg border-solid border-2'>
                //     <div className='grid grid-cols-2 p-6 gap-[152px]'>
                //       <DetailItem
                //         label='Recipient Name:'
                //         value={`${timelogData[0]?.client?.firstName || ''} ${timelogData[0]?.client?.lastName || ''}`}
                //       />
                //       <DetailItem
                //         label='Caregiver Name:'
                //         value={`${timelogData[0]?.caregiver?.firstName || ''} ${timelogData[0]?.caregiver?.lastName || ''}`}
                //       />
                //     </div>
                //     <ReactTable
                //       columns={columns}
                //       data={timelogData}
                //       keyExtractor={user => user.id.toString()}
                //       enableRowSelect={false}
                //       enablePagination={false}
                //       pageSize={25}
                //       stickyHeader
                //       maxHeight={600}
                //       containerStyle={{ borderRadius: 2 }}
                //     />
                //   </Card>
                //   <Card className='h-fit w-[99%] ml-2 mt-3 shadow-md rounded-lg mb-3 border-solid border-2'>
                //     <h2 className='text-xl p-6'>Total Hours</h2>
                //     <ReactTable
                //       columns={tableColumns}
                //       data={tableData}
                //       keyExtractor={row => row.id.toString()}
                //       enableRowSelect={false}
                //       enablePagination={false}
                //       pageSize={25}
                //       stickyHeader
                //       maxHeight={600}
                //       containerStyle={{ borderRadius: 2 }}
                //     />
                //   </Card>
                //   <AcknowledgeSignature data={timelogData} />
                //   <AcknowledgeSignatureCaregiver data={timelogData} />
                // </>
                <Typography className='text-center w-full'>No timesheet data found.</Typography>
              )}
            </>
          )}
        </div>
        <CardContent className='mt-4 mb-4 flex justify-between'>
          {/* <div className='w-1/2 flex justify-start space-x-6'></div> */}
        </CardContent>
      </>
    </>
  )
}

export default TimeSheets

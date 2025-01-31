'use client'
import DataTable from '@/@core/components/mui/DataTable'
import { CheckOutlined, CloseOutlined } from '@mui/icons-material'
import { Button, Card, CardContent, Typography } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import AcknowledgeSignature from './ClientSignatureSection'
import AcknowledgeSignatureCaregiver from './CaregiverSignatureSection'
import { useParams } from 'next/navigation'
import axios from 'axios'

interface DetailItemProps {
  label: string
  value: string | number // Adjust the type based on your requirements
}

interface Activity {
  id: number
  title: string
}

interface CheckedActivity {
  id: number
  activities: Activity[]
}

interface Caregiver {
  id: number
  firstName: string
  lastName: string
  [key: string]: any // for other caregiver properties
}

interface Client {
  id: number
  firstName: string
  lastName: string
  [key: string]: any // for other client properties
}

interface PayPeriodHistory {
  id: number
  startDate: string
  endDate: string | null
  numberOfWeeks: number
}

interface ServiceEntry {
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
}

interface DurationData {
  id: string
  [key: string]: string // For dynamic day keys (monday, tuesday, etc.)
}

interface TotalHoursTableProps {
  data: ServiceEntry[]
  payPeriodHistory: PayPeriodHistory
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div className='flex justify-between text-sm '>
    <Typography className='text-base font-bold'>{label}</Typography>
    <Typography className='text-base font-bold '>{value}</Typography>
  </div>
)

const TimeSheets = () => {
  const { id } = useParams()
  const [timelogData, setTimelogData] = useState<any>([])
  const [search, setSearch] = useState('')

  const fetchTimeLog = async () => {
    try {
      const fetchedTimeLog = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log/client/${id}`)
      setTimelogData(fetchedTimeLog.data)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  useEffect(() => {
    fetchTimeLog()
  }, [])

  const newColumns: GridColDef[] = [
    {
      field: 'payPeriod',
      headerName: 'DATE',
      flex: 1,
      renderCell: (params: any) => {
        const startTime = params?.row?.clockIn
        if (startTime) {
          // Parse the date string into a Date object
          const date = new Date(startTime)
          // Format the date as "14/06/2025"
          const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })

          return <Typography className='font-normal text-base my-3'>{formattedDate}</Typography>
        }

        return <Typography className='font-normal text-base my-3'>N/A</Typography>
      }
    },
    {
      headerName: 'RADIO',
      field: 'radio',
      flex: 1,
      renderCell: (params: any) => <Typography className='font-normal text-base my-3'>1:1</Typography>
    },
    {
      headerName: 'SHARED LOCATION',
      field: 'locationShared',
      flex: 1,
      renderCell: (params: any) => (
        <Typography className='font-normal text-base my-3'>{params?.row?.client?.sharedCare}</Typography>
      )
    },
    {
      headerName: 'LOC APPROVED',
      field: 'locApproved',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <>
          {params.value === 'YES' ? (
            <CheckOutlined className='text-[#71DD37]' />
          ) : (
            <CloseOutlined className='text-[#FF3E1D]' />
          )}
        </>
      )
    },
    {
      headerName: 'FACILITY STAY',
      field: 'stayFacility',
      flex: 1,
      renderCell: (params: any) => (
        <Typography className='font-normal text-base my-3'>{params?.row?.client?.sharedCare}</Typography>
      )
    },
    {
      headerName: 'TIME IN',
      field: 'timeIn',
      flex: 1,
      renderCell: (params: any) => {
        const startTime = params?.row?.clockIn
        if (startTime) {
          // Parse the date string into a Date object
          const date = new Date(startTime)
          // Format the time as "03:00:08 PM"
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })
          return <Typography className='font-normal text-base my-3'>{formattedTime}</Typography>
        }

        return <Typography className='font-normal text-base my-3'>N/A</Typography>
      }
    },
    {
      headerName: 'TIME-OUT',
      field: 'timeOut',
      flex: 1,
      renderCell: (params: any) => {
        const endTime = params?.row?.clockOut
        if (endTime) {
          // Parse the date string into a Date object
          const date = new Date(endTime)
          // Format the time as "03:00:08 PM"
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })
          return <Typography className='font-normal text-base my-3'>{formattedTime}</Typography>
        }

        return <Typography className='font-normal text-base my-3'>N/A</Typography>
      }
    },
    {
      headerName: 'ACTIVITIES',
      field: 'activity',
      flex: 1.5,
      renderCell: (params: any) =>
        params.row.checkedActivity ? (
          <Typography className='font-normal text-base my-3'>
            {params?.row?.checkedActivity?.activities.map((activity: any) => activity.title).join(', ')}
          </Typography>
        ) : (
          <CloseOutlined className='text-[#FF3E1D]' />
        )
    }
  ]

  // Modify the generateWeekDates function to handle your date range better
  const generateWeekDates = (startDate: string, numberOfWeeks: number): moment.Moment[] => {
    if (!startDate) return [] // Add safety check

    const dates: moment.Moment[] = []
    const start = moment(startDate).startOf('day')
    const end = moment(start).add(numberOfWeeks * 7 - 1, 'days')

    // Get all dates in the range
    let current = moment(start)
    while (current.isSameOrBefore(end)) {
      dates.push(moment(current))
      current.add(1, 'days')
    }

    return dates
  }

  // Modify the processDurationsByDate function
  const processDurationsByDate = (
    serviceData: ServiceEntry[],
    weekDates: moment.Moment[]
  ): { [key: string]: number } => {
    const durationsByDate: { [key: string]: number } = {}

    // First, initialize all possible dates from the service data
    serviceData.forEach(entry => {
      const serviceDate = moment(entry.dateOfService).format('YYYY-MM-DD')
      if (!durationsByDate[serviceDate]) {
        durationsByDate[serviceDate] = 0
      }
    })

    // Then initialize the week dates
    weekDates.forEach(date => {
      const dateStr = date.format('YYYY-MM-DD')
      if (!durationsByDate[dateStr]) {
        durationsByDate[dateStr] = 0
      }
    })

    // Now process the durations
    serviceData.forEach(entry => {
      const serviceDate = moment(entry.dateOfService).format('YYYY-MM-DD')
      const duration = calculateDuration(entry.clockIn, entry.clockOut)
      durationsByDate[serviceDate] = (durationsByDate[serviceDate] || 0) + duration
    })

    return durationsByDate
  }

  // Modify the calculateDuration function to handle timezone better
  const calculateDuration = (clockIn: string, clockOut: string): number => {
    if (!clockIn || !clockOut) return 0

    // Convert the time strings to moment objects while preserving timezone
    const start = moment.parseZone(clockIn)
    const end = moment.parseZone(clockOut)

    // Calculate duration in minutes
    const duration = end.diff(start, 'minutes')
    return Math.max(0, duration) // Ensure we don't return negative durations
  }

  // Generate week dates
  const weekDates = generateWeekDates(
    timelogData[0]?.payPeriodHistory.startDate,
    timelogData[0]?.payPeriodHistory.numberOfWeeks
  )

  // Function to format minutes as HH:mm
  const formatDuration = (minutes: number): string => {
    if (!minutes || minutes < 0) return '0:00'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }

  const durationsByDate = processDurationsByDate(timelogData, weekDates)

  // In your component, modify how you create the table data
  // const tableData: DurationData[] = [
  //   {
  //     id: '1',
  //     ...weekDates.reduce<{ [key: string]: string }>((acc, date) => {
  //       const dayKey = date.format('dddd').toLowerCase()
  //       const dateStr = date.format('YYYY-MM-DD')
  //       const duration = durationsByDate[dateStr] || 0
  //       acc[dayKey] = formatDuration(duration)
  //       return acc
  //     }, {})
  //   }
  // ]

  const tableData: DurationData[] = [
    {
      id: '1',
      monday: '1:35',
      tuesday: '1:12',
      wednesday: '0:00',
      thursday: '0:00',
      friday: '0:00',
      saturday: '0:22',
      sunday: '01:05'
    }
  ]

  const tableColumns: GridColDef[] = weekDates.map(date => ({
    field: date.format('dddd').toLowerCase(),
    flex: 1,
    renderHeader: () => (
      <div className='text-center'>
        <div className='font-semibold'>{date.format('dddd')}</div>
        <div className='text-sm text-gray-600'>{date.format('D MMMM')}</div>
      </div>
    )
  }))

  // Add some debugging logs
  useEffect(() => {
    if (timelogData.length > 0) {
      const dates = generateWeekDates(
        timelogData[0]?.payPeriodHistory.startDate,
        timelogData[0]?.payPeriodHistory.numberOfWeeks
      )
      const durations = processDurationsByDate(timelogData, dates)
    }
  }, [timelogData])

  return (
    <>
      <Card className=' h-fit w-[99%]  m-2 mt-1 mb-3 shadow-md rounded-lg border-solid border-2 '>
        <div className='grid grid-cols-2 ml-4 mt-3 p-4 gap-y-4 gap-x-4'>
          <DetailItem
            label='Recipient Name:'
            value={`${timelogData[0]?.client.firstName} ${timelogData[0]?.client.lastName}`}
          />
          <DetailItem label='Week Duration:' value='4 September 2024 - 10 September 2024' />
          <DetailItem
            label='Caregiver Name:'
            value={`${timelogData[0]?.caregiver.firstName} ${timelogData[0]?.caregiver.lastName}`}
          />
        </div>
        <DataTable columns={newColumns} data={timelogData} />
      </Card>
      <Card className=' h-fit w-[99%] ml-2 mt-3 shadow-md rounded-lg mb-3  border-solid border-2'>
        <h2 className='text-xl pt-4 ml-4 mb-4'>Total Hours</h2>
        <DataTable columns={tableColumns} data={tableData} />
      </Card>
      <AcknowledgeSignature />
      <AcknowledgeSignatureCaregiver />
      <CardContent className='mt-4 mb-4 flex justify-between '>
        <div className='w-1/2 flex justify-start space-x-6'>
          <Button className='mr-6' variant='contained' onClick={() => {}}>
            Accept Timesheets
          </Button>
          <Button className='bg-red-600' variant='contained' onClick={() => {}}>
            Reject Timesheets
          </Button>
        </div>
        <div className='w-1/2 flex justify-end space-x-6'>
          <Button className='bg-[#E89C00] mr-6' variant='contained' onClick={() => {}}>
            Export to CSV
          </Button>
          <Button className='bg-[#67C932]' variant='contained' onClick={() => {}}>
            Export PDF
          </Button>
        </div>
      </CardContent>
    </>
  )
}

export default TimeSheets

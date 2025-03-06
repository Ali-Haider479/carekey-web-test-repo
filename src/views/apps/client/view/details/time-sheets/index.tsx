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
import ReactTable from '@/@core/components/mui/ReactTable'
import './table.css'

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

const weekDates = [
  '2025-02-26T19:00:00.000Z',
  '2025-02-27T19:00:00.000Z',
  '2025-02-28T19:00:00.000Z',
  '2025-03-01T19:00:00.000Z',
  '2025-03-02T19:00:00.000Z',
  '2025-03-03T19:00:00.000Z',
  '2025-03-04T19:00:00.000Z',
  '2025-03-05T19:00:00.000Z',
  '2025-03-06T19:00:00.000Z',
  '2025-03-07T19:00:00.000Z',
  '2025-03-08T19:00:00.000Z',
  '2025-03-09T19:00:00.000Z',
  '2025-03-10T19:00:00.000Z',
  '2025-03-11T19:00:00.000Z'
]

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div className='flex justify-between text-sm'>
    <Typography className='text-base font-bold'>{label}</Typography>
    <Typography className='text-base font-bold'>{value}</Typography>
  </div>
)

interface Column {
  id: string
  label: string
  minWidth: number
  align?: 'center' | 'right' | 'left'
  render?: (params: any) => JSX.Element
}

const TimeSheets = () => {
  const { id } = useParams()
  const [timelogData, setTimelogData] = useState<any>([])
  const [search, setSearch] = useState('')

  const fetchTimeLog = async () => {
    try {
      const fetchedTimeLog = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log/client/${id}`)
      console.log('fetchedTimeLog.data', fetchedTimeLog.data)
      setTimelogData(fetchedTimeLog.data)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  useEffect(() => {
    fetchTimeLog()
  }, [])

  const columns: Column[] = [
    {
      id: 'payPeriod',
      label: 'DATE',
      minWidth: 170,
      render: (params: any) => {
        const startTime = params?.clockIn
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
      id: 'radio',
      label: 'RADIO',
      minWidth: 170,
      align: 'center',
      render: (params: any) => <Typography className='font-normal text-base my-3'>1:1</Typography>
    },
    {
      id: 'locationShared',
      label: 'SHARED LOCATION',
      minWidth: 170,
      align: 'center',
      render: (params: any) => <Typography className='font-normal text-base my-3'>NO</Typography>
    },
    {
      id: 'locApproved',
      label: 'LOC APPROVED',
      minWidth: 170,
      align: 'center',
      render: (params: any) => (
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
      id: 'stayFacility',
      label: 'FACILITY STAY',
      minWidth: 170,
      align: 'center',
      render: (params: any) => <Typography className='font-normal text-base my-3'>NO</Typography>
    },
    {
      id: 'timeIn',
      label: 'TIME IN',
      minWidth: 170,
      render: (params: any) => {
        const startTime = params?.clockIn
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
      id: 'timeOut',
      label: 'TIME-OUT',
      minWidth: 170,
      render: (params: any) => {
        const endTime = params?.clockOut
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

  const processDurationsByDate = (
    serviceData: ServiceEntry[],
    weekDates: moment.Moment[]
  ): { [key: string]: number } => {
    const durationsByDate: { [key: string]: number } = {}
    serviceData.forEach(entry => {
      const serviceDate = moment(entry.dateOfService).format('YYYY-MM-DD')
      if (!durationsByDate[serviceDate]) {
        durationsByDate[serviceDate] = 0
      }
    })
    weekDates.forEach(date => {
      const dateStr = date.format('YYYY-MM-DD')
      if (!durationsByDate[dateStr]) {
        durationsByDate[dateStr] = 0
      }
    })
    serviceData.forEach(entry => {
      const serviceDate = moment(entry.dateOfService).format('YYYY-MM-DD')
      const duration = calculateDuration(entry.clockIn, entry.clockOut)
      durationsByDate[serviceDate] = (durationsByDate[serviceDate] || 0) + duration
    })
    return durationsByDate
  }

  const calculateDuration = (clockIn: string, clockOut: string): number => {
    if (!clockIn || !clockOut) return 0
    const start = moment.parseZone(clockIn)
    const end = moment.parseZone(clockOut)
    const duration = end.diff(start, 'minutes')
    return Math.max(0, duration)
  }

  const weekDates = generateWeekDates(
    timelogData[0]?.payPeriodHistory.startDate,
    timelogData[0]?.payPeriodHistory.numberOfWeeks
  )

  const formatDuration = (minutes: number): string => {
    if (!minutes || minutes < 0) return '0:00'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }

  const durationsByDate = processDurationsByDate(timelogData, weekDates)

  // Update tableData to use date-based keys
 const tableData = [
   {
     id: '1',
     ...weekDates.reduce((acc: { [key: string]: string }, date) => {
       const dateStr = date.format('YYYY-MM-DD') // Unique key per date
       const duration = durationsByDate[dateStr] || 0
       acc[dateStr] = formatDuration(duration) // Use date as key
       return acc
     }, {})
   }
 ]

  // Update tableColumns to use date-based ids
  const tableColumns = weekDates.map(date => {
    const dayName = date.format('ddd').toUpperCase()
    const dateStr = date.format('D MMMM')
    const label = `${dayName}\n${dateStr}`
    const columnId = date.format('YYYY-MM-DD') // Use full date as id

    return {
      id: columnId, // Match the key in tableData
      minWidth: 170,
      label: label,
      render: (params: any) => <Typography>{params[columnId] || '0:00'}</Typography> // Render the duration
    }
  })

  console.log('WEEK DATES', weekDates)
  console.log('TABLE DATA', tableData)
  console.log('TABLE COLUMNS', tableColumns)

  return (
    <>
      <Card className='h-fit w-[99%] m-2 mt-1 mb-3 shadow-md rounded-lg border-solid border-2'>
        <div className='grid grid-cols-2 m-4 gap-3'>
          <DetailItem
            label='Recipient Name:'
            value={`${timelogData[0]?.client?.firstName || ''} ${timelogData[0]?.client?.lastName || ''}`}
          />
          <DetailItem
            label='Week Duration:'
            value={`${weekDates[0]?.format('DD MMMM YYYY') || ''} - ${weekDates[weekDates.length - 1]?.format('DD MMMM YYYY') || ''}`}
          />
          <DetailItem
            label='Caregiver Name:'
            value={`${timelogData[0]?.caregiver?.firstName || ''} ${timelogData[0]?.caregiver?.lastName || ''}`}
          />
        </div>
        <ReactTable
          columns={columns}
          data={timelogData}
          keyExtractor={user => user.id.toString()}
          enableRowSelect={false}
          enablePagination={false}
          pageSize={5}
          stickyHeader
          maxHeight={600}
          containerStyle={{ borderRadius: 2 }}
        />
      </Card>

      <Card className='h-fit w-[99%] ml-2 mt-3 shadow-md rounded-lg mb-3 border-solid border-2'>
        <h2 className='text-xl pt-4 ml-4 mb-4'>Total Hours</h2>
        <ReactTable
          columns={tableColumns}
          data={tableData}
          keyExtractor={row => row.id.toString()}
          enableRowSelect={false}
          enablePagination={false}
          pageSize={5}
          stickyHeader
          maxHeight={600}
          containerStyle={{ borderRadius: 2 }}
        />
      </Card>
      <AcknowledgeSignature data={timelogData} />
      <AcknowledgeSignatureCaregiver data={timelogData} />
      <CardContent className='mt-4 mb-4 flex justify-between'>
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

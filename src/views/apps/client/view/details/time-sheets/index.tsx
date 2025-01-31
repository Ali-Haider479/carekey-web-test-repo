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
      console.log('Client Timelog Data --> ', fetchedTimeLog.data)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  useEffect(() => {
    fetchTimeLog()
  }, [])

  const columns: GridColDef[] = [
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
      flex: 1
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

  const dataTimeData = [
    {
      id: '1',
      monday: '8:35',
      tuesday: '5:12',
      wednesday: '6:31',
      thursday: '7:45',
      friday: '8:56',
      saturday: '4:22',
      sunday: '6:45'
    }
  ]

  const dateColumns: GridColDef[] = [
    {
      field: 'monday',
      flex: 1,
      renderHeader: () => (
        <div>
          Monday
          <br />
          {moment('2023-09-04').format('DD MMMM')}
        </div>
      )
    },
    {
      field: 'tuesday',
      flex: 1,
      renderHeader: () => (
        <div>
          Tuesday
          <br />
          {moment('2023-09-05').format('DD MMMM')}
        </div>
      )
    },
    {
      field: 'wednesday',
      flex: 1,
      renderHeader: () => (
        <div>
          Wednesday
          <br />
          {moment('2023-09-06').format('DD MMMM')}
        </div>
      )
    },
    {
      field: 'thursday',
      flex: 1,
      renderHeader: () => (
        <div>
          Thursday
          <br />
          {moment('2023-09-07').format('DD MMMM')}
        </div>
      )
    },
    {
      field: 'friday',
      flex: 1,
      renderHeader: () => (
        <div>
          Friday
          <br />
          {moment('2023-09-08').format('DD MMMM')}
        </div>
      )
    },
    {
      field: 'saturday',
      flex: 1,
      renderHeader: () => (
        <div>
          Saturday
          <br />
          {moment('2023-09-09').format('DD MMMM')}
        </div>
      )
    },
    {
      field: 'sunday',
      flex: 1,
      renderHeader: () => (
        <div>
          Sunday
          <br />
          {moment('2023-09-10').format('DD MMMM')}
        </div>
      )
    }
  ]

  return (
    <>
      <Card className=' h-fit w-[99%]  m-2 mt-1 mb-3 shadow-md rounded-lg border-solid border-2 '>
        <div className='grid grid-cols-2 ml-4 mt-3 p-4 gap-y-4 gap-x-4'>
          <DetailItem label='Recipient Name:' value={timelogData[0]?.client.firstName} />
          <DetailItem label='Week Duration:' value='4 September 2024 - 10 September 2024' />
          <DetailItem label='Caregiver Name:' value='Stancy Moore' />
        </div>
        <DataTable columns={columns} data={timelogData} />
      </Card>
      <Card className=' h-fit w-[99%] ml-2 mt-3 shadow-md rounded-lg mb-3  border-solid border-2'>
        <h2 className='text-xl pt-4 ml-4 mb-4'>Total Hours</h2>
        <DataTable columns={dateColumns} data={dataTimeData} />
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

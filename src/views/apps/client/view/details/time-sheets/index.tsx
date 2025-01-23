'use client'
import DataTable from '@/@core/components/mui/DataTable'
import { CheckOutlined, CloseOutlined } from '@mui/icons-material'
import { Button, Card, CardContent, Typography } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import React from 'react'
import moment from 'moment'
import AcknowledgeSignature from './ClientSignatureSection'
import AcknowledgeSignatureCaregiver from './CaregiverSignatureSection'

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
  const data: any[] = [
    {
      id: '1',
      date: '4 SEPT,MONDAY',
      radio: '1:1',
      locationShared: 'NO',
      locApproved: 'YES',
      stayFacility: 'NO',
      timeIn: '11:00 AM',
      timeOut: '11:00 PM',
      activity: 'Assist with daily living skills Others'
    },
    {
      id: '2',
      date: '5 SEPT,MONDAY',
      radio: '1:1',
      locationShared: 'NO',
      locApproved: 'YES',
      stayFacility: '',
      timeIn: '11:00 AM',
      timeOut: '11:00 PM',
      activity: 'Assist with daily living skills Others'
    },
    {
      id: '3',
      date: '6 SEPT,MONDAY',
      radio: '1:1',
      locationShared: 'NO',
      locApproved: 'YES',
      stayFacility: 'NO',
      timeIn: '11:00 AM',
      timeOut: '11:00 PM',
      activity: ''
    },
    {
      id: '4',
      date: '7 SEPT,MONDAY',
      radio: '1:1',
      locationShared: 'NO',
      locApproved: 'YES',
      stayFacility: 'NO',
      timeIn: '11:00 AM',
      timeOut: '11:00 PM',
      activity: 'Assist with daily living skills Others'
    },
    {
      id: '5',
      date: '8 SEPT,MONDAY',
      radio: '1:1',
      locationShared: 'NO',
      locApproved: 'YES',
      stayFacility: 'NO',
      timeIn: '11:00 AM',
      timeOut: '11:00 PM',
      activity: ''
    },
    {
      id: '6',
      date: '9 SEPT,MONDAY',
      radio: '1:1',
      locationShared: 'NO',
      locApproved: 'YES',
      stayFacility: 'NO',
      timeIn: '11:00 AM',
      timeOut: '11:00 PM',
      activity: 'Assist with daily living skills Others'
    },
    {
      id: '7',
      date: '10 SEPT,MONDAY',
      radio: '1:1',
      locationShared: 'NO',
      locApproved: 'YES',
      stayFacility: '',
      timeIn: '11:00 AM',
      timeOut: '11:00 PM',
      activity: ''
    }
  ]
  const columns: GridColDef[] = [
    {
      headerName: 'DATE',
      field: 'date',
      flex: 0.75
    },
    {
      headerName: 'RADIO',
      field: 'radio',
      flex: 0.5
    },
    {
      headerName: 'SHARED LOCATION',
      field: 'locationShared',
      flex: 0.75
    },
    {
      headerName: 'LOC APPROVED',
      field: 'locApproved',
      flex: 0.75,
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
      flex: 0.5
    },
    {
      headerName: 'TIME IN',
      field: 'timeIn',
      flex: 0.5
    },
    {
      headerName: 'TIME-OUT',
      field: 'timeOut',
      flex: 0.5
    },
    {
      headerName: 'ACTIVITIES',
      field: 'activity',
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => (
        <>
          {params.value && params.value !== '' ? <p>{params.value}</p> : <CloseOutlined className='text-[#FF3E1D]' />}
        </>
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
      flex: 0.5,
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
      flex: 0.5,
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
      flex: 0.5,
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
      flex: 0.5,
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
      flex: 0.5,
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
      flex: 0.5,
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
      flex: 0.5,
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
      <CardContent className=' h-[600px] w-[99%]  m-2 mt-1 mb-3 shadow-md rounded-lg border-solid border-2 '>
        <div className='grid grid-cols-2 ml-4 mt-3 p-4 gap-y-4 gap-x-8'>
          <DetailItem label='Recipient Name:' value='Sameer' />
          <DetailItem label='Week Duration:' value='4 September 2024 - 10 September 2024' />
          <DetailItem label='Caregiver Name:' value='Stancy Moore' />
        </div>
        <DataTable columns={columns} data={data} />
      </CardContent>
      <CardContent className=' h-fit w-[99%] ml-2 mt-3 shadow-md rounded-lg mb-3  border-solid border-2'>
        <h2 className='text-xl pt-4 ml-4 mb-4'>Total Hours</h2>
        <DataTable columns={dateColumns} data={dataTimeData} />
      </CardContent>
      <AcknowledgeSignature />
      <AcknowledgeSignatureCaregiver />
      <CardContent className='mt-4 ml-4 mb-4  flex justify-between '>
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

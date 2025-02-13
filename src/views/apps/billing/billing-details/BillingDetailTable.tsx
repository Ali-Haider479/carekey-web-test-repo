'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import { CircularProgress, Typography } from '@mui/material'
import Dropdown from '@/@core/components/mui/DropDown'
import ReactTable from '@/@core/components/mui/ReactTable'
import { MRT_ColumnDef } from 'material-react-table'
import axios from 'axios'
import { calculateHoursWorked, formattedDate } from '@/utils/helperFunctions'
import { dark } from '@mui/material/styles/createPalette'

interface Caregiver {
  firstName: string
  lastName: string
}

interface Client {
  firstName: string
  lastName: string
}

interface TimeLogData {
  id: number
  clockIn: string
  clockOut: string
  serviceName: string
  startLocation: Location
  caregiver: Caregiver
  client: Client
}

interface Props {
  timeLogData: TimeLogData[]
  isLoading: boolean
}

const dummyData = [
  {
    id: 1,
    clientName: 'Cody Fisher',
    caregiverName: 'Kathryn Murphy',
    claimAmount: '$214.31',
    payer: 'MA',
    proCode: 'T1020',
    serviceDateRange: '04/15/2024 - 04/15/2024',
    claimStatus: 'Completed',
    subRows: [
      {
        id: 11,
        clientName: 'Cody Fisher',
        caregiverName: 'John Doe',
        claimAmount: '$100.00',
        payer: 'MA',
        proCode: 'T1000',
        serviceDateRange: '04/10/2024 - 04/10/2024',
        claimStatus: 'Processing'
      }
    ]
  },
  {
    id: 2,
    clientName: 'Robert Fox',
    caregiverName: 'Leslie Alexander',
    claimAmount: '$214.31',
    payer: 'MA',
    proCode: 'T1020',
    serviceDateRange: '04/15/2024 - 04/15/2024',
    claimStatus: 'Pending',
    subRows: [
      {
        id: 21,
        clientName: 'Robert Fox',
        caregiverName: 'Mark Smith',
        claimAmount: '$120.00',
        payer: 'MA',
        proCode: 'T1005',
        serviceDateRange: '04/12/2024 - 04/12/2024',
        claimStatus: 'Completed'
      }
    ]
  },
  {
    id: 3,
    clientName: 'Esther Howard',
    caregiverName: 'Courtney Henry',
    claimAmount: '$214.31',
    payer: 'MA',
    proCode: 'T1020',
    serviceDateRange: '04/15/2024 - 04/15/2024',
    claimStatus: 'Completed'
  },
  {
    id: 4,
    clientName: 'Jenny Wilson',
    caregiverName: 'Kristin Watson',
    claimAmount: '$214.31',
    payer: 'MA',
    proCode: 'T1020',
    serviceDateRange: '04/15/2024 - 04/15/2024',
    claimStatus: 'Pending'
  }
]

const BillingDetailTable = () => {
  const [filteredData, setFilteredData] = useState<any[]>(dummyData)
  const [isLoading, setIsLoading] = useState(true)

  const newColumns = [
    {
      accessorKey: 'clientName',
      header: 'CLIENT NAME',
      Cell: ({ row }: any) => (
        <div
          className={`font-semibold ${dark ? 'text-[#7112B7]' : 'text-[#4B0082]'}`}
        >{`${row.original.client.firstName} ${row.original.client.lastName}`}</div>
      )
    },
    {
      accessorKey: 'caregiverName',
      header: 'CAREGIVER NAME',
      Cell: ({ row }: any) => <div>{`${row.original.caregiver.firstName} ${row.original.caregiver.lastName}`}</div>
    },

    { accessorKey: 'payor', header: 'PAYOR', Cell: ({ row }: any) => <div>MA</div> },
    { accessorKey: 'procode', header: 'PRO CODE', Cell: ({ row }: any) => <div>T1020</div> },
    {
      accessorKey: 'serviceDateRange',
      header: 'SERVICE DATE RANGE',
      Cell: ({ row }: { row: { original: TimeLogData } }) => {
        const clockIn = new Date(row.original.clockIn)
        const clockOut = new Date(row.original.clockOut)
        return <div>{`${clockIn.toLocaleDateString('en-US')} - ${clockOut.toLocaleDateString('en-US')}`}</div>
      }
    },
    {
      accessorKey: 'claimDate',
      header: 'CLAIM DATE',
      Cell: ({ row }: any) => {
        const clockOut = new Date(row.original.clockOut)
        return <div>{`${clockOut.toLocaleDateString('en-US')}`}</div>
      }
    },
    {
      accessorKey: 'billedAmount',
      header: 'BILLED AMT',
      Cell: ({ row }: any) => {
        const hrs = calculateHoursWorked(row.original.clockIn, row.original.clockOut)
        return `$ ${parseFloat(hrs) > 0 ? parseFloat(hrs) * 1000 : 10}`
      }
    },
    {
      accessorKey: 'receivedAmount',
      header: 'RECEIVED AMT',
      Cell: ({ row }: any) => {
        const hrs = calculateHoursWorked(row.original.clockIn, row.original.clockOut)
        return `$ ${parseFloat(hrs) > 0 ? parseFloat(hrs) * 1000 * 0.8 : 10 * 0.8}`
      }
    },
    {
      accessorKey: 'claimStatus',
      header: 'CLAIM STATUS',
      Cell: ({ row }: any) => {
        return (
          <Typography className={`bg-[#6062E8] bg-opacity-20 text-[#6062E8] rounded-2xl px-2 w-[fit-content]`}>
            SCHEDULED
          </Typography>
        )
      }
    }
  ]

  // <Typography className={`${row.status === 'Active' ? 'bg-green-200 text-[#6062E8]' : 'bg-red-200 text-red-600'} rounded-2xl px-2 w-[fit-content]`}>
  //    PENDING
  // </Typography>

  const getBillingDetails = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log/billing`)
      const fetchedData = response.data
      console.log('Billable List ----> ', fetchedData)

      setFilteredData(fetchedData)
    } catch (error) {
      console.error('Error fetching data', error)
    } finally {
      setIsLoading(false)
    }
  }

  // useEffect(() => {
  //   // Simulate data loading and theme initialization
  //   const timer = setTimeout(() => {
  //     setIsLoading(false)
  //   }, 500)
  //   return () => clearTimeout(timer)
  // }, [])

  useEffect(() => {
    getBillingDetails()
  }, [])

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      <Dropdown
        className='mt-5 ml-5 w-80 mb-5'
        value={'all'}
        setValue={() => {}}
        options={[{ key: 1, value: 'all', displayValue: 'All' }]}
      />
      {isLoading ? (
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      ) : (
        <ReactTable columns={newColumns} data={filteredData} enableExpanding={true} enableExpandAll={false} />
      )}
    </Card>
  )
}

export default BillingDetailTable

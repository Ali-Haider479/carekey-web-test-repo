'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import { CircularProgress } from '@mui/material'
import Dropdown from '@/@core/components/mui/DropDown'
import ReactTable from '@/@core/components/mui/ReactTable'
import { MRT_ColumnDef } from 'material-react-table'

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

  const columns = [
    { accessorKey: 'clientName', header: 'Client Name' },
    { accessorKey: 'caregiverName', header: 'Caregiver Name' },
    { accessorKey: 'claimAmount', header: 'Claim Amount' },
    { accessorKey: 'payer', header: 'Payer' },
    { accessorKey: 'proCode', header: 'Procedure Code' },
    { accessorKey: 'serviceDateRange', header: 'Service Date Range' },
    { accessorKey: 'claimStatus', header: 'Claim Status' }
  ]

  useEffect(() => {
    // Simulate data loading and theme initialization
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
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
        <ReactTable columns={columns} data={dummyData} enableExpanding={true} enableExpandAll={false} />
      )}
    </Card>
  )
}

export default BillingDetailTable

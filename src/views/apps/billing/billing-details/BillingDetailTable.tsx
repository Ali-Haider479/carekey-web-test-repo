'use client'

import { useState } from 'react'
import Card from '@mui/material/Card'
import { CircularProgress } from '@mui/material'
import DataTable from '@/@core/components/mui/DataTable'
import { GridColDef } from '@mui/x-data-grid'
import Dropdown from '@/@core/components/mui/DropDown'
import { dark } from '@mui/material/styles/createPalette'

const dummyData = [
  {
    id: 1,
    clientName: 'Cody Fisher',
    caregiverName: 'Kathryn Murphy',
    claimAmount: '$214.31',
    payer: 'MA',
    proCode: 'T1020',
    serviceDateRange: '04/15/2024 - 04/15/2024',
    claimStatus: 'Completed'
  },
  {
    id: 2,
    clientName: 'Robert Fox',
    caregiverName: 'Leslie Alexander',
    claimAmount: '$214.31',
    payer: 'MA',
    proCode: 'T1020',
    serviceDateRange: '04/15/2024 - 04/15/2024',
    claimStatus: 'Pending'
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
  const [isLoading, setIsLoading] = useState(false)

  const columns: GridColDef[] = [
    {
      field: 'clientName',
      headerName: 'CLIENT NAME',
      flex: 1,
      renderCell: params => (
        <div className='flex items-center'>
          <span className={`${dark ? 'text-[#8082FF]' : 'text-[#4B0082]'}`}>{params.value}</span>
        </div>
      )
    },
    {
      field: 'caregiverName',
      headerName: 'CAREGIVER NAME',
      flex: 1
    },
    {
      field: 'claimAmount',
      headerName: 'CLAIM AMOUNT',
      flex: 1
    },
    {
      field: 'payer',
      headerName: 'PAYER',
      flex: 1
    },
    {
      field: 'proCode',
      headerName: 'PRO CODE',
      flex: 1
    },
    {
      field: 'serviceDateRange',
      headerName: 'SERVICE DATE RANGE',
      flex: 1.5
    },
    {
      field: 'claimStatus',
      headerName: 'CLAIM STATUS',
      flex: 1,
      renderCell: params => (
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            params.value === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {params.value}
        </span>
      )
    }
  ]

  if (isLoading) {
    return (
      <Card>
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      </Card>
    )
  }

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      {/* <CardHeader title='Billing Details' className='pb-4' /> */}
      <Dropdown
        className='mt-5 ml-5 w-80 mb-5'
        value={'all'}
        setValue={() => {}}
        options={[{ key: 1, value: 'all', displayValue: 'All' }]}
      />
      <DataTable data={filteredData} columns={columns} />
    </Card>
  )
}

export default BillingDetailTable

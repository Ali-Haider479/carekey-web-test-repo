import DataTable from '@/@core/components/mui/DataTable'
import { Card, CardContent, Button } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import React from 'react'

const CostReportTable = () => {
  const columns: GridColDef[] = [
    { field: 'typeOfService', headerName: 'TYPE OF SERVICE', flex: 1 },
    { field: 'payor', headerName: 'PAYER', flex: 1 },
    { field: 'units', headerName: 'UNITS', flex: 1 },
    {
      field: 'billedAmount',
      headerName: 'BILLED AMOUNT',
      flex: 1,
      renderCell: params => {
        return <span>{`$ ${params.value}`}</span>
      }
    },
    {
      field: 'receivedAmount',
      headerName: 'RECEIVED AMOUNT',
      flex: 1,
      renderCell: params => {
        return <span>{`$ ${params.value}`}</span>
      }
    },
    {
      field: 'noOfClaims',
      headerName: 'NO. OF CLAIMS',
      flex: 1
    },
    {
      field: 'noOfClients',
      headerName: 'NO. OF CLIENTS',
      flex: 1
    }
  ]

  const data = [
    {
      id: 1,
      typeOfService: 'IHS',
      payor: '4512312',
      units: 12412232315,
      billedAmount: 100,
      receivedAmount: 90,
      noOfClaims: 1,
      noOfClients: 1
    },
    {
      id: 2,
      typeOfService: 'IHS',
      payor: '4512312',
      units: 12412232315,
      billedAmount: 100,
      receivedAmount: 90,
      noOfClaims: 1,
      noOfClients: 1
    },
    {
      id: 3,
      typeOfService: 'IHS',
      payor: '4512312',
      units: 12412232315,
      billedAmount: 100,
      receivedAmount: 90,
      noOfClaims: 1,
      noOfClients: 1
    },
    {
      id: 4,
      typeOfService: 'IHS',
      payor: '4512312',
      units: 12412232315,
      billedAmount: 100,
      receivedAmount: 90,
      noOfClaims: 1,
      noOfClients: 1
    }
  ]

  return (
    <Card className='mt-3'>
      <CardContent className='flex justify-end'>
        <Button variant='contained' className='mr-3 bg-[#E89C00]'>
          Export to CSV
        </Button>
        <Button variant='contained' className='bg-[#67C932]'>
          Export PDF
        </Button>
      </CardContent>

      <DataTable columns={columns} data={data} />
    </Card>
  )
}

export default CostReportTable

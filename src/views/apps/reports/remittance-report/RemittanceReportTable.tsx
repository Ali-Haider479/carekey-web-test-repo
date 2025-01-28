import DataTable from '@/@core/components/mui/DataTable'
import TextField from '@/@core/components/mui/TextField'
import { Card, CardContent, Button, IconButton } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import React from 'react'

const RemittanceReportTable = () => {
  const [searchValue, setSearchValue] = React.useState('')
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
      <CardContent className='flex justify-between items-center'>
        <TextField
          placeholder='Search name, phone number, pmi number'
          className='w-96'
          variant='outlined'
          size='small'
          value={searchValue}
          onChange={(e: { target: { value: React.SetStateAction<string> } }) => setSearchValue(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton style={{ color: '#757575', marginLeft: '8px' }}>
                <i className='bx-search' />
              </IconButton>
            )
          }}
        />
        <div>
          <Button variant='contained' className='mr-3 bg-[#E89C00]'>
            Export to CSV
          </Button>
          <Button variant='contained' className='bg-[#67C932]'>
            Export PDF
          </Button>
        </div>
      </CardContent>

      <DataTable columns={columns} data={data} />
    </Card>
  )
}

export default RemittanceReportTable

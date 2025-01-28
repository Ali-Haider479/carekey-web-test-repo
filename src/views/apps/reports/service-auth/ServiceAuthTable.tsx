'use client'
import DataTable from '@/@core/components/mui/DataTable'
import { Avatar, Box, Button, Card, CardContent, Typography } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'

const ServiceAuthTable = () => {
  const columns: GridColDef[] = [
    {
      field: 'clientName',
      headerName: 'CLIENT NAME',
      flex: 1.5,
      renderCell: params => (
        <Box
          sx={{
            display: 'flex',
            marginTop: 1,
            alignItems: 'center',
            width: '100%',
            overflow: 'hidden' // Prevent overflow
          }}
        >
          <Avatar className='w-8 h-8 rounded-full' />
          <Box
            sx={{
              ml: 2,
              flex: 1,
              overflow: 'hidden', // Prevent overflow
              textOverflow: 'ellipsis', // Add ellipsis for long text
              whiteSpace: 'nowrap' // Prevent text wrapping
            }}
          >
            <Typography
              variant='body1'
              sx={{
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {params.row.clientName}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {params.row.cellNumber}
            </Typography>
          </Box>
        </Box>
      )
    },
    { field: 'payor', headerName: 'PAYER', flex: 1 },
    { field: 'startDate', headerName: 'START DATE', flex: 1 },
    { field: 'endDate', headerName: 'END DATE', flex: 1 },
    { field: 'serviceType', headerName: 'SERVICE TYPE', flex: 1 },
    { field: 'perDay', headerName: 'PER DAY', flex: 1 },
    { field: 'perWeek', headerName: 'PER WEEK', flex: 1 },
    { field: 'userHrs', headerName: 'USER HRS', flex: 1 }
  ]

  const data = [
    {
      id: 1,
      clientName: 'Robert Fox',
      cellNumber: '123-456-7890',
      payor: '4512312',
      startDate: '12/12/2021',
      endDate: '12/12/2021',
      serviceType: 'IHS',
      perDay: 5,
      perWeek: 5,
      userHrs: 5
    },
    {
      id: 2,
      clientName: 'Tonny Stark',
      cellNumber: '123-456-7890',
      payor: '4512312',
      startDate: '12/12/2021',
      endDate: '12/12/2021',
      serviceType: 'IHS',
      perDay: 5,
      perWeek: 5,
      userHrs: 5
    },
    {
      id: 3,
      clientName: 'Jimmy Daniels',
      cellNumber: '123-456-7890',
      payor: '4512312',
      startDate: '12/12/2021',
      endDate: '12/12/2021',
      serviceType: 'IHS',
      perDay: 5,
      perWeek: 5,
      userHrs: 5
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

export default ServiceAuthTable

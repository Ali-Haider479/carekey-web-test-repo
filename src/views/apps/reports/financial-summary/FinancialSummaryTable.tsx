import DataTable from '@/@core/components/mui/DataTable'
import { Card, CardContent, Button } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'

const ComponentName = () => {
  const columns: GridColDef[] = [
    { field: 'payor', headerName: 'PAYER', flex: 1 },
    {
      field: 'noOfClaims',
      headerName: 'NO. OF CLAIMS',
      flex: 1
    },
    {
      field: 'totalCharges',
      headerName: 'TOTAL CHARGES',
      flex: 1
    },
    { field: 'serviceType', headerName: 'SERVICE TYPE', flex: 1 },
    { field: 'adjustment', headerName: 'ADJUSTMENT', flex: 1 }
  ]

  const data = [
    {
      id: 1,
      payor: '4512312',
      noOfClaims: 1,
      totalCharges: 10,
      serviceType: 'IHS',
      adjustment: 5
    },
    {
      id: 2,
      payor: '4512312',
      noOfClaims: 1,
      totalCharges: 10,
      serviceType: 'IHS',
      adjustment: 5
    },
    {
      id: 3,
      payor: '4512312',
      noOfClaims: 1,
      totalCharges: 10,
      serviceType: 'IHS',
      adjustment: 5
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

export default ComponentName

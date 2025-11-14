import ReactTable from '@/@core/components/mui/ReactTable'
import { Card, CardContent, Button, Typography, CircularProgress } from '@mui/material'
import React from 'react'

const CostReportTable = (props: any) => {
  const { serviceData, loading } = props
  const columns = [
    {
      id: 'seviceName',
      label: 'SERVICE NAME',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.serviceName}</Typography>
    },
    {
      id: 'serviceType',
      label: 'SERVICE TYPE',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.serviceType}</Typography>
    },
    {
      id: 'payer',
      label: 'PAYER',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.matchedServiceAuth?.payer || '---'}</Typography>
    },
    {
      id: 'procedureAndModifier',
      label: 'PRO/MOD',
      minWidth: 170,
      render: (item: any) => (
        <Typography>
          {item?.procedureCode} {item?.modifierCode}
        </Typography>
      )
    },
    {
      id: 'serviceRate',
      label: 'RATE',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.matchedServiceAuth?.serviceRate || '---'}</Typography>
    },
    {
      id: 'totalUnits',
      label: 'UNITS',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.matchedServiceAuth?.units || '---'}</Typography>
    },
    {
      id: 'usedUnits',
      label: 'UNITS DELIVERED',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.matchedServiceAuth?.usedUnits || '---'}</Typography>
    },
    {
      id: 'remainingUnits',
      label: 'REM. UNITS',
      minWidth: 170,
      render: (item: any) => {
        const remainingUnits = Number(item?.matchedServiceAuth?.units) - Number(item?.matchedServiceAuth?.usedUnits)
        return <Typography>{remainingUnits || '---'}</Typography>
      }
    },
    {
      id: 'caregiversInvolved',
      label: 'CAREGIVERS',
      minWidth: 170,
      render: (item: any) => {
        return <Typography>{item?.uniqueCaregivers}</Typography>
      }
    },
    {
      id: 'clientsInvolved',
      label: 'CLIENTS',
      minWidth: 170,
      render: (item: any) => {
        const remainingUnits = item?.units - item?.usedUnits
        return <Typography>{item.uniqueClients}</Typography>
      }
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

      {loading === true ? (
        <div className='flex justify-center items-center pb-5'>
          <CircularProgress size={35} />
        </div>
      ) : (
        <ReactTable
          data={serviceData || []}
          columns={columns}
          keyExtractor={user => user.id.toString()}
          enablePagination
          pageSize={20}
          stickyHeader
          maxHeight={600}
          containerStyle={{ borderRadius: 2 }}
        />
      )}
    </Card>
  )
}

export default CostReportTable

import ReactTable from '@/@core/components/mui/ReactTable'
import { Card, CardContent, Button, Typography, CircularProgress } from '@mui/material'
import React from 'react'

const CostReportTable = (props: any) => {
  const { serviceData, loading } = props

  // Function to export data to CSV
  const exportToCSV = () => {
    if (!serviceData || serviceData.length === 0) {
      alert('No data available to export')
      return
    }

    // Define CSV headers based on columns
    const headers = [
      'SERVICE NAME',
      'SERVICE TYPE',
      'PAYER',
      'PRO/MOD',
      'RATE',
      'UNITS',
      'UNITS DELIVERED',
      'REM. UNITS',
      'TOTAL CHARGES',
      'RECIEVED AMOUNT',
      'REMAINING AMOUNT',
      'CAREGIVERS',
      'CLIENTS'
    ]

    // Build CSV rows
    const csvRows = []
    csvRows.push(headers.join(','))

    serviceData.forEach((item: any) => {
      const remainingUnits = Number(item?.matchedServiceAuth?.units) - Number(item?.matchedServiceAuth?.usedUnits)
      const row = [
        `"${item?.serviceName || ''}"`,
        `"${item?.serviceType || ''}"`,
        `"${item?.matchedServiceAuth?.payer || '---'}"`,
        `"${item?.procedureCode || ''} ${item?.modifierCode || ''}"`,
        item?.matchedServiceAuth?.serviceRate || '---',
        item?.matchedServiceAuth?.units || '---',
        item?.matchedServiceAuth?.usedUnits || '---',
        remainingUnits || '---',
        '---',
        '---',
        '---',
        item?.uniqueCaregivers || 0,
        item?.uniqueClients || 0
      ]
      csvRows.push(row.join(','))
    })

    // Create CSV content
    const csvContent = csvRows.join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `cost-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
      id: 'totalCharges',
      label: 'TOTAL CHARGES',
      minWidth: 170,
      render: (item: any) => <Typography>{'---'}</Typography>
    },
    {
      id: 'recievedAmount',
      label: 'RECIEVED AMOUNT',
      minWidth: 170,
      render: (item: any) => <Typography>{'---'}</Typography>
    },
    {
      id: 'remainingAmount',
      label: 'REMAINING AMOUNT',
      minWidth: 170,
      render: (item: any) => <Typography>{'---'}</Typography>
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
        <Button
          variant='contained'
          className='mr-3 bg-[#E89C00]'
          onClick={exportToCSV}
          disabled={loading || !serviceData || serviceData.length === 0}
        >
          Export to CSV
        </Button>
        {/* <Button variant='contained' className='bg-[#67C932]'>
          Export PDF
        </Button> */}
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

'use client'
import DataTable from '@/@core/components/mui/DataTable'
import ReactTable from '@/@core/components/mui/ReactTable'
import { Avatar, Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'

const ScheduleTable = (props: any) => {
  const { scheduleData, loading } = props

  console.log('scheduleData received in table:', scheduleData)

  // Function to export data to CSV
  const exportToCSV = () => {
    if (!scheduleData || scheduleData.length === 0) {
      alert('No data available to export')
      return
    }

    // Define CSV headers based on columns
    const headers = [
      'CLIENT',
      'PAYER',
      'MEMBER ID',
      'AUTH NO.',
      'DIAGNOSIS CODE',
      'PRO/MOD',
      'DATE RANGE',
      'RATE',
      'UNITS',
      'REM. UNITS'
    ]

    // Build CSV rows
    const csvRows = []
    csvRows.push(headers.join(','))

    scheduleData.forEach((item: any) => {
      const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        })
      }
      const startDate = formatDate(item?.startDate)
      const endDate = formatDate(item?.endDate)
      const remainingUnits = item?.units - item?.usedUnits

      const row = [
        `"${item?.client?.firstName || ''} ${item?.client?.lastName || ''}"`,
        `"${item?.payer || ''}"`,
        `"${item?.memberId || ''}"`,
        `"${item?.serviceAuthNumber || ''}"`,
        `"${item?.diagnosisCode || '---'}"`,
        `"${item?.procedureCode || ''}, ${item?.modifierCode || ''}"`,
        `"${startDate} - ${endDate}"`,
        item?.serviceRate || '',
        item?.units || '',
        remainingUnits || 0
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
    link.setAttribute('download', `service-auth-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const calculateQuantityPerFrequency = ({
    startDate,
    endDate,
    quantity,
    frequency
  }: {
    startDate?: string | Date
    endDate?: string | Date
    quantity?: string | number
    frequency?: string
  }): number => {
    const parseQuantity = (qty: string | number | undefined): number => {
      if (qty === undefined || qty === null) return NaN
      if (typeof qty === 'number') return isNaN(qty) ? NaN : qty
      const cleaned = qty.replace(/,/g, '')
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? NaN : parsed
    }

    const parsedQuantity = parseQuantity(quantity)

    if (!startDate || !endDate || isNaN(parsedQuantity) || !frequency) {
      return NaN
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return NaN
    }

    const timeDiffMs = end.getTime() - start.getTime()
    let frequencyUnits: number
    switch (frequency.toLowerCase()) {
      case 'daily':
        frequencyUnits = timeDiffMs / (1000 * 60 * 60 * 24)
        break
      case 'weekly':
        frequencyUnits = timeDiffMs / (1000 * 60 * 60 * 24 * 7)
        break
      case 'monthly':
        frequencyUnits = timeDiffMs / (1000 * 60 * 60 * 24 * 30.42)
        break
      default:
        return NaN
    }

    return frequencyUnits <= 0 ? NaN : parsedQuantity / frequencyUnits
  }
  const columns = [
    {
      id: 'client',
      label: 'CLIENT',
      minWidth: 170,
      render: (item: any) => (
        <Typography>
          {item?.client?.firstName} {item?.client?.lastName}
        </Typography>
      )
    },
    {
      id: 'payer',
      label: 'PAYER',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.payer}</Typography>
    },
    {
      id: 'memberId',
      label: 'MEMBER ID',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.memberId}</Typography>
    },
    {
      id: 'serviceAuthNumber',
      label: 'AUTH NO.',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.serviceAuthNumber}</Typography>
    },
    {
      id: 'diagnosisCode',
      label: 'DIAGNOSIS CODE',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.diagnosisCode || '---'}</Typography>
    },
    {
      id: 'procedureAndModifier',
      label: 'PRO/MOD',
      minWidth: 170,
      render: (item: any) => (
        <Typography>
          {item?.procedureCode}, {item?.modifierCode}
        </Typography>
      )
    },
    {
      id: 'startDateEndDate',
      label: 'DATE RANGE',
      minWidth: 170,
      render: (item: any) => {
        const formatDate = (dateString: string) => {
          const date = new Date(dateString)
          return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          })
        }
        const startDate = formatDate(item?.startDate)
        const endDate = formatDate(item?.endDate)
        return (
          <Typography>
            {startDate} - {endDate}
          </Typography>
        )
      }
    },
    {
      id: 'serviceRate',
      label: 'RATE',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.serviceRate}</Typography>
    },
    {
      id: 'totalUnits',
      label: 'UNITS',
      minWidth: 170,
      render: (item: any) => <Typography>{item?.units}</Typography>
    },
    {
      id: 'remainingUnits',
      label: 'REM. UNITS',
      minWidth: 170,
      render: (item: any) => {
        const remainingUnits = item?.units - item?.usedUnits
        return <Typography>{remainingUnits}</Typography>
      }
    }
    // {
    //   id: 'usedHours',
    //   label: 'USED HOURS',
    //   minWidth: 170,
    //   render: (item: any) => {
    //     const usedHours = ((item?.usedUnits * 15) / 60).toFixed(2) || 0
    //     return <Typography>{usedHours}</Typography>
    //   }
    // },
    // {
    //   id: 'perDayHours',
    //   label: 'DAILY HRS',
    //   minWidth: 170,
    //   render: (item: any) => {
    //     return (
    //       <Typography>
    //         {isNaN(
    //           calculateQuantityPerFrequency({
    //             startDate: item.startDate,
    //             endDate: item.endDate,
    //             quantity: item.units,
    //             frequency: 'daily'
    //           })
    //         )
    //           ? 'N/A'
    //           : (
    //               calculateQuantityPerFrequency({
    //                 startDate: item.startDate,
    //                 endDate: item.endDate,
    //                 quantity: item.units,
    //                 frequency: 'daily'
    //               }) / 4
    //             ).toFixed(2)}
    //       </Typography>
    //     )
    //   }
    // },
    // {
    //   id: 'perWeekHours',
    //   label: 'WEEKLY HRS',
    //   minWidth: 170,
    //   render: (item: any) => {
    //     return (
    //       <Typography>
    //         {isNaN(
    //           calculateQuantityPerFrequency({
    //             startDate: item.startDate,
    //             endDate: item.endDate,
    //             quantity: item.units,
    //             frequency: 'weekly'
    //           })
    //         )
    //           ? 'N/A'
    //           : (
    //               calculateQuantityPerFrequency({
    //                 startDate: item.startDate,
    //                 endDate: item.endDate,
    //                 quantity: item.units,
    //                 frequency: 'weekly'
    //               }) / 4
    //             ).toFixed(2)}
    //       </Typography>
    //     )
    //   }
    // }
  ]

  return (
    <Card className='mt-3'>
      <CardContent className='flex justify-end'>
        <Button
          variant='contained'
          className='mr-3 bg-[#E89C00]'
          onClick={exportToCSV}
          disabled={loading || !scheduleData || scheduleData.length === 0}
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
          data={scheduleData || []}
          columns={columns}
          keyExtractor={user => user.id.toString()}
          enablePagination
          pageSize={20}
          stickyHeader
          maxHeight={600}
          containerStyle={{ borderRadius: 2 }}
        />
      )}

      {/* <DataTable columns={columns} data={data} /> */}
    </Card>
  )
}

export default ScheduleTable

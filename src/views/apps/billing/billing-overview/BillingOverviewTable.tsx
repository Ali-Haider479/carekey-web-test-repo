'use client'

import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import { CircularProgress, Typography } from '@mui/material'
import Dropdown from '@/@core/components/mui/DropDown'
import { dark } from '@mui/material/styles/createPalette'
import ReactTable from '@/@core/components/mui/ReactTable'
import { transformBillingData } from '@/utils/transformBillingData'
import axios from 'axios'

const BillingOverviewTable = () => {
  const [filteredData, setFilteredData] = useState<any>([])
  const [isLoading, setIsLoading] = useState(false)

  interface Column {
    id: string
    label: string
    minWidth: number
    editable: boolean
    sortable: boolean
    render: (item: any) => JSX.Element
  }

  const columns: Column[] = [
    {
      id: 'clientName',
      label: 'CLIENT NAME',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: item => {
        const client = item.subRows ? item.subRows[0].timelog![0].client : item.timelog![0].client
        return <Typography color='primary'>{`${client.firstName} ${client.lastName}`}</Typography>
      }
    },
    {
      id: 'caregiverName',
      label: 'CAREGIVER NAME',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: item => {
        const caregiver = item.subRows ? item.subRows[0].timelog![0].caregiver : item.timelog![0].caregiver
        return <Typography color='primary'>{`${caregiver.firstName} ${caregiver.lastName}`}</Typography>
      }
    },
    {
      id: 'claimAmount',
      label: 'CLAIM AMOUNT',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: item => <Typography color='primary'>{item.billedAmount}</Typography> // Using billedAmount as claimAmount
    },
    {
      id: 'payer',
      label: 'PAYER',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: item => {
        const payer = item.subRows
          ? item.subRows[0].timelog![0].client.serviceAuth[0].payer
          : item.timelog![0].client.serviceAuth[0].payer
        return <Typography color='primary'>{payer}</Typography>
      }
    },
    {
      id: 'proCode',
      label: 'PROCEDURE CODE',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: item => {
        const serviceAuth = item.subRows
          ? item.subRows[0].timelog![0].client.serviceAuth[0]
          : item.timelog![0].client.serviceAuth[0]
        return <Typography color='primary'>{serviceAuth?.procedureCode ?? ''}</Typography>
      }
    },
    {
      id: 'serviceDateRange',
      label: 'SERVICE DATE RANGE',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: item => <Typography color='primary'>{item.serviceDateRange || '-'}</Typography>
    },
    {
      id: 'claimStatus',
      label: 'CLAIM STATUS',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: item => <Typography color='primary'>{item.claimStatus}</Typography>
    },
    {
      id: 'scheduledHrs',
      label: 'SCHEDULED HRS',
      minWidth: 170,
      editable: true,
      sortable: true,
      render: item => <Typography color='primary'>{item.scheduledHrs}</Typography>
    }
  ]

  useEffect(() => {
    // Simulate data loading and theme initialization
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const getBillingDetails = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log/billing`)
      setFilteredData(transformBillingData(response.data))
      // setFilteredData(transformTimesheetDataTwo(response.data))
    } catch (error) {
      console.error('Error fetching data', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getBillingDetails()
  }, [])

  console.log('BILL OVERVIEW', filteredData)
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
        <ReactTable
          columns={columns}
          data={filteredData}
          keyExtractor={user => user.id.toString()}
          enableRowSelect
          enablePagination
          pageSize={5}
          stickyHeader
          maxHeight={600}
          containerStyle={{ borderRadius: 2 }}
        />
      )}
    </Card>
  )
}

export default BillingOverviewTable

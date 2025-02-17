'use client'

import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import { CircularProgress, Typography } from '@mui/material'
import Dropdown from '@/@core/components/mui/DropDown'
import ReactTable from '@/@core/components/mui/ReactTable'
import axios from 'axios'
import { dark } from '@mui/material/styles/createPalette'
import { calculateHoursWorked } from '@/utils/helperFunctions'

const BillingDetailTable = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [filteredData, setFilteredData] = useState<any[]>([])

  const columns = [
    {
      id: 'clientName',
      label: 'CLIENT NAME',
      minWidth: 170,
      render: (user: any) => (
        <Typography className={`font-semibold ${dark ? 'text-[#7112B7]' : 'text-[#4B0082]'}`} color='primary'>
          {`${user?.client.firstName} ${user?.client.lastName}`}
        </Typography>
      )
    },
    {
      id: 'caregiverName',
      label: 'CAREGIVER NAME',
      minWidth: 170,
      render: (user: any) => (
        <Typography color='primary'> {`${user?.caregiver.firstName} ${user?.caregiver.lastName}`}</Typography>
      )
    },
    {
      id: 'payer',
      label: 'PAYOR',
      minWidth: 170,
      render: (user: any) => <Typography color='primary'>MA</Typography>
    },
    {
      id: 'proCode',
      label: 'PRO CODE',
      minWidth: 170,
      render: (user: any) => <Typography color='primary'>T1020</Typography>
    },
    {
      id: 'serviceDateRange',
      label: 'SERVICE DATE',
      minWidth: 170,
      render: (user: any) => {
        const clockIn = user?.clockIn ? new Date(user?.clockIn) : new Date()
        const clockOut = user?.clockOut ? new Date(user?.clockOut) : new Date()
        return (
          <Typography color='primary'>{`${clockIn.toLocaleDateString('en-US')} - ${clockOut.toLocaleDateString('en-US')}`}</Typography>
        )
      }
    },
    {
      id: 'claimDate',
      label: 'CLAIM DATE',
      minWidth: 170,
      render: (user: any) => {
        const clockOut = user?.clockOut ? new Date(user?.clockOut) : new Date()
        return <Typography color='primary'>{`${clockOut.toLocaleDateString('en-US')}`}</Typography>
      }
    },
    {
      id: 'billedAmount',
      label: 'BILLED AMT',
      minWidth: 170,
      render: (user: any) => {
        const hrs = calculateHoursWorked(user?.clockIn, user?.clockOut)
        const amount = parseFloat(hrs) > 0 ? parseFloat(hrs) * 1000 : 10
        const formattedAmount = amount.toFixed(2) // Format to 2 decimal places
        return <Typography color='primary'>{`$ ${formattedAmount}`}</Typography>
      }
    },
    {
      id: 'receivedAmount',
      label: 'RECEIVED AMT',
      minWidth: 170,
      render: (user: any) => {
        const hrs = calculateHoursWorked(user?.clockIn, user?.clockOut)
        return (
          <Typography color='primary'>{`$ ${parseFloat(hrs) > 0 ? parseFloat(hrs) * 1000 * 0.8 : 10 * 0.8}`}</Typography>
        )
      }
    },

    {
      id: 'claimStatus',
      label: 'CLAIM STATUS',
      minWidth: 170,
      render: (user: any) => (
        <Typography className={`bg-[#6062E8] bg-opacity-20 text-[#6062E8] rounded-2xl px-2 w-[fit-content]`}>
          SCHEDULED
        </Typography>
      )
    }
  ]

  const getBillingDetails = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/time-log/billing`)
      const fetchedData = response.data
      console.log('Billable List ----> ', fetchedData)

      setFilteredData(fetchedData)
    } catch (error) {
      console.error('Error fetching data', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getBillingDetails()
  }, [])

  const handleSelectionChange = (selectedUsers: any) => {
    console.log('Selected users:', selectedUsers)
  }

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

export default BillingDetailTable

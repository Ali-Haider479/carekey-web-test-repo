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
      render: (item: any) => {
        const client = item.timelog[0].client
        console.log(client)
        return (
          <Typography className={`font-semibold ${dark ? 'text-[#7112B7]' : 'text-[#4B0082]'}`} color='primary'>
            {`${client?.firstName} ${client?.lastName}`}
          </Typography>
        )
      }
    },
    {
      id: 'caregiverName',
      label: 'CAREGIVER NAME',
      minWidth: 170,
      render: (item: any) => {
        const caregiver = item.timelog[0].caregiver
        return <Typography color='primary'> {`${caregiver.firstName} ${caregiver.lastName}`}</Typography>
      }
    },
    {
      id: 'payer',
      label: 'PAYOR',
      minWidth: 170,
      render: (item: any) => {
        const payer = item.timelog[0].client.serviceAuth[0].payer
        return <Typography color='primary'>{payer}</Typography>
      }
    },
    {
      id: 'proMod',
      label: 'PRO & MOD',
      minWidth: 170,
      render: (item: any) => {
        const proMod = `${item.timelog[0].client.serviceAuth[0]?.procedureCode ?? ''}-${item.timelog[0].client.serviceAuth[0]?.modifierCode ?? ''}`
        return <Typography color='primary'>{proMod}</Typography>
      }
    },
    {
      id: 'serviceDateRange',
      label: 'SERVICE DATE',
      minWidth: 170,
      render: (item: any) => {
        const clockIn = item?.timelog[0].clockIn ? new Date(item?.timelog[0].clockIn) : new Date()
        const clockOut = item?.timelog[0].clockOut ? new Date(item?.timelog[0].clockOut) : new Date()
        return (
          <Typography color='primary'>{`${clockIn.toLocaleDateString('en-US')} - ${clockOut.toLocaleDateString('en-US')}`}</Typography>
        )
      }
    },
    {
      id: 'claimDate',
      label: 'CLAIM DATE',
      minWidth: 170,
      render: (item: any) => {
        const claimDate = item?.claimDate ? new Date(item?.claimDate) : new Date()
        return <Typography color='primary'>{`${claimDate.toLocaleDateString('en-US')}`}</Typography>
      }
    },
    {
      id: 'billedAmount',
      label: 'BILLED AMT',
      minWidth: 170,
      render: (item: any) => {
        return <Typography color='primary'>{`$ ${item.billedAmount}`}</Typography>
      }
    },
    {
      id: 'receivedAmount',
      label: 'RECEIVED AMT',
      minWidth: 170,
      render: (item: any) => {
        return <Typography color='primary'>{`$ ${item.receivedAmount}`}</Typography>
      }
    },

    {
      id: 'claimStatus',
      label: 'CLAIM STATUS',
      minWidth: 170,
      render: (item: any) => (
        <Typography
          className={`${item.claimStatus === 'Scheduled' ? 'bg-[#6062E8] text-[#6062E8]' : item.claimStatus === 'Approved' ? 'bg-[#72E1281F] text-[#67C932]' : item.claimStatus === 'Pending' ? 'bg-[#26C6F91F] text-[#21AEDB]' : 'bg-[#FF4D491F] text-[#E8381A]'}bg-opacity-20  rounded-2xl px-2 w-[fit-content]`}
        >
          {item.claimStatus}
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

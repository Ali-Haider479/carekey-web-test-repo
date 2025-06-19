'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'

// CSS Module Imports
import styles from '../CaregiversTable.module.css'
import { useParams, useRouter } from 'next/navigation'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import DataTable from '@/@core/components/mui/DataTable'
import { CircularProgress, List, ListItem, Switch, Typography } from '@mui/material'
import axios from 'axios'
import { dark, light } from '@mui/material/styles/createPalette'
import api from '@/utils/api'
import ReactTable from '@/@core/components/mui/ReactTable'
import { useTheme } from '@emotion/react'

interface Column {
  id: string
  label: string
  minWidth: number
  render: (item: any) => JSX.Element
}

const AssignedServiceTable = () => {
  // State
  const { id } = useParams()
  const [data, setData] = useState<any>([])
  const [search, setSearch] = useState('')
  const [assignedClients, setAssignedClients] = useState<any[]>([])
  const [clientServices, setClientServices] = useState<any>()
  const [rowData, setRowData] = useState<any>()
  const [loading, setLoading] = useState(false)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const token = authUser?.backendAccessToken

  const theme: any = useTheme()
  const lightTheme = theme.palette.mode === 'light'

  const label = { inputProps: { 'aria-label': 'Switch demo' } }

  const updateEVV = async (item: any) => {
    try {
      console.log('Item to Edit: ', item)
      const updateEVVPayload = {
        evvEnforce: !item?.evvEnforce // Toggle the current value
      }
      const updateRes = await api.put(`/client/client-service/${item.id}`, updateEVVPayload)
      console.log('EVV Updated Successfully:', updateRes.data)

      // Refresh data after successful update
      await fetchAssignClient()
    } catch (error) {
      console.error('Error Updating evv: ', error)
    }
  }

  const fetchClientService = async (fetchedClients: any) => {
    try {
      setLoading(true)
      const clientServicesRes: any[] = []

      // Use a for...of loop to iterate through fetchedClients
      for (const item of fetchedClients) {
        const clientId = item.client.id

        // Fetch services for the current client
        const serviceResponse = await api.get(`/client/${clientId}/services`)

        // Push only the data from the response
        clientServicesRes.push(serviceResponse.data)
      }

      console.log('Fetched Client Services --> ', clientServicesRes)

      // Update state with the fetched client services
      setClientServices(clientServicesRes)
    } catch (error) {
      console.error('Error fetching client services: ', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignClient = async () => {
    try {
      setLoading(true)
      // Fetch assigned clients
      const caregivers = await api.get(`/caregivers/caregiver/${id}`)
      console.log('CAREGIVER USER ', caregivers)
      const clientResponse = await api.get(`/user/clientUsers/${caregivers?.data?.user?.id}`)
      const fetchedClient = clientResponse.data

      console.log('Assigned Client --> ', fetchedClient)

      // Update state with the fetched clients
      setAssignedClients(fetchedClient)

      // Fetch services for the assigned clients
      await fetchClientService(fetchedClient)
    } catch (error) {
      console.error('Error fetching assigned clients: ', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchAssignClient()
    }

    fetchData()
  }, [id])

  useEffect(() => {
    if (assignedClients?.length > 0 && clientServices?.length > 0) {
      const dataForTable = assignedClients.reduce((acc, item, index) => {
        const services = clientServices[index] || []
        const serviceEntries = services.map((service: any, serviceIndex: number) => ({
          ...item,
          service: service
        }))
        return [...acc, ...serviceEntries]
      }, [])
      console.log('Data for table: ', dataForTable)
      setData(dataForTable)
    }
  }, [assignedClients, clientServices])

  console.log('Data', data)

  const router = useRouter()

  const newColumns: Column[] = [
    {
      id: 'id',
      label: '#',
      minWidth: 170,
      render: item => <Typography className='font-normal text-base my-0'>{item.id}</Typography>
    },
    {
      id: 'client',
      label: 'CLIENT',
      minWidth: 170,
      render: item => (
        <Typography className='mt-0'>
          {item?.client?.firstName} {item?.client?.lastName}
        </Typography>
      )
    },
    {
      id: 'services',
      label: 'SERVICES',
      minWidth: 170,
      render: item => (
        <div className='flex flex-row gap-2 mt-0'>
          <div className='p-1 border border-[#666CFF] border-opacity-[50%] rounded-sm'>
            <Typography className={`${lightTheme ? 'text-[#4B0082]' : 'text-[#8812b7]'}`}>
              {item?.service?.service?.name}
            </Typography>
          </div>
        </div>
      )
    },
    {
      id: 'evvEnforce',
      label: 'EVV',
      minWidth: 170,
      render: item => (
        <div>
          <div className='p-0 flex rounded-sm'>
            <Switch
              {...label}
              checked={item?.service?.clientService?.evvEnforce === true}
              onChange={() => updateEVV(item?.service?.clientService)}
              className='mr-0'
            />
          </div>
        </div>
      )
    }
  ]

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
      {loading ? (
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <ReactTable
            data={data}
            columns={newColumns}
            keyExtractor={user => user.service.clientService.id.toString()}
            enablePagination
            pageSize={25}
            stickyHeader
            maxHeight={600}
            containerStyle={{ borderRadius: 2 }}
          />
        </div>
      )}
    </Card>
  )
}

export default AssignedServiceTable

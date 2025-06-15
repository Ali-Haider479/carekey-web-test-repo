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
import { CircularProgress, List, ListItem, Typography } from '@mui/material'
import axios from 'axios'
import { dark, light } from '@mui/material/styles/createPalette'
import api from '@/utils/api'
import ReactTable from '@/@core/components/mui/ReactTable'

// type AccountHistory = {
//   key: number
//   dateAndTime: string
//   admin: string
//   section: string
//   changesMade: string
// }

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
      // Optionally, handle the error (e.g., set an error state)
    } finally {
      setLoading(false) // Ensure loading state is reset
    }
  }

  const fetchAssignClient = async () => {
    try {
      setLoading(true)
      // Fetch assigned clients
      const caregivers = await api.get(`/caregivers/caregiver/${id}`)
      console.log('CAREGIVER USER ', caregivers)
      // setCurrentUser(caregivers?.data?.user)
      const clientResponse = await api.get(`/user/clientUsers/${caregivers?.data?.user?.id}`)
      const fetchedClient = clientResponse.data

      console.log('Assigned Client --> ', fetchedClient)

      // Update state with the fetched clients
      setAssignedClients(fetchedClient)

      // Fetch services for the assigned clients
      await fetchClientService(fetchedClient)
    } catch (error) {
      console.error('Error fetching assigned clients: ', error)
      // Optionally, handle the error (e.g., set an error state)
    } finally {
      setLoading(false) // Ensure loading state is reset
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchAssignClient() // Wait for clients and their services to be fetched
    }

    fetchData() // Call the async function
  }, [id]) // Add `id` to the dependency array

  useEffect(() => {
    // Compute `dataForTable` only when `assignedClients` and `clientServices` are updated
    if (assignedClients?.length > 0 && clientServices?.length > 0) {
      const dataForTable = assignedClients.map((item: any, index: number) => {
        return { ...item, service: clientServices[index] }
      })
      setData(dataForTable)
    }
  }, [assignedClients, clientServices]) // Add `assignedClients` and `clientServices` as dependencies
  console.log('Data', data)

  const router = useRouter()

  const newColumns: Column[] = [
    {
      id: 'id',
      label: '#',
      minWidth: 170,
      render: item => <Typography className='font-normal text-base my-3'>{item.id}</Typography>
    },
    {
      id: 'client',
      label: 'CLIENT',
      minWidth: 170,
      render: item => (
        <Typography className='mt-4'>
          {item?.client?.firstName} {item?.client?.lastName}
        </Typography>
      )
    },
    {
      id: 'services',
      label: 'SERVICES',
      minWidth: 170,
      render: item => (
        <div className='flex flex-row gap-2 mt-2'>
          <div className='p-1 border border-[#666CFF] border-opacity-[50%] rounded-sm'>
            <Typography
              className={`${light ? 'text-[#4B0082]' : 'text-[#7013b7]'} ${dark ? 'text-[#7013b7]' : 'text-[#4B0082]'}`}
            >
              {item?.service[0]?.name}
            </Typography>
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
            keyExtractor={user => user.id.toString()}
            enablePagination
            pageSize={25}
            stickyHeader
            maxHeight={600}
            containerStyle={{ borderRadius: 2 }}
          />
        </div>
      )}
      {/* Table */}
    </Card>
  )
}

export default AssignedServiceTable

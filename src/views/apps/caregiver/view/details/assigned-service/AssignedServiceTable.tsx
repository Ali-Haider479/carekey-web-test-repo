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
import { List, ListItem, Typography } from '@mui/material'
import axios from 'axios'
import { dark, light } from '@mui/material/styles/createPalette'
import api from '@/utils/api'

// type AccountHistory = {
//   key: number
//   dateAndTime: string
//   admin: string
//   section: string
//   changesMade: string
// }

const AssignedServiceTable = () => {
  // State
  const { id } = useParams()
  const [data, setData] = useState<any>([])
  const [search, setSearch] = useState('')
  const [assignedClients, setAssignedClients] = useState<any[]>([])
  const [clientServices, setClientServices] = useState<any>()
  const [rowData, setRowData] = useState<any>()
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const token = authUser?.backendAccessToken

  const fetchClientService = async (fetchedClients: any) => {
    try {
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
    }
  }

  const fetchAssignClient = async () => {
    try {
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

  // const rowData = [
  //   {
  //     id: '1',
  //     client: 'Sameer Khan',
  //     services: ['IHS (with training)', 'IHS (with training)']
  //   },
  //   {
  //     id: '2',
  //     client: 'Stancy Midth',
  //     services: ['IHS (with training)']
  //   },
  //   {
  //     id: '3',
  //     client: 'Hasnain Ahmad',
  //     services: ['IHS (with training)']
  //   },
  //   {
  //     id: '4',
  //     client: 'Rupesh Hog',
  //     services: ['IHS (with training)', 'IHS (with training)']
  //   },
  //   {
  //     id: '5',
  //     client: 'Salma Zami',
  //     services: ['IHS (with training)']
  //   },
  //   {
  //     id: '6',
  //     client: 'Shuaib Kareem',
  //     services: ['IHS (with training)', 'IHS (with training)', 'IHS (with training']
  //   },
  //   {
  //     id: '7',
  //     client: 'Raees Khan',
  //     services: ['IHS (with training)']
  //   }
  // ]

  const newColumns: GridColDef[] = [
    // {
    //   field: 'itemNumber',
    //   headerName: '#',
    //   flex: 0.5,
    //   renderCell: (params: GridRenderCellParams) => <span>{params.row.index + 1}</span>
    // },
    {
      field: 'id',
      headerName: '#',
      flex: 0.1
    },
    {
      field: 'client',
      headerName: 'CLIENT',
      flex: 0.3,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='mt-4'>
          {params?.row?.client?.firstName} {params?.row?.client?.lastName}
        </Typography>
      )
    },
    {
      field: 'services',
      headerName: 'SERVICES',
      flex: 0.8,
      renderCell: (params: GridRenderCellParams) => (
        <div className='flex flex-row gap-2 mt-2'>
          <div className='p-1 border border-[#666CFF] border-opacity-[50%] rounded-sm'>
            <Typography
              className={`${light ? 'text-[#4B0082]' : 'text-[#7013b7]'} ${dark ? 'text-[#7013b7]' : 'text-[#4B0082]'}`}
            >
              {params?.row?.service[0]?.name}
            </Typography>
          </div>
        </div>
      )
    }
  ]

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <DataTable columns={newColumns} data={data} />
      </div>
    </Card>
  )
}

export default AssignedServiceTable

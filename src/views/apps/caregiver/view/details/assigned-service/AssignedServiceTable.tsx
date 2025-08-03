'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import { CircularProgress, Switch, Typography, useTheme } from '@mui/material'

// CSS Module Imports
import styles from '../CaregiversTable.module.css'
import { useParams, useRouter } from 'next/navigation'
import { GridColDef } from '@mui/x-data-grid'
import ReactTable from '@/@core/components/mui/ReactTable'
import api from '@/utils/api'

interface Column {
  id: string
  label: string
  minWidth: number
  render: (item: any) => JSX.Element
}

const AssignedServiceTable = () => {
  // State
  const { id } = useParams()
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [assignedClients, setAssignedClients] = useState<any[]>([])
  const [clientServices, setClientServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const tenantEvvConfig: any = JSON.parse(localStorage?.getItem('evvConfig') ?? '{}')

  console.log('AUTH USER DATA --->> ', authUser)

  const theme = useTheme()
  const lightTheme = theme.palette.mode === 'light'

  const label = { inputProps: { 'aria-label': 'Switch demo' } }

  const updateEVV = async (item: any) => {
    try {
      console.log('Item to Edit: ', item)
      const updateEVVPayload = {
        evvEnforce: !item?.evv // Toggle the current value
      }
      const updateRes = await api.put(`/client/client-service/${item.clientServiceId}`, updateEVVPayload)
      console.log('EVV Updated Successfully:', updateRes.data)

      // Refresh data after successful update
      await fetchAssignClient()
    } catch (error) {
      console.error('Error Updating evv: ', error)
    }
  }

  const fetchClientService = async (fetchedClients: any[]) => {
    try {
      setLoading(true)
      const clientServicesRes: any[] = []

      // Fetch services for each client
      for (const item of fetchedClients) {
        const clientId = item.client.id
        const services: any[] = []

        // Fetch regular services
        const serviceResponse = await api.get(`/client/${clientId}/services`)
        services.push(...(serviceResponse.data || []))

        // Fetch service auth services
        const serviceAuthServicesResponse = await api.get(`/client/${clientId}/service-auth/services`)
        services.push(...(serviceAuthServicesResponse.data || []))

        // Store services for this client
        clientServicesRes.push({ clientId, services })
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
      const dataForTable = assignedClients.reduce((acc, item) => {
        // Find the services for the current client
        const clientService = clientServices.find(cs => cs.clientId === item.client.id)
        const services = clientService?.services || []

        // Skip if no services are available
        if (services.length === 0) {
          return acc
        }

        // Map services to table entries, filtering out null or undefined services
        const serviceEntries = services
          .filter((service: any) => service.id != null) // Filter out null or undefined services
          .map((service: any) => ({
            ...item,
            service,
            clientServiceId: service.clientServiceId || service.id // Ensure clientServiceId is available for updateEVV
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
          {item?.client?.firstName} {item?.client?.lastName}{' '}
        </Typography>
      )
    },
    {
      id: 'services',
      label: 'SERVICES',
      minWidth: 170,
      render: item => (
        <div className='flex flex-row gap-2 mt-0'>
          <div
            className={`p-1 border ${lightTheme ? 'border-[#4B0082]' : 'border-gray-200'} border-opacity-[50%] px-2 rounded-sm`}
          >
            <Typography className={`${lightTheme ? 'text-[#4B0082]' : null}`}>
              {item?.service?.name} {item?.service?.dummyService ? '(Demo Service)' : '(S.A Service)'}
            </Typography>
          </div>
        </div>
      )
    },
    {
      id: 'procedureCode',
      label: 'PROCEDURE CODE',
      minWidth: 170,
      render: item => <Typography className='mt-0'> {item?.service?.procedureCode}</Typography>
    },
    {
      id: 'modifierCode',
      label: 'MODIFIER CODE',
      minWidth: 170,
      render: item => <Typography className='mt-0'>{item?.service?.modifierCode}</Typography>
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
              checked={item?.service?.evv === true}
              onChange={() => updateEVV(item?.service)}
              color='primary'
              disabled={tenantEvvConfig?.evvEnforcement === 'evvDisabled'}
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
            keyExtractor={user => user?.service?.id?.toString()}
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

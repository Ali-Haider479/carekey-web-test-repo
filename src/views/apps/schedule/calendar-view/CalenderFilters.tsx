import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import Dropdown from '@/@core/components/mui/DropDown'
import { useAppDispatch } from '@/hooks/useDispatch'
import { clearFilter, filterCaregiverSchedules } from '@/redux-store/slices/calendar'
import api from '@/utils/api'
import { Grid2 as Grid, MenuItem, TextField, Typography } from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const CalenderFilters = ({ filterEvent }: any) => {
  const userRole = [
    { id: 1, value: 'caregiver', name: 'Caregiver' },
    { id: 2, value: 'client', name: 'Client' }
  ]

  const [caregivers, setCaregivers] = useState<any>()
  const [clients, setCllients] = useState<any>()
  const [selectedCaregiver, setSelectedCaregiver] = useState<string | number>('')
  const [selectedClient, setSelectedClient] = useState<string | number>('')
  const [selectedRole, setSelectedRole] = useState<any>('caregiver')
  const [assignedClients, setAssignedClients] = useState<any>(null)

  const dispatch = useAppDispatch()

  const fetchCaregiverList = async () => {
    try {
      const caregiversResponse = await api.get(`/caregivers`)
      const fetchedCaregivers = caregiversResponse.data
      console.log('Caregivers List --> ', fetchedCaregivers)
      setCaregivers(fetchedCaregivers)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  const fetchAssignClient = async () => {
    try {
      // Fetch assigned clients
      const caregivers = await api.get(`/caregivers/caregiver/${Number(selectedCaregiver)}`)
      console.log('CAREGIVER USER ', caregivers)
      const clientResponse = await api.get(`/user/clientUsers/${caregivers?.data?.user?.id}`)
      const fetchedClient = clientResponse.data

      console.log('Assigned Client --> ', fetchedClient)

      // Update state with the fetched clients
      setAssignedClients(fetchedClient)
    } catch (error) {
      console.error('Error fetching assigned clients: ', error)
    }
  }

  useEffect(() => {
    if (selectedCaregiver !== '') {
      fetchAssignClient()
      filterEvent(Number(selectedCaregiver), 'caregiver')
      filterEvent('', 'client')
    } else {
      setAssignedClients(null)
    }
  }, [selectedCaregiver])

  const fetchClientsList = async () => {
    try {
      const clientsResponse = await api.get(`/client`)
      const fetchedClients = clientsResponse.data
      console.log('Client List --> ', fetchedClients)
      setCllients(fetchedClients)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  useEffect(() => {
    fetchCaregiverList()
    fetchClientsList()
  }, [])

  const handlReset = () => {
    setSelectedCaregiver(0)
    setSelectedClient(0)
    dispatch(clearFilter())
  }

  const handleRoleChange = (e: any) => {
    setSelectedRole(e.target.value)
    if (e.target.value === 'caregiver') {
      setSelectedClient(0)
      dispatch(clearFilter())
    } else {
      setSelectedCaregiver(0)
      dispatch(clearFilter())
    }
  }

  console.log('Selected Caregiver --> ', selectedCaregiver)
  console.log('Selected client --> ', selectedClient)
  console.log('Selected Role --> ', selectedRole)

  return (
    <>
      <Typography variant='h4' className='mb-2'>
        Filters
      </Typography>
      <Grid container spacing={4} sx={{ marginBottom: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography className='mb-2'>Select a Caregiver</Typography>
          <TextField
            select
            size='small'
            fullWidth
            placeholder='Caregivers'
            id='select-caregiver'
            value={selectedCaregiver}
            onChange={e => {
              if (e.target.value !== '') {
                setSelectedCaregiver(Number(e.target.value))
                filterEvent(Number(e.target.value), 'caregiver')
              } else {
                setSelectedCaregiver('')
                setSelectedClient('')
                filterEvent('', 'caregiver')
                filterEvent('', 'client')
              }
            }}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value='' className=''>
              All Caregivers
            </MenuItem>
            {caregivers?.map((item: any) => (
              <MenuItem key={item.id} value={item.id} className=''>
                {item.firstName} {item.lastName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography className='mb-2'>{assignedClients ? 'Select an Assigned Client' : 'Select a Client'}</Typography>
          <TextField
            select
            size='small'
            fullWidth
            placeholder='Cleints'
            id='select-cleint'
            value={selectedClient}
            onChange={e => {
              if (e.target.value !== '') {
                setSelectedClient(Number(e.target.value))
                filterEvent(Number(e.target.value), 'client')
              } else {
                setSelectedClient('')
                filterEvent('', 'client')
              }
            }}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            {!assignedClients && (
              <MenuItem value='' className=''>
                All Clients
              </MenuItem>
            )}
            {assignedClients
              ? assignedClients?.map((item: any) => (
                  <MenuItem key={item.client.id} value={item.client.id} className=''>
                    {item.client.firstName} {item.client.lastName}
                  </MenuItem>
                ))
              : clients?.map((item: any) => (
                  <MenuItem key={item.id} value={item.id} className=''>
                    {item.firstName} {item.lastName}
                  </MenuItem>
                ))}
          </TextField>
        </Grid>
      </Grid>
    </>
  )
}

export default CalenderFilters

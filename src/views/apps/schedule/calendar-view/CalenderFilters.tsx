import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import Dropdown from '@/@core/components/mui/DropDown'
import { useAppDispatch } from '@/hooks/useDispatch'
import { clearFilter, filterCaregiverSchedules } from '@/redux-store/slices/calendar'
import api from '@/utils/api'
import { Grid2 as Grid, Typography } from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const CalenderFilters = ({ filterEvent }: any) => {
  const userRole = [
    { id: 1, value: 'caregiver', name: 'Caregiver' },
    { id: 2, value: 'client', name: 'Client' }
  ]

  const [caregivers, setCaregivers] = useState<any>()
  const [clients, setCllients] = useState<any>()
  const [selectedCaregiver, setSelectedCaregiver] = useState<number>(0)
  const [selectedClient, setSelectedClient] = useState<number>(0)
  const [selectedRole, setSelectedRole] = useState<any>('caregiver')

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
          <Typography className='mb-2'>Select a Role</Typography>
          <Dropdown
            setValue={(id: any) => {
              setSelectedRole(id)
            }}
            value={selectedRole}
            options={userRole?.map((item: any) => ({ key: item.id, value: item.value, displayValue: item.name }))}
            onChange={(e: any) => handleRoleChange(e)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography className='mb-2'>Select a {selectedRole}</Typography>
          <Dropdown
            value={selectedRole === 'caregiver' ? selectedCaregiver : selectedClient}
            setValue={
              selectedRole === 'caregiver'
                ? (id: any) => {
                    filterEvent(id, 'caregiver')
                    setSelectedCaregiver(id)
                  }
                : (id: any) => {
                    filterEvent(id, 'client')
                    setSelectedClient(id)
                  }
            }
            options={
              selectedRole === 'caregiver'
                ? caregivers?.map((item: any) => ({
                    key: item.id,
                    value: item.id,
                    displayValue: `${item.firstName} ${item.lastName}`
                  }))
                : clients?.map((item: any) => ({
                    key: item.id,
                    value: item.id,
                    displayValue: `${item.firstName} ${item.lastName}`
                  }))
            }
          />
        </Grid>
      </Grid>
    </>
  )
}

export default CalenderFilters

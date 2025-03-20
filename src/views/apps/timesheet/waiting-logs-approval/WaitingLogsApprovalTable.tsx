'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { CircularProgress, Typography } from '@mui/material'
import DataTable from '@/@core/components/mui/DataTable'
import { GridColDef } from '@mui/x-data-grid'
import AdUnitsIcon from '@mui/icons-material/AdUnits'
import { calculateHoursWorked } from '@/utils/helperFunctions'
import ReactTable from '@/@core/components/mui/ReactTable'
import { dark } from '@mui/material/styles/createPalette'
// Updated interfaces to match your data structure
interface Caregiver {
  id: number
  firstName: string
  lastName: string
  middleName: string
  gender: string
  dateOfBirth: string
  caregiverUMPI: string
  payRate: number
  additionalPayRate: number
  caregiverLevel: string
}

interface Client {
  id: number
  firstName: string
  lastName: string
  middleName: string
  gender: string
  dateOfBirth: string
  pmiNumber: string
  clientCode: string
  clientServices: any
}

interface Signature {
  id: number
  clientSignStatus: string
  tsApprovalStatus: string
  duration: string
  caregiverSignature: string
  clientSignature: string
  caregiver: Caregiver
  client: Client
  timeLog: any[]
}

interface SignatureStatusTableProps {
  data: []
  isLoading: boolean
}

interface Location {
  latitude: number
  longitude: number
}

interface LocationDetails {
  city: string
  country: string
}

const WaitingLogsApprovalTable = ({ data, isLoading }: SignatureStatusTableProps) => {
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  // Custom hook for location details
  const useLocationDetails = (location: Location) => {
    const [locationDetails, setLocationDetails] = useState<LocationDetails>({
      city: 'Loading...',
      country: 'Loading...'
    })

    const getLocationDetails = useCallback(async (latitude: number, longitude: number): Promise<LocationDetails> => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
        )
        const data = await response.json()

        return {
          city:
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            (data?.address?.district ? data?.address?.district?.split(' ')[0] : null) ||
            'Unknown',
          country: data?.address?.country || 'Unknown'
        }
      } catch (error) {
        console.error('Error fetching location details:', error)
        return { city: 'Unknown', country: 'Unknown' }
      }
    }, [])

    useEffect(() => {
      let isMounted = true

      const fetchLocationDetails = async () => {
        const details = await getLocationDetails(location?.latitude, location?.longitude)
        if (isMounted) {
          setLocationDetails(details)
        }
      }

      fetchLocationDetails()

      return () => {
        isMounted = false
      }
    }, [location?.latitude, location?.longitude, getLocationDetails])

    return locationDetails
  }

  // Memoized components
  const LocationCell = React.memo(({ location }: { location: Location }) => {
    const locationDetails = useLocationDetails(location)

    return (
      <Typography color='primary'>
        {locationDetails?.city ? `${locationDetails.city}, ` : ''}
        {locationDetails?.country || 'Unknown Country'}
      </Typography>
    )
  })

  const columns = [
    {
      id: 'clientName',
      label: 'CLIENT',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Typography className={`${dark ? 'text-[#8082FF]' : 'text-[#4B0082]'}`} color='primary'>
          {`${user?.client?.firstName} ${user?.client?.lastName}`}
        </Typography>
      )
    },
    {
      id: 'caregiverName',
      label: 'CAREGIVER',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => (
        <Typography
          color='primary'
          className='text-[#71DD37]'
        >{`${user?.caregiver?.firstName} ${user?.caregiver?.lastName}`}</Typography>
      )
    },
    {
      id: 'dateOfService',
      label: 'DATE',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        const dateOfService = user?.dateOfService

        if (dateOfService) {
          // Try to parse it as a timestamp
          const parsedDate = new Date(dateOfService)

          // Check if the parsed date is valid (not "Invalid Date")
          if (!isNaN(parsedDate.getTime())) {
            return (
              <Typography className='font-normal text-base '>
                {`${parsedDate.getMonth() + 1}/${parsedDate.getDate()}/${parsedDate.getFullYear().toString().slice(-2)}`}
              </Typography>
            )
          }

          // If it's not a valid timestamp, return the raw string as is
          return <Typography className='font-normal text-base '>{dateOfService}</Typography>
        }

        // If dateOfService is null/undefined, return N/A
        return <Typography className='font-normal text-base '>N/A</Typography>
      }
    },
    {
      id: 'startDate',
      label: 'START & END TIME',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        if (!user?.clockIn || !user?.clockOut) {
          return <Typography className='font-normal text-base '>---</Typography>
        } else {
          const startTime = user?.clockIn
          const endTime = user?.clockOut
          if (startTime) {
            // Parse the date string into a Date object
            const startDate = new Date(startTime)
            const endDate = new Date(endTime)
            // Format the time as "03:00:08 PM"
            const formattedStartTime = startDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })
            const formattedEndTime = endDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })
            return (
              <Typography className='font-normal text-base '>
                {formattedStartTime} - {formattedEndTime}
              </Typography>
            )
          }
        }
      }
    },
    {
      id: 'timeDuration',
      label: 'HRS WORKED',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) => {
        if (!user?.clockIn || !user?.clockOut) {
          return <Typography className='font-normal text-base '>{user?.hrsWorked} Hrs</Typography>
        } else {
          const hoursWorked = calculateHoursWorked(user?.clockIn, user?.clockOut)
          return <Typography className='font-normal text-base '>{hoursWorked} Hrs</Typography>
        }
      }
    },
    {
      id: 'logsVia',
      label: 'LOGGED VIA',
      minWidth: 170,
      render: (params: any) => <AdUnitsIcon className=' text-[#8082FF]' />
    },
    {
      id: 'location',
      label: 'CHECK LOCATION',
      minWidth: 170,
      editable: false,
      sortable: true,
      render: (user: any) =>
        user?.isCommunityVisit || !user?.startLocation ? (
          <Typography color='primary'>Community Visit</Typography>
        ) : (
          <LocationCell location={user?.startLocation} />
        )
    }

    // {
    //   id: 'actions',
    //   label: 'ACTION',
    //   editable: false,
    //   render: (user: any) => (
    //     <ActionButton
    //       handleEdit={handleEdit}
    //       handleSave={handleSave}
    //       handleActionClick={handleActionClick}
    //       handleCloseMenu={handleCloseMenu}
    //       handleCancelEdit={handleCancelEdit}
    //       isEditing={editingId !== null}
    //       user={user}
    //       selectedUser={selectedUser}
    //       anchorEl={anchorEl}
    //     />
    //   )
    // }
  ]

  if (isLoading) {
    return (
      <Card>
        <div className='flex items-center justify-center p-10'>
          <CircularProgress />
        </div>
      </Card>
    )
  }

  return (
    <div style={{ overflowX: 'auto', padding: '0px' }}>
      <ReactTable
        columns={columns}
        data={data}
        keyExtractor={user => user.id.toString()}
        enableRowSelect
        enablePagination
        pageSize={5}
        stickyHeader
        maxHeight={600}
        containerStyle={{ borderRadius: 2 }}
      />
    </div>
  )
}
export default WaitingLogsApprovalTable

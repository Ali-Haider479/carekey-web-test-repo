'use client'
import DataTable from '@/@core/components/mui/DataTable'
import { Card, Typography } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

import axios from 'axios'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const IncidentsTab = () => {
  const { id } = useParams()
  const [incidentsData, setIncidentsData] = useState<any>()

  const fetchClientIncidents = async () => {
    const clientIncidentsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client/${id}/incident-report`)
    console.log('clientIncidentsRes', clientIncidentsRes)
    setIncidentsData(clientIncidentsRes.data)
  }

  useEffect(() => {
    fetchClientIncidents()
  }, [])

  const getInitials = (fullName: string): string => {
    const names = fullName?.trim().split(' ').filter(Boolean) // Split and remove extra spaces

    if (names?.length === 1) {
      return names[0][0].toUpperCase() // Only one name, return its initial
    }

    if (names?.length >= 2) {
      return `${names[0][0].toUpperCase()}${names[names.length - 1][0].toUpperCase()}` // First and last name initials
    }

    return '' // Return empty string if no valid names
  }

  const columns: GridColDef[] = [
    {
      renderHeader: () => (
        <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`CAREGIVER `}</Typography>
      ),
      field: 'caregiver',
      flex: 0.65,
      renderCell: (params: GridRenderCellParams) => (
        <div style={{ height: '50px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}>
          <div className='h-8 w-8 p-[3px] pl-[6px] bg-[#BDBDBD] text-white border-2 rounded justify-center text-base'>
            {getInitials(`${params.row.caregiver?.firstName} ${params.row.caregiver?.lastName}`)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong className='h-4'>{`${params.row.caregiver?.firstName} ${params.row.caregiver?.lastName}`}</strong>
            <span>{params.row?.caregiver?.emergencyEmailId}</span>
          </div>
        </div>
      )
    },
    {
      renderHeader: () => (
        <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`EMPLOYEE INVOLVED`}</Typography>
      ),
      field: 'employeeInvolved',
      flex: 0.35
    },
    {
      renderHeader: () => (
        <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`INCIDENT `}</Typography>
      ),
      field: 'incidentType',
      flex: 0.35
    },
    {
      renderHeader: () => (
        <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`INCIDENT LOCATION`}</Typography>
      ),
      field: 'incidentLocation',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='whitespace-normal break-words truncate mt-1 text-sm'>
          {params.row.incidentLocation}
        </Typography>
      )
    },
    {
      renderHeader: () => (
        <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`INCIDENT DATE`}</Typography>
      ),
      field: 'incidentDate',
      flex: 0.4,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>
          {new Date(params.row.incidentDate).toLocaleString()}
        </Typography>
      )
    },
    {
      renderHeader: () => (
        <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`FAMILY INFORMED`}</Typography>
      ),
      field: 'reportedToClientFamily',
      flex: 0.35,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='whitespace-normal break-words truncate mt-4 text-sm '>
          {params.row.reportedToClientFamily === true ? 'Yes' : 'No'}
        </Typography>
      )
    },
    {
      renderHeader: () => (
        <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`MEDICAL REFUSED`}</Typography>
      ),
      field: 'patientRefuseMedicalAttention',
      flex: 0.35,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='whitespace-normal break-words truncate mt-4 text-sm '>
          {params.row.patientRefuseMedicalAttention === true ? 'Yes' : 'No'}
        </Typography>
      )
    },
    {
      renderHeader: () => (
        <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`PHYSICIAN REPORTED`}</Typography>
      ),
      field: 'reportedToPhysician',
      flex: 0.35,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='whitespace-normal break-words truncate mt-4 text-sm '>
          {params.row.reportedToPhysician === true ? 'Yes' : 'No'}
        </Typography>
      )
    },
    {
      renderHeader: () => (
        <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`STAFF REPORTED`}</Typography>
      ),
      field: 'reportedToStaff',
      flex: 0.35,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='whitespace-normal break-words truncate mt-4 text-sm '>
          {params.row.reportedToStaff === true ? 'Yes' : 'No'}
        </Typography>
      )
    },
    {
      renderHeader: () => (
        <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>{`DESCRIPTION`}</Typography>
      ),
      field: 'incidentDescription',
      flex: 0.85,
      renderCell: (params: GridRenderCellParams) => (
        <Typography className='whitespace-normal break-words truncate mt-1 text-sm '>
          {params.row.incidentDescription}
        </Typography>
      )
    }
    // {
    //   headerName: 'Action',
    //   flex: 0.75,
    //   renderCell: (params: GridRenderCellParams) => (
    //     <div style={{ display: 'flex', gap: '8px' }}>
    //       <button onClick={() => handleEdit(params.row)}>Edit</button>
    //       <button onClick={() => handleDelete(params.row)}>Delete</button>
    //     </div>
    //   ),
  ]

  return (
    <Card>
      <Typography className='text-xl p-6'>Incident Reports</Typography>
      <DataTable columns={columns} data={incidentsData} />
    </Card>
  )
}

export default IncidentsTab

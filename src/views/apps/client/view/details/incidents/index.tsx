'use client'
import DataTable from '@/@core/components/mui/DataTable'
import { Card, Typography } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { description } from 'valibot'

const IncidentsTab = () => {
  const data = [
    {
      id: 1,
      companyName: 'Company Name',
      companyId: '234512129',
      incidentType: 'Car Accident',
      incidentCategory: 'Accident',
      dateOfIncident: '05/01/2024 \n03:35 PM',
      description: '-'
    },
    {
      id: 2,
      companyName: 'Company Name',
      companyId: '234512129',
      incidentType: 'Car Accident',
      incidentCategory: 'Accident',
      dateOfIncident: '05/01/2024 \n03:35 PM',
      description: '-'
    },
    {
      id: 3,
      companyName: 'Company Name',
      companyId: '234512129',
      incidentType: 'Car Accident',
      incidentCategory: 'Accident',
      dateOfIncident: '05/01/2024 \n03:35 PM',
      description: '-'
    },
    {
      id: 4,
      companyName: 'Company Name',
      companyId: '234512129',
      incidentType: 'Car Accident',
      incidentCategory: 'Accident',
      dateOfIncident: '05/01/2024 \n03:35 PM',
      description: '-'
    }
  ]
  const columns: GridColDef[] = [
    {
      headerName: 'COMPANY',
      field: 'companyName',
      flex: 0.75,
      renderCell: (params: GridRenderCellParams) => (
        <div style={{ height: '50px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}>
          <div className='h-8 w-8 p-1 bg-[#BDBDBD] text-white border-2 rounded justify-center text-base'>OP</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong className='h-4'>{params.row.companyName}</strong>
            <span>{params.row.companyId}</span>
          </div>
        </div>
      )
    },
    {
      headerName: 'INCIDENT',
      field: 'incidentType',
      flex: 0.75
    },
    {
      headerName: 'INCIDENT CATEGORY',
      field: 'incidentCategory',
      flex: 0.75
    },
    {
      headerName: 'DATE OF INCIDENT',
      field: 'dateOfIncident',
      flex: 0.75
    },
    {
      headerName: 'DESCRIPTION',
      field: 'description',
      flex: 0.75
    }
    // {
    //   headerName: 'Action',
    //   flex: 0.75,
    //   renderCell: () => <>:</>
    // }
  ]

  return (
    <Card>
      <Typography className='text-xl p-6'>Incident Reports</Typography>
      <DataTable columns={columns} data={data} />
    </Card>
  )
}

export default IncidentsTab

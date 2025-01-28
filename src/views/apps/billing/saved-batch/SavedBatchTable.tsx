'use client'

import { useState } from 'react'
import Card from '@mui/material/Card'
import { CircularProgress } from '@mui/material'
import DataTable from '@/@core/components/mui/DataTable'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

// Helper function to calculate duration with fallback
const calculateDuration = (clockIn?: string, clockOut?: string): string => {
  if (!clockIn || !clockOut) return 'N/A'

  try {
    const start = new Date(`1970/01/01 ${clockIn}`)
    const end = new Date(`1970/01/01 ${clockOut}`)

    const diffMs = end.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  } catch (error) {
    return 'N/A'
  }
}

const rows = [
  {
    id: 1,
    batchName: 'Exercise',
    dateOfSubmission: '2025-01-10',
    submissionDate: '2025-01-12',
    remitanceStatus: 'Pending',
    finalStatus: 'In Progress'
  },
  {
    id: 2,
    batchName: 'Running',
    dateOfSubmission: '2025-01-08',
    submissionDate: '2025-01-09',
    remitanceStatus: 'Completed',
    finalStatus: 'Completed'
  },
  {
    id: 3,
    batchName: 'Gym',
    dateOfSubmission: '2025-01-15',
    submissionDate: '2025-01-16',
    remitanceStatus: 'Pending',
    finalStatus: 'In Progress'
  },
  {
    id: 4,
    batchName: 'Swimming',
    dateOfSubmission: '2025-01-05',
    submissionDate: '2025-01-06',
    remitanceStatus: 'Completed',
    finalStatus: 'Completed'
  }
]

const SavedBatchTable = () => {
  const [filteredData, setFilteredData] = useState(rows)
  const [isLoading, setIsLoading] = useState(false)

  const columns: GridColDef[] = [
    {
      field: 'batchName',
      headerName: 'BATCH NAME',
      flex: 1.5
    },
    {
      field: 'dateOfSubmission',
      headerName: 'DATE OF SUBMISSION',
      flex: 1
    },
    {
      field: 'submissionDate',
      headerName: 'SUBMISSION DATE',
      flex: 1
    },
    {
      field: 'remitanceStatus',
      headerName: 'REMITANCE STATUS',
      flex: 1
    },
    {
      field: 'finalStatus',
      headerName: 'FINAL STATUS',
      flex: 1,
      renderCell: params => (
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            params.value === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {params.value}
        </span>
      )
    }
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
    <Card sx={{ borderRadius: 1, boxShadow: 3 }}>
      {/* <CardHeader title='Saved Batch' className='pb-4' /> */}
      <DataTable data={filteredData} columns={columns} />
    </Card>
  )
}

export default SavedBatchTable

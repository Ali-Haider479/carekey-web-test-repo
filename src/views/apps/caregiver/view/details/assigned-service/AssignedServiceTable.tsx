'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'

// CSS Module Imports
import styles from '../CaregiversTable.module.css'
import { useRouter } from 'next/navigation'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import DataTable from '@/@core/components/mui/DataTable'
import { List, ListItem, Typography } from '@mui/material'

// type AccountHistory = {
//   key: number
//   dateAndTime: string
//   admin: string
//   section: string
//   changesMade: string
// }

const AssignedServiceTable = () => {
  // State
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')

  const router = useRouter()

  const rowData = [
    {
      id: '1',
      client: 'Sameer Khan',
      services: ['IHS (with training)', 'IHS (with training)']
    },
    {
      id: '2',
      client: 'Stancy Midth',
      services: ['IHS (with training)']
    },
    {
      id: '3',
      client: 'Hasnain Ahmad',
      services: ['IHS (with training)']
    },
    {
      id: '4',
      client: 'Rupesh Hog',
      services: ['IHS (with training)', 'IHS (with training)']
    },
    {
      id: '5',
      client: 'Salma Zami',
      services: ['IHS (with training)']
    },
    {
      id: '6',
      client: 'Shuaib Kareem',
      services: ['IHS (with training)', 'IHS (with training)', 'IHS (with training']
    },
    {
      id: '7',
      client: 'Raees Khan',
      services: ['IHS (with training)']
    }
  ]

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
      flex: 0.3
    },
    {
      field: 'services',
      headerName: 'SERVICES',
      flex: 0.8,
      renderCell: (params: GridRenderCellParams) => (
        <div className='flex flex-row gap-2 mt-2'>
          {params.row.services.map((service: any, index: any) => (
            <div key={index} className='p-1 border border-[#666CFF] border-opacity-[50%] rounded-sm'>
              <Typography className='text-[#4B0082]'>{service}</Typography>
            </div>
          ))}
        </div>
      )
    }
  ]

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <DataTable columns={newColumns} data={rowData} />
      </div>
    </Card>
  )
}

export default AssignedServiceTable

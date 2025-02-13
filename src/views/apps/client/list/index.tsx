'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import { useEffect, useState } from 'react'
import axios from 'axios'

// Component Imports
import Dropdown from '@/@core/components/mui/DropDown'

import type { ClientTypes } from '@/types/apps/clientTypes'
import { Avatar, Button, Card, Chip, TextField } from '@mui/material'
import DataTable from '@/@core/components/mui/DataTable'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useRouter } from 'next/navigation'

const ClientListApps = () => {
  const router = useRouter()
  const [data, setData] = useState<ClientTypes[]>([])
  const [dataWithProfileImg, setDataWithProfileImg] = useState<ClientTypes[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [search, setSearch] = useState('')
  const [item, setItem] = useState('')
  const [status, setStatus] = useState('')

  const statusOptions = [
    { key: 1, value: 'pending', displayValue: 'Pending' },
    { key: 2, value: 'active', displayValue: 'Active' },
    { key: 3, value: 'inactive', displayValue: 'Inactive' }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client`)
      console.log('RESPONSE CLIENT DATA', response)
      setData(response.data)
    } catch (error) {
      console.log('CLIENT DATA ERROR', error)
    }
  }

  useEffect(() => {
    if (data?.length > 0) {
      fetchProfileImages()
    }
  }, [data])

  const getProfileImage = async (key: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client/getProfileUrl/${key}`)
      return res.data
    } catch (err) {
      throw Error(`Error in fetching profile image url, ${err}`)
    }
  }

  const fetchProfileImages = async () => {
    if (data) {
      const dataWithPhotoUrls = await Promise.all(
        data?.map(async (item: any) => {
          const profileImgUrl =
            item?.profileImgUrl !== null ? await getProfileImage(item?.profileImgUrl) : item?.profileImgUrl
          return {
            ...item,
            profileImgUrl: profileImgUrl
          }
        })
      )
      setDataWithProfileImg(dataWithPhotoUrls)
    }
  }

  const handleNext = (record: any) => {
    console.log(record)
    router.push(`/apps/client/${record.id}/detail`)
  }

  const newCols: GridColDef[] = [
    { field: 'id', headerName: 'ID', flex: 0.5 },
    {
      field: 'clientName',
      headerName: 'CLIENT NAME',
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <div
            style={{ height: '50px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}
            onClick={() => handleNext(params.row)}
          >
            <Avatar alt={params.row.firstName} src={params.row.profileImgUrl} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong>{`${params.row.firstName} ${params.row.lastName}`}</strong>
            </div>
          </div>
        )
      }
    },
    { field: 'firstName', headerName: 'FIRST NAME', flex: 1 },
    {
      field: 'middleName',
      headerName: 'MIDDLE NAME',
      flex: 0.75
    },
    {
      field: 'lastName',
      headerName: 'LAST NAME',
      flex: 0.75
    },
    {
      field: 'pmiNumber',
      headerName: 'PMI NUMBER',
      flex: 0.75
    },
    {
      field: 'insuranceCode',
      headerName: 'INSURANCE',
      flex: 0.75
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card sx={{ borderRadius: 1, boxShadow: 3, padding: 6 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <span className='text-[20px]'>
              <strong>Filters</strong>
            </span>
          </Grid>
          <Grid container spacing={6} marginTop={4}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Dropdown value={item} setValue={setItem} options={statusOptions} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Dropdown value={status} setValue={setStatus} options={statusOptions} />
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
          <Grid sx={{ p: 5 }}>
            <div className='flex flex-row justify-between'>
              <TextField
                className='w-[50%]' // Ensures the input takes up most of the width
                placeholder='Search name, phone number, PMI number'
                variant='outlined'
                size='small'
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <span className='text-gray-500 ml-2 mt-2'>
                      <i className='bx bx-search' />
                    </span>
                  )
                }}
              />
              <Button
                variant='contained'
                onClick={() => {
                  router.push('/apps/client/add-client')
                }}
              >
                Add Client
              </Button>
            </div>
          </Grid>

          <DataTable columns={newCols} data={dataWithProfileImg} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default ClientListApps

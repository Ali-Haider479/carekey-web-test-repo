'use client'
import { useState } from 'react'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import { useParams, useRouter } from 'next/navigation'
import ReactTable from '@/@core/components/mui/ReactTable'
import { CircularProgress, Icon, Typography } from '@mui/material'

type Caregiver = {
  itemNumber: number
  id: number
  caregiverName: string
  firstName: string
  middleName: string
  lastName: string
  caregiverUMPI: string
}

interface CaregiverTableProps {
  data: []
  isLoading: boolean
}

const CaregiverTable = ({ data, isLoading }: CaregiverTableProps) => {
  const [search, setSearch] = useState('')

  const router = useRouter()

  const handleNext = (id: any) => {
    router.push(`/en/apps/caregiver/${id}/detail`)
  }

  const newColumns = [
    // {
    //   field: 'itemNumber',
    //   headerName: '#',
    //   flex: 0.5,
    //   renderCell: (params: GridRenderCellParams) => <span>{params.row.index + 1}</span>
    // },
    {
      id: 'id',
      label: 'CAREGIVER ID',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(user?.id)}>
            <Typography color='primary'>{user?.id}</Typography>
          </div>
        )
      }
    },
    {
      id: 'caregiverName',
      label: 'CAREGIVER NAME',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(user?.id)}>
            <Typography
              // onClick={() => handleNext(user?.id)}
              className='text-[#67C932]'
            >{`${user?.firstName} ${user?.lastName}`}</Typography>
          </div>
        )
      }
    },
    {
      id: 'firstName',
      label: 'FIRST NAME',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(user?.id)}>
            <Typography color='primary'>{user?.firstName}</Typography>
          </div>
        )
      }
    },
    {
      id: 'lastName',
      label: 'LAST NAME',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(user?.id)}>
            <Typography color='primary'>{user?.lastName}</Typography>
          </div>
        )
      }
    },
    {
      id: 'caregiverUMPI',
      label: 'CAREGIVER UMPI',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(user?.id)}>
            <Typography color='primary'>{user?.caregiverUMPI}</Typography>
          </div>
        )
      }
    }
  ]

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
      {/* Search Bar and Add Employee Buttons */}

      <Grid container spacing={2} alignItems='center' sx={{ mb: 2, p: 10 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            placeholder='Search name, phone number, pmi number'
            variant='outlined'
            size='small'
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              endAdornment: (
                <span style={{ color: '#757575', marginLeft: '8px', marginTop: 8 }}>
                  <i className='bx-search' />
                </span>
              )
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={() => router.push('/en/apps/caregiver/add-employee')}
            variant='contained'
            sx={{ backgroundColor: '#4B0082', color: '#fff', fontWeight: 'bold' }}
          >
            Add Caregiver
          </Button>
        </Grid>
      </Grid>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        {/* <DataTable columns={newColumns} data={data} /> */}
        {isLoading ? (
          <div className='flex items-center justify-center p-10'>
            <CircularProgress />
          </div>
        ) : !data?.length ? (
          <Card>
            <div className='flex flex-col items-center justify-center p-10 gap-2'>
              <Icon className='bx-folder-open text-6xl text-textSecondary' />
              <Typography variant='h6'>No Data Available</Typography>
              <Typography variant='body2' className='text-textSecondary'>
                No records found. Click 'Add New Caegiver' to create one.
              </Typography>
              <Button
                variant='contained'
                startIcon={<i className='bx-plus' />}
                onClick={() => {
                  router.push('/en/apps/caregiver/add-employee')
                }}
                className='mt-4'
                sx={{ backgroundColor: '#4B0082' }}
              >
                Add New Caregiver
              </Button>
            </div>
          </Card>
        ) : (
          <ReactTable
            columns={newColumns}
            data={data}
            keyExtractor={user => user.id.toString()}
            enablePagination
            pageSize={5}
            stickyHeader
            maxHeight={600}
            containerStyle={{ borderRadius: 2 }}
          />
        )}
      </div>
    </Card>
  )
}

export default CaregiverTable

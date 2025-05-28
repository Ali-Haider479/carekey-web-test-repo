'use client'
import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import { useParams, useRouter } from 'next/navigation'
import ReactTable from '@/@core/components/mui/ReactTable'
import { Avatar, Chip, CircularProgress, Icon, Typography } from '@mui/material'
import api from '@/utils/api'

type Caregiver = {
  itemNumber: number
  id: number
  caregiverName: string
  firstName: string
  middleName: string
  lastName: string
  caregiverUMPI: string
  user: any
}

interface CaregiverTableProps {
  data: Caregiver[]
  isLoading: boolean
}

const CaregiverTable = ({ data, isLoading }: CaregiverTableProps) => {
  const [search, setSearch] = useState('')
  const [filteredData, setFilteredData] = useState<Caregiver[]>([])
  const [dataWithProfileImg, setDataWithProfileImg] = useState<any>()

  const router = useRouter()

  useEffect(() => {
    if (!data) {
      setFilteredData([])
      return
    }

    if (search.trim() === '') {
      setFilteredData(data)
      return
    }

    const searchLower = search.toLowerCase()
    const filtered = data.filter(
      caregiver =>
        caregiver.firstName?.toLowerCase().includes(searchLower) ||
        caregiver.lastName?.toLowerCase().includes(searchLower) ||
        `${caregiver.firstName} ${caregiver.lastName}`.toLowerCase().includes(searchLower)
    )

    setFilteredData(filtered)
  }, [search, data])

  const handleNext = (id: any) => {
    router.push(`/en/apps/caregiver/${id}/detail`)
  }

  const getProfileImage = async (key: string) => {
    try {
      console.log('Inside get profile image url with key: ', key)
      const res = await api.get(`/caregivers/getProfileUrl/${key}`)
      console.log('Photo URL response', res.data)
      return res.data
    } catch (err) {
      throw Error(`Error in fetching profile image url, ${err}`)
    }
  }

  const fetchProfileImages = async () => {
    if (data) {
      const dataWithPhotoUrls = await Promise.all(
        data?.map(async (item: any) => {
          console.log('Data photo url ====>> ', item?.user?.profileImageUrl)
          const profileImgUrl =
            item?.user?.profileImageUrl !== null
              ? await getProfileImage(item?.user?.profileImageUrl)
              : item?.user?.profileImageUrl
          return {
            ...item,
            profileImgUrl: profileImgUrl
          }
        })
      )
      setDataWithProfileImg(dataWithPhotoUrls)
      setFilteredData(dataWithPhotoUrls)
    }
  }

  useEffect(() => {
    if (data.length > 0) {
      fetchProfileImages()
    }
  }, [data])

  console.log('Data with profile image URL: ', filteredData)

  const newColumns = [
    {
      id: 'caregiverName',
      label: 'CAREGIVER NAME',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='w-full h-full cursor-pointer'>
            <div
              style={{ height: '50px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}
              onClick={() => handleNext(user?.id)}
            >
              <Avatar alt={user.firstName} src={user?.profileImgUrl} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong>{`${user.firstName} ${user.lastName}`}</strong>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 'caregiverLevel',
      label: 'LEVEL',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(user?.id)}>
            <Typography color='primary'>{user?.caregiverLevel}</Typography>
          </div>
        )
      }
    },
    {
      id: 'ssn',
      label: 'SOCIAL SECURITY',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(user?.id)}>
            <Typography color='primary'>{user?.ssn}</Typography>
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
    },
    {
      id: 'dateOfHire',
      label: 'HIRING DATE',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(user?.id)}>
            <Typography color='primary'>{user?.dateOfHire}</Typography>
          </div>
        )
      }
    },
    {
      id: 'emailAddress',
      label: 'EMAIL ADDRESS',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(user?.id)}>
            <Typography color='primary'>{user?.user?.emailAddress}</Typography>
          </div>
        )
      }
    },
    {
      id: 'isLicensed245d',
      label: 'LICENSED',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <Chip
            label={user?.isLicensed245d === true ? 'YES' : 'NO'}
            sx={{
              backgroundColor: user?.isLicensed24d === 'true' ? '#72E1281F' : '#FDB5281F',
              borderRadius: '50px',
              color: user?.isLicensed24d === 'true' ? '#71DD37' : '#FFAB00',
              '& .MuiChip-label': {
                padding: '0 10px'
              }
            }}
          />
        )
      }
    },
    {
      id: 'primaryPhoneNumber',
      label: 'PHONE NUMBER',
      minWidth: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(user?.id)}>
            <Typography color='primary'>{user?.primaryPhoneNumber}</Typography>
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
            placeholder='Search caregiver by name'
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
            data={filteredData}
            keyExtractor={user => user.id.toString()}
            enablePagination
            pageSize={25}
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

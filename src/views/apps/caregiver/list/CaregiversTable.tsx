'use client'
import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import { useParams, useRouter } from 'next/navigation'
import ReactTable from '@/@core/components/mui/ReactTable'
import { Avatar, Chip, CircularProgress, Dialog, Icon, Typography } from '@mui/material'
import api from '@/utils/api'
import { DoDisturbOn, Mail, MailOutline, PeopleOutline, Phone, Shield, VerifiedUser } from '@mui/icons-material'
import TanStackTable from '@/@core/components/mui/TanStackTable'
import { useTheme } from '@emotion/react'
import CustomAlert from '@/@core/components/mui/Alter'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

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
  totalCaregivers?: number
  isLoading: boolean
  isUserDeleted?: boolean
  setIsUserDeleted?: (value: boolean) => void
}

const CaregiverTable = ({ data, isLoading, isUserDeleted, setIsUserDeleted, totalCaregivers }: CaregiverTableProps) => {
  const [search, setSearch] = useState('')
  const [filteredData, setFilteredData] = useState<Caregiver[]>([])
  const [dataWithProfileImg, setDataWithProfileImg] = useState<any>()
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()
  const [isModalShow, setIsModalShow] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<any>()

  const handleModalClose = () => setIsModalShow(false)

  const handleModalOpen = (user: any) => {
    if (user?.accountStatus === 'Inactive') {
      setAlertOpen(true)
      setAlertProps({
        severity: 'error',
        message: 'User is already inactive.'
      })
      if (setIsUserDeleted) setIsUserDeleted(false) // Reset state if deletion not needed
      return
    } else {
      setIsModalShow(true)
      setSelectedUser(user)
    }
  }

  const theme: any = useTheme()

  const lightTheme = theme.palette.mode === 'light'
  const darkTheme = theme.palette.mode === 'dark'

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

  console.log('DATA IN CAREGIVER TABLE: ', data)

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

  const handleDelete = async (userId: any) => {
    try {
      if (setIsUserDeleted) setIsUserDeleted(true) // Set to true before deletion
      const userIdCompare = data.filter(user => user?.user?.id === selectedUser?.id)
      if (userIdCompare.length === 0) {
        console.error('User not found in the data array')
        return
      }
      if (userIdCompare[0]?.user?.accountStatus === 'Inactive') {
        setAlertOpen(true)
        setAlertProps({
          severity: 'error',
          message: 'User is already inactive.'
        })
        if (setIsUserDeleted) setIsUserDeleted(false) // Reset state if deletion not needed
        return
      }
      const userDeletePayload = {
        accountStatus: 'Inactive'
      }
      await api.patch(`/user/${selectedUser?.id}`, userDeletePayload) // Await the API call
      setAlertOpen(true)
      setAlertProps({
        severity: 'success',
        message: 'User deleted successfully.'
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      setAlertOpen(true)
      setAlertProps({
        severity: 'error',
        message: 'Failed to delete user.'
      })
    } finally {
      if (setIsUserDeleted) setIsUserDeleted(false) // Reset state after completion
    }
  }

  console.log('Data with profile image URL: ', filteredData)

  const newColumns = [
    {
      id: 'caregiverName',
      label: 'CAREGIVER',
      minSize: 200,
      size: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        const getInitials = (name: string) => {
          return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
        }
        return (
          <div className='cursor-pointer flex items-center space-x-2 min-w-0 pr-6' onClick={() => handleNext(user?.id)}>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs shadow-lg'>
                {user?.profileImgUrl ? (
                  <Avatar alt={user.firstName} src={user?.profileImgUrl} className='w-full h-full' />
                ) : (
                  getInitials(`${user.firstName} ${user.lastName}`)
                )}
              </div>
            </div>
            <div className='min-w-0 flex-1'>
              <p
                className={`text-sm font-medium ${theme.palette.mode === 'light' ? 'text-gray-900' : 'text-gray-100'} truncate`}
              >
                {(() => {
                  const nameParts = user?.firstName.trim().split(' ')
                  if (nameParts.length >= 2) {
                    const firstName = nameParts[0]
                    const lastName = nameParts.slice(1).join(' ')
                    return `${lastName}, ${firstName}`
                  }
                  return `${user?.firstName} ${user?.lastName}`
                })()}
              </p>
              <p className={`text-sm ${theme.palette.mode === 'light' ? 'text-gray-500' : 'text-gray-400'} truncate`}>
                UMPI: {user?.caregiverUMPI || 'N/A'}
              </p>
            </div>
          </div>
        )
      }
    },
    {
      id: 'caregiverLevel',
      label: 'LEVEL',
      minSize: 60,
      maxSize: 80,
      size: 60,
      editable: true,
      sortable: true,
      render: (user: any) => {
        if (!user?.caregiverLevel) {
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${theme.palette.mode === 'light' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-gray-800 text-gray-400 border-gray-600'} whitespace-nowrap`}
            >
              {user.caregiverRole === 'Qulaified Professional' ? 'QP' : 'None'}
            </span>
          )
        }

        const levelStyles: any = {
          QP: `${theme.palette.mode === 'light' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-purple-900/30 text-purple-300 border-purple-700'}`,
          L3: `${theme.palette.mode === 'light' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-indigo-900/30 text-indigo-300 border-indigo-700'}`,
          L2: `${theme.palette.mode === 'light' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-emerald-900/30 text-emerald-300 border-emerald-700'}`,
          L1: `${theme.palette.mode === 'light' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-900/30 text-amber-300 border-amber-700'}`
        }

        return (
          <div className='w-full pl-1  cursor-pointer' onClick={() => handleNext(user?.id)}>
            <Typography
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${levelStyles[user?.caregiverLevel] || levelStyles['L1']}`}
            >
              {user?.caregiverLevel}
            </Typography>
          </div>
        )
      }
    },
    {
      id: 'dateOfHire',
      label: 'HIRE DATE',
      minSize: 200,
      size: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        const formatDate = (dateString: string) => {
          if (!dateString) return 'N/A'
          const date = new Date(dateString)
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
          })
        }
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(user?.id)}>
            <Typography
              color='primary'
              className={`text-sm ${theme.palette.mode === 'light' ? 'text-gray-900' : 'text-gray-400'}`}
            >
              {formatDate(user?.dateOfHire)}
            </Typography>
          </div>
        )
      }
    },
    {
      id: 'dateOfBirth',
      label: 'DOB',
      minSize: 200,
      size: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        const formatDate = (dateString: string) => {
          if (!dateString) return 'N/A'
          const date = new Date(dateString)
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
          })
        }
        const date = new Date(user?.dateOfBirth)
        const age = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        return (
          <div className='w-full cursor-pointer' onClick={() => handleNext(user?.id)}>
            <Typography
              color='primary'
              className={`text-sm ${theme.palette.mode === 'light' ? 'text-gray-900' : 'text-gray-400'}`}
            >
              {formatDate(user?.dateOfBirth)}
            </Typography>
            <Typography className='text-sm text-gray-500 dark:text-gray-400'>{age}y</Typography>
          </div>
        )
      }
    },
    {
      id: 'emailAddress',
      label: 'CONTACT',
      minSize: 200,
      size: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='w-full cursor-pointer pr-3' onClick={() => handleNext(user?.id)}>
            <div className='space-y-1 min-w-0'>
              <div className='flex items-center text-sm min-w-0'>
                <Mail
                  className={`w-3 h-3 mr-1 ${theme.palette.mode === 'light' ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`}
                />
                <Typography
                  className={`${theme.palette.mode === 'light' ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'} truncate transition-colors min-w-0 text-sm`}
                >
                  {user?.user?.emailAddress}
                </Typography>
              </div>
              <div className='flex items-center text-sm min-w-0'>
                <Phone
                  className={`w-3 h-3 mr-1 ${theme.palette.mode === 'light' ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`}
                />
                <Typography
                  className={`${lightTheme ? 'text-gray-600 hover:text-gray-800' : 'text-gray-300 hover:text-gray-100'} transition-colors whitespace-nowrap text-sm`}
                >
                  {user?.primaryPhoneNumber}
                </Typography>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 'isLicensed245d',
      label: 'LICENSE',
      minSize: 200,
      size: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        return (
          <div className='cursor-pointer flex items-center whitespace-nowrap' onClick={() => handleNext(user?.id)}>
            {user?.isLicensed245d === true ? (
              <>
                <VerifiedUser
                  className={`w-4 h-4 ${theme.palette.mode === 'light' ? 'text-emerald-500' : 'text-emerald-400'} mr-1 flex-shrink-0`}
                />
                <span
                  className={`text-sm ${theme.palette.mode === 'light' ? 'text-emerald-700' : 'text-emerald-300'} font-medium`}
                >
                  Yes
                </span>
              </>
            ) : (
              <>
                <Shield
                  className={`w-4 h-4 ${theme.palette.mode === 'light' ? 'text-gray-500' : 'text-gray-400'} mr-1 flex-shrink-0`}
                />
                <span
                  className={`text-sm ${theme.palette.mode === 'light' ? 'text-gray-500' : 'text-gray-400'} font-medium`}
                >
                  No
                </span>
              </>
            )}
          </div>
        )
      }
    },
    {
      id: 'status',
      label: 'STATUS',
      minSize: 200,
      size: 200,
      editable: true,
      sortable: true,
      render: (user: any) => {
        const statusStyles: any = {
          Active: `${theme.palette.mode === 'light' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-emerald-900/30 text-emerald-300 border-emerald-700'}`,
          Inactive: `${theme.palette.mode === 'light' ? 'bg-gray-100 text-gray-800 border-gray-200' : 'bg-gray-800 text-gray-300 border-gray-600'}`,
          Pending: `${theme.palette.mode === 'light' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-900/30 text-amber-300 border-amber-700'}`
        }
        return (
          <div className='cursor-pointer flex items-center whitespace-nowrap' onClick={() => handleNext(user?.id)}>
            <span className='sr-only'>Status</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${statusStyles[user?.user?.accountStatus] || statusStyles['Inactive']}`}
            >
              <span
                className={`w-1.5 h-1.5 mr-1 rounded-full flex-shrink-0 ${
                  user?.user?.accountStatus === 'Active'
                    ? 'bg-emerald-400 dark:bg-emerald-300'
                    : user?.user?.accountStatus === 'Pending'
                      ? 'bg-amber-400 dark:bg-amber-300'
                      : 'bg-gray-400 dark:bg-gray-500'
                }`}
              ></span>
              {user?.user?.accountStatus}
            </span>
          </div>
        )
      }
    },
    {
      id: 'actions',
      label: '',
      minSize: 100,
      size: 100,
      editable: false,
      sortable: false,
      render: (user: any) => {
        return (
          <div className='flex items-center justify-normal space-x-3'>
            <MailOutline
              // onClick={() => handleNext(user?.id)}
              className={`cursor-pointer w-5 h-5 ${theme.palette.mode === 'light' ? 'text-gray-400 hover:text-indigo-600' : 'text-gray-500 hover:text-indigo-400'}`}
            />
            <DoDisturbOn
              onClick={() => handleModalOpen(user?.user)}
              className={`cursor-pointer w-5 h-5 ${theme.palette.mode === 'light' ? 'text-gray-400 hover:text-red-500' : 'text-gray-500 hover:text-red-400'}`}
            />
          </div>
        )
      }
    }
  ]

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
      {/* Search Bar and Add Employee Buttons */}
      <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />

      <Grid container spacing={2} sx={{ mb: 2, pt: 0, pb: 2, px: 5, display: 'flex', justifyContent: 'flex-end' }}>
        <Grid size={{ xs: 12, sm: 6, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
          <span
            className={`inline-flex border-[1px] items-center px-3 py-1 rounded-full text-sm font-medium ${theme.palette.mode === 'light' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-900/30 text-indigo-300 border-indigo-700'}`}
          >
            <PeopleOutline className='w-4 h-4 mr-1' />
            {totalCaregivers} {totalCaregivers === 1 ? 'Caregiver' : 'Caregivers'}
          </span>
          <Button
            onClick={() => router.push('/en/apps/caregiver/add-employee')}
            variant='contained'
            sx={{ color: '#fff', fontWeight: 'bold' }}
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
                className={`mt-4`}
              >
                Add New Caregiver
              </Button>
            </div>
          </Card>
        ) : (
          <TanStackTable
            columns={newColumns}
            data={filteredData}
            keyExtractor={user => user.id.toString()}
            enablePagination
            pageSize={25}
            stickyHeader
            maxHeight={600}
            containerStyle={{ borderRadius: 2 }}
            caregiverTable
          />
        )}
      </div>
      <Dialog
        open={isModalShow}
        onClose={handleModalClose}
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        maxWidth='md'
      >
        <DialogCloseButton onClick={handleModalClose} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <div className='flex items-center justify-center w-full px-5 flex-col'>
          <form onSubmit={handleDelete}>
            <div>
              <h2 className='text-xl font-semibold mt-5 mb-4'>Set User to Inactive</h2>
            </div>
            <div>
              <Typography className='mb-7'>Are you sure you want to set this user's status to Inactive?</Typography>
            </div>
            <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
              <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                NO
              </Button>
              <Button type='submit' variant='contained'>
                YES
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </Card>
  )
}

export default CaregiverTable

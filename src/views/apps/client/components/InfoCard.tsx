'use client'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import ControlledTextArea from '@/@core/components/custom-inputs/ControlledTextArea'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import ProfileAvatar from '@/@core/components/mui/ProfileAvatar'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import api from '@/utils/api'
import { Add, Remove } from '@mui/icons-material'
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
  Grid2 as Grid,
  CircularProgress
} from '@mui/material'
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

type FormItems = {
  caregiverId?: number
  assignmentDate: Date
  unassignmentDate: Date
  assignmentNotes: string
  scheduleHours: number
}

interface InfoCardProps {
  clientData?: any
}

const InfoCard = (clientData: InfoCardProps) => {
  const [assignedCaregiver, setAssignedCaregiver] = useState<any>()
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [caregiversList, setCaregiversList] = useState<any>()
  const [isModalShow, setIsModalShow] = useState(false)
  const [selectedCaregiverInfo, setSelectedCaregiverInfo] = useState<any>()
  const [assignButtonLoading, setAssignButtonLoading] = useState(false)
  const { id } = useParams()
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  const handleModalClose = () => {
    setIsModalShow(false)
    reset()
  }

  const methods = useForm<FormItems>({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = methods

  const assignmentDate = watch('assignmentDate')
  const selectedCaregiver = watch('caregiverId')

  console.log('Selected Caregiver Id', selectedCaregiver)

  const fetchAssignCaregivers = async () => {
    try {
      const clientResponse = await api.get(`/client/assigned-caregivers/${id}`)
      const fetchedClient = clientResponse.data

      // Fetch profile images directly inside
      const caregiversWithPhotos = await Promise.all(
        fetchedClient.map(async (item: any) => {
          const profileImageUrl =
            item?.user?.profileImageUrl !== null
              ? await getProfileImage(item?.user?.profileImageUrl)
              : item?.user?.profileImageUrl
          return { ...item, profileImageUrl }
        })
      )

      setAssignedCaregiver(caregiversWithPhotos)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  const fetchCaregivers = async () => {
    try {
      const caregiversResponse = await api.get('/caregivers')
      setCaregiversList(caregiversResponse.data)
    } catch (error) {
      console.error('Error fetching caregivers: ', error)
    }
  }

  const fetchSelectedCaregiverData = async () => {
    try {
      const caregiverRes = await api.get(`/caregivers/user/${selectedCaregiver}`)
      setSelectedCaregiverInfo(caregiverRes.data)
    } catch (error) {
      console.error('Error Fetching Selected Caregiver Data: ', error)
    }
  }

  console.log("Selected Caregiver's Info ---->> ", selectedCaregiverInfo)

  useEffect(() => {
    fetchCaregivers()
  }, [])

  useEffect(() => {
    if (selectedCaregiver !== undefined || null) {
      fetchSelectedCaregiverData()
    }
  }, [selectedCaregiver])

  const onSubmit = async (data: FormItems) => {
    setAssignButtonLoading(true)
    console.log('Form Data:', data, id)
    // await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API request
    // reset() // Reset form after submission
    const assignedCaregiver = caregiversList.find((caregiver: any) => caregiver.user.id === data.caregiverId)
    console.log('assignedCaregiver Data:', assignedCaregiver, caregiversList)

    const assignClientBody = {
      userId: selectedCaregiver,
      tenantId: authUser?.tenant?.id,
      clientId: id,
      assignmentDate: data.assignmentDate,
      unassignmentDate: data.unassignmentDate,
      notes: data.assignmentNotes,
      scheduleHours: data.scheduleHours
    }

    const accountHistoryPayLoad = {
      actionType: 'ClientAssignedToCaregiver',
      details: `Client (ID: ${id}) assigned to Caregiver (ID: ${selectedCaregiver}) by User (ID: ${authUser?.id})`,
      userId: authUser?.id,
      caregiverId: selectedCaregiverInfo?.id
    }

    const title = 'New Client Assigned'
    const body = `You have been assigned to ${clientData?.clientData?.firstName} ${clientData?.clientData?.lastName} starting ${new Date(
      data.assignmentDate
    ).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} for ${data.scheduleHours
      } hours. Check your details.`

    await api.post(`/user/createClientUser`, assignClientBody)
    await api.post(`/account-history/log`, accountHistoryPayLoad)
    await api.post(`/notification/send/${selectedCaregiver}`, { title, body })

    reset()
    fetchAssignCaregivers()
    handleModalClose()
    setAssignButtonLoading(false)
  }

  useEffect(() => {
    fetchAssignCaregivers()
  }, [])

  const getProfileImage = async (key: string) => {
    try {
      const res = await api.get(`/client/getProfileUrl/${key}`)
      return res.data
    } catch (err) {
      console.error(`Error fetching profile image: ${err}`)
      return '/default-avatar.png' // Fallback image
    }
  }

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false)
    setSelectedUserId(null)
  }

  console.log('Caregivers List ---->> ', caregiversList)

  const handleDeleteConfirm = async () => {
    if (selectedUserId) {
      try {
        await api.post(`/user/unassign-clientUsers/${selectedUserId}`)
      } catch (error) {
        console.error('Error unassign user:', error)
      }
    }
    fetchAssignCaregivers()
    setOpenDeleteDialog(false)
    setSelectedUserId(null)
  }
  return (
    <>
      <Card className='max-w-md mr-4 shadow-md rounded-lg'>
        {/* Insurance and Diagnostic Code */}
        <CardContent className='mb-4'>
          <div className='flex justify-between text-sm text-gray-400 mb-2'>
            <Typography>Insurance:</Typography>
            <Typography className='text-gray-400'>MA</Typography>
          </div>
          <div className='flex justify-between text-sm text-gray-400 mb-2'>
            <Typography>Diagnostic code:</Typography>
            <Typography className='text-gray-400'>F84.0</Typography>
          </div>
        </CardContent>

        {/* Eligibility Test */}
        <CardContent>
          <h3 className='text-xl font-semibold text-gray-500 mb-2'>Eligibility Test</h3>
          <div className='flex justify-between text-sm text-gray-400 mb-2'>
            <Typography>Eligibility:</Typography>
            <Typography className='text-gray-400'>MA</Typography>
          </div>
          <div className='flex justify-between text-sm text-gray-400 mb-2'>
            <Typography>Eligibility 2:</Typography>
            <Typography className='text-gray-400'>QM</Typography>
          </div>
          <div className='flex justify-between text-sm text-gray-400 mb-2'>
            <Typography>Payor:</Typography>
            <Typography className='text-gray-400'>MA</Typography>
          </div>
          <div className='flex justify-between text-sm text-gray-400 mb-2'>
            <Typography>MA Code:</Typography>
            <Typography className='text-gray-400'>MA87</Typography>
          </div>
          <div className='flex justify-between text-sm text-gray-400 mb-2'>
            <Typography>PMap:</Typography>
            <Typography className='text-gray-400'>MEDICA</Typography>
          </div>
          <div className='flex justify-between text-sm text-gray-400 mb-2'>
            <Typography>Waiver:</Typography>
            <Typography className='text-gray-400'>DDWaiver</Typography>
          </div>
          <div className='flex justify-between text-sm text-gray mb-2'>
            <Typography>Updated On:</Typography>
            <Typography className='text-gray-400'>April 24, 2024</Typography>
          </div>
        </CardContent>

        {/* Assigned Caregivers */}
        <CardContent className='pl-0'>
          <div className='flex flex-row items-center justify-between'>
            <h3 className='ml-6 text-xl font-semibold text-gray-500 mb-2'>
              Assigned Caregivers ({assignedCaregiver?.length})
            </h3>
            <IconButton
              className='h-6 w-6 bg-[#4B0082]'
              onClick={() => {
                setIsModalShow(true)
              }}
              disabled={assignedCaregiver?.length > 0}
            >
              <Add className='text-white' />
            </IconButton>
          </div>
          <ul>
            {assignedCaregiver?.map((item: any, index: number) => (
              <li key={index} className='flex justify-between mb-4 last:mb-0'>
                <div className='flex items-center space-x-3'>
                  <Avatar
                    alt={item?.user?.userName}
                    src={item?.profileImageUrl || item?.user?.userName}
                    className='w-10 h-10'
                  />
                  <div>
                    <Typography className='text-sm font-medium text-gray-400'>{item?.user?.userName}</Typography>
                    <Typography className='text-sm text-[#71DD37]'>{item?.user?.emailAddress}</Typography>
                  </div>
                </div>
                <IconButton
                  className='h-6 w-6 bg-[#4B0082]'
                  onClick={() => {
                    setOpenDeleteDialog(true)
                    setSelectedUserId(item?.id)
                  }}
                >
                  <Remove className='text-white' />
                </IconButton>
                {/* < className="text- bg-[#666CFF]"> #4B0082*/}
                {/* <img
                  className='bg-[#666CFF] bg-opacity-20 h-8 border-4 border-transparent rounded-full mt-1'
                  src='/assets/svg-icons/openLink.svg'
                  alt=''
                /> */}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>Confirm Unassign</DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            Are you sure you want to unassign this caregiver?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color='error' autoFocus>
            Unassign
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isModalShow}
        onClose={handleModalClose}
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={handleModalClose} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <div className='flex items-center justify-center pt-[10px] pb-[5px] w-full px-5'>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
              <div>
                <h2 className='text-xl font-semibold mt-5 mb-6'>Assign Client</h2>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <CustomDropDown
                      label='Select caregiver'
                      optionList={
                        caregiversList?.map((item: any) => {
                          return {
                            key: `${item?.id}-${item.firstName}`,
                            value: item.user.id,
                            optionString: `${item.firstName} ${item.lastName}`
                          }
                        }) || []
                      }
                      name={'caregiverId'}
                      control={control}
                      error={errors.caregiverId}
                      defaultValue={''}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <ControlledDatePicker
                      name={'assignmentDate'}
                      control={control}
                      error={errors.assignmentDate}
                      label={'Assignment Date'}
                      defaultValue={undefined}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <ControlledDatePicker
                      name={'unassignmentDate'}
                      control={control}
                      error={errors.unassignmentDate}
                      label={'Unassignment Date'}
                      defaultValue={undefined}
                      isRequired={false}
                      minDate={new Date()}
                      rules={{
                        // required: 'Un Assignment Date is required',
                        validate: (value: any) => {
                          if (!value) {
                            return true
                          }
                          return new Date(value) >= new Date(assignmentDate)
                            ? true
                            : 'unassignment date must be greater than assignment date'
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <CustomTextField
                      label={'Scheduled Hours'}
                      placeHolder={'Scheduled Hours'}
                      name={'scheduleHours'}
                      defaultValue={''}
                      type={'number'}
                      error={errors.scheduleHours}
                      control={control}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={4} sx={{ marginTop: 4 }}>
                  <ControlledTextArea
                    name={'assignmentNotes'}
                    control={control}
                    label={'Assignment Notes'}
                    placeHolder={'Assignment Notes'}
                    defaultValue={''}
                  />
                </Grid>
              </div>
              <div className='flex gap-4 justify-end mt-4 mb-4'>
                <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                  CANCEL
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  startIcon={assignButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
                  disabled={assignButtonLoading}
                  className='bg-[#4B0082]'
                >
                  Assign Client
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </Dialog>
    </>
  )
}

export default InfoCard

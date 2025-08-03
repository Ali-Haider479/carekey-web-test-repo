'use client'
import React, { useEffect, useState } from 'react'
import {
  Avatar,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  List,
  ListItem,
  Typography,
  TextField,
  Box
} from '@mui/material'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { Add, Remove, Visibility } from '@mui/icons-material'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import ControlledTextArea from '@/@core/components/custom-inputs/ControlledTextArea'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import { FormProvider, useForm } from 'react-hook-form'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import api from '@/utils/api'
import { useTheme } from '@emotion/react'

type FormItems = {
  clientId?: number
  assignmentDate: Date
  unassignmentDate: Date
  assignmentNotes: string
  scheduleHours: number
}

const InfoCard = () => {
  const { id } = useParams()
  const [data, setData] = useState<any>()
  const [assignedClients, setAssignedClients] = useState<any>()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [clientList, setClientList] = useState<any>()
  const [isModalShow, setIsModalShow] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [assignButtonLoading, setAssignButtonLoading] = useState(false)
  const [openAssignedClientViewModal, setOpenAssignedClientViewModal] = useState(false)
  const [selectedClientData, setSelectedClientData] = useState<any>(null)

  const theme: any = useTheme()
  const lightTheme = theme.palette.mode === 'light'

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const [formData, setFormData] = useState<FormItems>()
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

  const getProfileImage = async (key: string | null) => {
    if (!key) return
    try {
      const res = await api.get(`/client/getProfileUrl/${key}`)
      return res.data
    } catch (err) {
      console.error(`Error fetching profile image: ${err}`)
      return
    }
  }

  console.log('assigned clients --> ', currentUser)

  const fetchData = async () => {
    try {
      const response = await api.get(`/caregivers/user/${id}`)
      const fetchedData = response.data
      const caregivers = await api.get(`/caregivers/caregiver/${id}`)
      console.log('CAREGIVER USER ', caregivers)
      setCurrentUser(caregivers?.data?.user)
      console.log('Caregiver Profile Data ----> ', fetchedData)
      setData(caregivers)
    } catch (error) {
      console.error('Error fetching data', error)
    }
  }

  const fetchAssignClient = async () => {
    try {
      const { data: fetchedClient } = await api.get(`/user/clientUsers/${currentUser?.id}`)
      const fetchedClientsWithPhotos = await Promise.all(
        fetchedClient.map(async (item: any) => {
          const profileImgUrl = item?.client?.profileImgUrl
            ? await getProfileImage(item?.client?.profileImgUrl)
            : item?.client?.profileImgUrl
          return { ...item, client: { ...item.client, profileImgUrl } }
        })
      )
      setAssignedClients(fetchedClientsWithPhotos)
    } catch (error) {
      console.error('Error fetching assigned clients: ', error)
    }
  }

  const fetchClients = async () => {
    try {
      const { data: fetchedClients } = await api.get(`/client`)

      // Get array of assigned client IDs
      const assignedClientIds = assignedClients?.map((assigned: any) => assigned.client.id) || []

      // Filter out clients that are already assigned
      const availableClients = fetchedClients.filter((client: any) => !assignedClientIds.includes(client.id))

      console.log('List of available clients --> ', availableClients)
      setClientList(availableClients)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  console.log('available client list', clientList)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await fetchData()
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchAllData()
  }, [id])

  useEffect(() => {
    if (currentUser?.id) {
      fetchAssignClient()
    }
  }, [currentUser])

  useEffect(() => {
    fetchClients()
  }, [assignedClients])

  const onSubmit = async (data: FormItems) => {
    setAssignButtonLoading(true)
    console.log('Form Data:', data, id)
    // await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API request
    // reset() // Reset form after submission
    const assignedClient = clientList.find((client: any) => client.id === data.clientId)
    console.log('assignedClient Data:', assignedClient, clientList)

    const assignClientBody = {
      userId: currentUser?.id,
      tenantId: authUser?.tenant?.id,
      clientId: data.clientId,
      assignmentDate: data.assignmentDate,
      unassignmentDate: data.unassignmentDate,
      notes: data.assignmentNotes,
      scheduleHours: data.scheduleHours
    }

    const accountHistoryPayLoad = {
      actionType: 'ClientAssignedToCaregiver',
      details: `Client (ID: ${data?.clientId}) assigned to Caregiver (ID: ${id}) by User (ID: ${authUser?.id})`,
      userId: authUser?.id,
      caregiverId: id
    }

    const title = 'New Client Assigned'
    const body = `You have been assigned to ${assignedClient.firstName} ${assignedClient.lastName} starting ${new Date(
      data.assignmentDate
    ).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} for ${
      data.scheduleHours
    } hours. ${data.assignmentNotes !== '' && `Assignment Notes: ${data.assignmentNotes}.`}`

    await api.post(`/user/createClientUser`, assignClientBody)
    await api.post(`/account-history/log`, accountHistoryPayLoad)
    await api.post(`/notification/send/${currentUser?.id}`, { title, body })

    fetchAssignClient()
    reset()
    handleModalClose()
    setAssignButtonLoading(false)
  }

  const handleModalClose = () => {
    setIsModalShow(false)
    setValue('assignmentDate', new Date())
    setValue('unassignmentDate', new Date())
    reset()
  }

  console.log('Caregiver info card, profile data', data)
  const handleDeleteConfirm = async () => {
    if (selectedUserId) {
      try {
        await api.post(`/user/unassign-clientUsers/${selectedUserId}`)
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    }
    fetchAssignClient()
    setOpenDeleteDialog(false)
    setSelectedUserId(null)
  }

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false)
    setSelectedUserId(null)
  }

  const handleCancelViewAssignedClients = () => {
    setOpenAssignedClientViewModal(false)
    setSelectedClientData(null)
  }

  console.log('Data from caregiver info card', data?.data)

  return (
    <>
      <FormProvider {...methods}>
        <Card className='max-w-md ml-0 mr-4 shadow-md rounded-lg p-6'>
          <div className='mb-4'>
            <div className='flex justify-between text-sm text-gray-400 mb-2'>
              <Typography>Role:</Typography>
              <Typography className='text-gray-400'>
                {data?.data?.caregiverRole ? data?.data?.caregiverRole : '---'}
              </Typography>
            </div>
            <div className='flex justify-between text-sm text-gray-400 mb-2'>
              <Typography>Caregiver ID:</Typography>
              <Typography className='text-gray-400'>{id}</Typography>
            </div>
          </div>

          {/* Assigned Caregivers */}
          <div className='border-t pt-4'>
            <div className='flex flex-row items-center justify-between'>
              <Typography variant='h3' className='mt-1 text-xl font-semibold mb-2'>
                Assigned Clients ({assignedClients?.length})
              </Typography>
              <IconButton
                className={`h-6 w-6`}
                sx={{
                  backgroundColor: lightTheme ? theme.palette.primary.main : theme.palette.primary.dark
                }}
                onClick={() => {
                  setIsModalShow(true)
                }}
              >
                <Add className='text-white' />
              </IconButton>
            </div>

            <List className='max-h-60 overflow-y-auto'>
              {assignedClients?.map((data: any, index: number) => (
                <ListItem key={index} className='flex items-center justify-between last:mb-0 cursor-pointer px-0'>
                  <div className='flex items-center space-x-3'>
                    <Avatar
                      alt={`${data?.client?.firstName} ${data?.client?.lastName}`}
                      src={data?.client?.profileImgUrl || data?.client?.firstName}
                      className='w-10 h-10'
                    />
                    <div>
                      <Typography className='text-sm font-medium text-gray-400'>{`${data.client.firstName} ${data.client.lastName}`}</Typography>
                      <Typography className='text-sm text-green-600'>
                        {data.client.service ? data.client.service : ''}
                      </Typography>
                    </div>
                  </div>
                  <Box sx={{ display: 'flex', gap: 4 }}>
                    <IconButton
                      onClick={() => {
                        setSelectedClientData(data)
                        setOpenAssignedClientViewModal(true)
                      }}
                      className='h-6 w-6'
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      className={`h-6 w-6`}
                      sx={{
                        backgroundColor: lightTheme ? theme.palette.primary.main : theme.palette.primary.dark
                      }}
                      onClick={() => {
                        setOpenDeleteDialog(true)
                        setSelectedUserId(data?.id)
                      }}
                    >
                      <Remove className='text-white' />
                    </IconButton>
                  </Box>
                  {/* <img
                  className='bg-[#666CFF] bg-opacity-20 h-7 border-4 border-transparent rounded-full mt-1'
                  src='/assets/svg-icons/openLink.svg'
                  alt=''
                /> */}
                </ListItem>
              ))}
            </List>
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
                <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
                  <div>
                    <h2 className='text-xl font-semibold mt-10 mb-6'>Assign Client</h2>
                    <Grid container spacing={4}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <CustomDropDown
                          label='Select a client'
                          optionList={
                            clientList?.map((item: any) => {
                              return {
                                key: `${item?.id}-${item.firstName}`,
                                value: item.id,
                                optionString: `${item.firstName} ${item.lastName}`
                              }
                            }) || []
                          }
                          name={'clientId'}
                          control={control}
                          error={errors.clientId}
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
                      startIcon={assignButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
                      disabled={assignButtonLoading}
                      variant='contained'
                    >
                      Assign Client
                    </Button>
                  </div>
                </form>
              </div>
            </Dialog>
          </div>
        </Card>
      </FormProvider>
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>Confirm Unassign</DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            Are you sure you want to unassign this client?
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
        open={openAssignedClientViewModal}
        onClose={handleCancelViewAssignedClients}
        aria-labelledby='view-dialog-title'
        aria-describedby='view-dialog-description'
        sx={{ '& .MuiDialog-paper': { width: '100%', overflow: 'hidden', maxWidth: '500px' } }}
      >
        <DialogTitle>Assigned Client Detail</DialogTitle>
        <DialogCloseButton onClick={handleCancelViewAssignedClients} disableRipple sx={{ right: '8px', top: '8px' }}>
          <i className='bx-x' />
        </DialogCloseButton>
        <DialogContent sx={{ pt: '4px' }}>
          <div className='flex items-center space-x-3 mb-4'>
            <Avatar
              alt={`${selectedClientData?.client?.firstName} ${selectedClientData?.client?.lastName}`}
              src={selectedClientData?.client?.profileImgUrl || selectedClientData?.client?.firstName}
              className='w-10 h-10'
            />
            <div>
              <Typography className='text-sm font-medium'>
                {`${selectedClientData?.client?.firstName} ${selectedClientData?.client?.lastName}`}
              </Typography>
              <Typography className='text-sm text-green-600'>
                {selectedClientData?.client?.emailId ? selectedClientData.client.emailId : ''}
              </Typography>
            </div>
          </div>
          <div className='mb-2'>
            <Typography variant='body2'>
              Assignment Date: {new Date(selectedClientData?.assignmentDate).toLocaleDateString()}
            </Typography>
          </div>
          <div className='mb-2'>
            <Typography variant='body2'>
              Unassignment Date:{' '}
              {selectedClientData?.unassignmentDate
                ? new Date(selectedClientData.unassignmentDate).toLocaleDateString()
                : 'Not Assigned'}
            </Typography>
          </div>
          <div className='mb-2'>
            <Typography variant='body2'>Scheduled Hours: {selectedClientData?.scheduleHours || 'N/A'}</Typography>
          </div>
          <div className='mb-2'>
            <Typography variant='body2' className='mb-1'>
              Notes:
            </Typography>
            <TextField fullWidth multiline minRows={3} disabled size='small' value={selectedClientData?.notes || ''} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default InfoCard

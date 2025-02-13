'use client'
import React, { useEffect, useState } from 'react'
import { Avatar, Button, Card, Dialog, Grid2 as Grid, IconButton, Typography } from '@mui/material'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { Add } from '@mui/icons-material'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import ControlledTextArea from '@/@core/components/custom-inputs/ControlledTextArea'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import { useForm } from 'react-hook-form'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

type FormItems = {
  clientId?: number
  assignmentDate: Date
  unassignmentDate: Date
  assignmentNotes: string
  scheduleHours: number
}

const InfoCard = () => {
  const clients = [
    {
      name: 'Shamso Abshir',
      service: 'IHS (with training',
      image: '/images/avatars/17.png'
    },
    { name: 'Alia Khan', service: 'IHS (with training', image: '/images/avatars/13.png' },
    {
      name: 'Alonso James',
      service: 'EMPL Development',
      image: '/images/avatars/16.png'
    },
    {
      name: 'Alisha Lehman',
      service: 'IHS (with training',
      image: '/images/avatars/8.png'
    }
  ]
  const { id } = useParams()
  const [data, setData] = useState<any>()
  const [assignedClients, setAssignedClients] = useState<any>()
  const [clientList, setClientList] = useState<any>()
  const [isModalShow, setIsModalShow] = useState(false)
  const [formData, setFormData] = useState<FormItems>()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormItems>()

  const getProfileImage = async (key: string | null) => {
    if (!key) return
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client/getProfileUrl/${key}`)
      return res.data
    } catch (err) {
      console.error(`Error fetching profile image: ${err}`)
      return
    }
  }

  const fetchAssignClient = async () => {
    try {
      const { data: fetchedClient } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/clientUsers/${id}`)
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

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregivers/user/${id}`)
      const fetchedData = response.data
      console.log('Caregiver Profile Data ----> ', fetchedData)
      setData(fetchedData)
    } catch (error) {
      console.error('Error fetching data', error)
    }
  }

  const fetchClients = async () => {
    const fetchedClients = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client`)
    console.log('List of all clients --> ', fetchedClients)
    setClientList(fetchedClients)
  }

  useEffect(() => {
    fetchData()
    fetchAssignClient()
    fetchClients()
  }, [id])

  const onSubmit = async (data: FormItems) => {
    console.log('Form Data:', data)
    // await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API request
    // reset() // Reset form after submission
    const assignClientBody = {
      userId: id,
      tenantId: 1,
      clientId: data.clientId,
      assignmentDate: data.assignmentDate,
      unassignmentDate: data.unassignmentDate,
      notes: data.assignmentNotes,
      scheduleHours: data.scheduleHours
    }
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/createClientUser`, assignClientBody)
    console.log('Assigning Client --> ', response)
    fetchAssignClient()
    handleModalClose()
  }

  const handleModalClose = () => {
    setIsModalShow(false)
  }

  return (
    <Card className='max-w-md ml-0 mr-4 shadow-md rounded-lg p-6'>
      <div className='mb-4'>
        <div className='flex justify-between text-sm text-gray-400 mb-2'>
          <Typography>Role:</Typography>
          <Typography className='text-gray-400'>{data?.caregiverLevel ? data?.caregiverLevel : '---'}</Typography>
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
            className='h-6 w-6 bg-[#4B0082]'
            onClick={() => {
              setIsModalShow(true)
            }}
          >
            <Add className='text-white' />
          </IconButton>
        </div>

        <ul className=''>
          {assignedClients?.map((data: any, index: number) => (
            <li key={index} className='flex items-center justify-between mb-4 last:mb-0'>
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
              <img
                className='bg-[#666CFF] bg-opacity-20 h-7 border-4 border-transparent rounded-full mt-1'
                src='/assets/svg-icons/openLink.svg'
                alt=''
              />
            </li>
          ))}
        </ul>
        <Dialog
          open={isModalShow}
          onClose={handleModalClose}
          closeAfterTransition={false}
          sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
          <DialogCloseButton onClick={() => setIsModalShow(false)} disableRipple>
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
                        clientList?.data?.map((item: any) => {
                          return {
                            key: `${item.id}-${item.firstName}`,
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
                <Button type='submit' variant='contained' className='bg-[#4B0082]'>
                  Assign Client
                </Button>
              </div>
            </form>
          </div>
        </Dialog>
      </div>
    </Card>
  )
}

export default InfoCard

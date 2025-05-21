'use client'
import ProfileAvatar from '@/@core/components/mui/ProfileAvatar'
import api from '@/utils/api'
import { Remove } from '@mui/icons-material'
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
  Typography
} from '@mui/material'
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const InfoCard = () => {
  const [assignedCaregiver, setAssignedCaregiver] = useState<any>()
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const { id } = useParams()

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
          <h3 className='ml-6 text-xl font-semibold text-gray-500 mb-2'>
            Assigned Caregivers ({assignedCaregiver?.length})
          </h3>
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
    </>
  )
}

export default InfoCard

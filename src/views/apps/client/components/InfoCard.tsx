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
import UnassignModalCG_QP from './UnassignCG_QPModal'
import AssignCG_QPModal from './AssignCG_QPModal'

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
  const [assignedQPs, setAssignedQPs] = useState<any>()
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openUnAssignQPDialog, setOpenUnAssignQPDialog] = useState<boolean>(false)
  const [caregiversList, setCaregiversList] = useState<any>()
  const [qpList, setQPList] = useState<any>()

  const [showCGAssignModal, setShowCGAssignModal] = useState(false)
  const [showQPAssignModal, setShowQPAssignModal] = useState(false)

  const { id } = useParams()

  useEffect(() => {
    fetchCaregivers()
    fetchAssignCaregivers()
    fetchAssignQps()
    fetchQPs()
  }, [])

  const handleModalClose = () => {
    setShowCGAssignModal(false)
  }

  const handleQPAssignmentModalClose = () => {
    setShowQPAssignModal(false)
  }

  const fetchAssignCaregivers = async () => {
    try {
      const assignedCaregiverRes = await api.get(`/client/assigned-caregivers/${id}`)
      const fetchedClient = assignedCaregiverRes.data

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

  const fetchAssignQps = async () => {
    try {
      const assignedQPsRes = await api.get(`/client/assigned-qps/${id}`)
      const fetchedClient = assignedQPsRes.data

      // Fetch profile images directly inside
      const QpsWithPhotos = await Promise.all(
        fetchedClient.map(async (item: any) => {
          const profileImageUrl =
            item?.user?.profileImageUrl !== null
              ? await getProfileImage(item?.user?.profileImageUrl)
              : item?.user?.profileImageUrl
          return { ...item, profileImageUrl }
        })
      )

      setAssignedQPs(QpsWithPhotos)
    } catch (error) {
      console.error('Error fetching data: ', error)
    }
  }

  const fetchCaregivers = async () => {
    try {
      const caregiversResponse = await api.get('/caregivers/active')
      setCaregiversList(caregiversResponse.data.filter((caregiver: any) => caregiver.caregiverRole === "Caregiver"))
    } catch (error) {
      console.error('Error fetching caregivers: ', error)
    }
  }

  const fetchQPs = async () => {
    try {
      const QPsResponse = await api.get('/caregivers/qp')
      console.log('QPs Response', QPsResponse)
      setQPList(QPsResponse.data)
    } catch (error) {
      console.error('Error fetching QPs: ', error)
    }
  }

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

  const cancelQPUnAssignment = () => {
    setOpenUnAssignQPDialog(false)
    setSelectedUserId(null)
  }

  console.log('Caregivers List ---->> ', caregiversList)

  const handleDeleteConfirm = async (mode: string) => {
    if (selectedUserId) {
      try {
        await api.post(`/user/unassign-clientUsers/${selectedUserId}`)
      } catch (error) {
        console.error('Error unassign user:', error)
      }
    }
    if (mode === 'CG') {
      fetchAssignCaregivers()
      setOpenDeleteDialog(false)
    } else if (mode === 'QP') {
      fetchAssignQps()
      setOpenUnAssignQPDialog(false)
    }
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
          {/* Caregiver Assignment */}
          <>
            <div className='flex flex-row items-center justify-between'>
              <h3 className='ml-6 text-xl font-semibold text-gray-500 mb-2'>
                Assigned Caregivers ({assignedCaregiver?.length})
              </h3>
              <IconButton
                className='h-6 w-6 bg-[#4B0082]'
                onClick={() => {
                  setShowCGAssignModal(true)
                }}
              // disabled={assignedCaregiver?.length > 0}
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
                      <Typography className='text-sm font-medium text-gray-400'>{item?.user?.caregiver.firstName} {item?.user?.caregiver.lastName}</Typography>
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
          </>
          {/* QP Assignment */}
          <>
            <div className='flex flex-row items-center justify-between'>
              <h3 className='ml-6 text-xl font-semibold text-gray-500 mb-2'>Assigned QPs ({assignedQPs?.length})</h3>
              <IconButton
                className='h-6 w-6 bg-[#4B0082]'
                onClick={() => {
                  setShowQPAssignModal(true)
                }}
                disabled={assignedQPs?.length > 0}
              >
                <Add className='text-white' />
              </IconButton>
            </div>
            <ul>
              {assignedQPs?.map((item: any, index: number) => (
                <li key={index} className='flex justify-between mb-4 last:mb-0'>
                  <div className='flex items-center space-x-3'>
                    <Avatar
                      alt={item?.user?.userName}
                      src={item?.profileImageUrl || item?.user?.userName}
                      className='w-10 h-10'
                    />
                    <div>
                      <Typography className='text-sm font-medium text-gray-400'>{item?.user?.caregiver.firstName} {item?.user?.caregiver.lastName}</Typography>
                      <Typography className='text-sm text-[#71DD37]'>{item?.user?.emailAddress}</Typography>
                    </div>
                  </div>
                  <IconButton
                    className='h-6 w-6 bg-[#4B0082]' //
                    onClick={() => {
                      setOpenUnAssignQPDialog(true)
                      setSelectedUserId(item?.id)
                    }}
                  >
                    <Remove className='text-white' />
                  </IconButton>
                </li>
              ))}
            </ul>
          </>
        </CardContent>
      </Card>
      <UnassignModalCG_QP
        openModal={openDeleteDialog}
        handleCancel={handleDeleteCancel}
        handleSubmit={() => {
          handleDeleteConfirm('CG')
        }}
        mode={'CG'}
      />
      <AssignCG_QPModal
        showModal={showCGAssignModal}
        handleCloseModal={handleModalClose}
        dropDownList={caregiversList}
        dialogMode={'CG'}
        clientId={id}
        clientData={clientData}
        fetchAssigned={fetchAssignCaregivers}
      />
      <UnassignModalCG_QP
        openModal={openUnAssignQPDialog}
        handleCancel={cancelQPUnAssignment}
        handleSubmit={() => {
          handleDeleteConfirm('QP')
        }}
        mode={'QP'}
      />
      <AssignCG_QPModal
        showModal={showQPAssignModal}
        handleCloseModal={handleQPAssignmentModalClose}
        dropDownList={qpList}
        dialogMode={'QP'}
        clientId={id}
        clientData={clientData}
        fetchAssigned={fetchAssignQps}
      />
    </>
  )
}

export default InfoCard

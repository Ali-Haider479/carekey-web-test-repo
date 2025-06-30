import ControlledDatePicker from '@/@core/components/custom-inputs/ControledDatePicker'
import ControlledTextArea from '@/@core/components/custom-inputs/ControlledTextArea'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import CustomTextField from '@/@core/components/custom-inputs/CustomTextField'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import api from '@/utils/api'
import { Dialog, Grid2 as Grid, Button, CircularProgress } from '@mui/material'
import React, { useState, useEffect, Dispatch } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

interface FormItems {
  caregiverId?: number
  assignmentDate: Date | null
  unassignmentDate: Date | null
  assignmentNotes: string
  scheduleHours: number
}

interface AssignCG_QPModalProps {
  showModal: boolean
  handleCloseModal: () => void
  dropDownList: any[]
  dialogMode: 'QP' | 'CG'
  clientId: any
  clientData: any
  fetchAssigned: () => void
}

const AssignCG_QPModal: React.FC<AssignCG_QPModalProps> = ({
  showModal,
  handleCloseModal,
  dropDownList,
  dialogMode,
  clientId,
  clientData,
  fetchAssigned
}) => {
  const [selectedCaregiverInfo, setSelectedCaregiverInfo] = useState<any>()
  const [assignButtonLoading, setAssignButtonLoading] = useState(false)
  const methods = useForm<FormItems>({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  console.log("Selected Caregiver's Info ---->> ", selectedCaregiverInfo)

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

  useEffect(() => {
    if (selectedCaregiver !== undefined || null) {
      fetchSelectedCaregiverData()
    }
  }, [selectedCaregiver])

  const fetchSelectedCaregiverData = async () => {
    try {
      const caregiverRes = await api.get(`/caregivers/user/${selectedCaregiver}`)
      setSelectedCaregiverInfo(caregiverRes.data)
    } catch (error) {
      console.error('Error Fetching Selected Caregiver Data: ', error)
    }
  }

  const onSubmit = async (data: FormItems) => {
    setAssignButtonLoading(true)
    console.log('Form Data:', data, clientId)
    // await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API request
    // reset() // Reset form after submission
    const assignedCaregiver = dropDownList.find((caregiver: any) => caregiver.user.id === data.caregiverId)
    console.log('assignedCaregiver Data:', assignedCaregiver, dropDownList)

    const assignClientBody = {
      userId: selectedCaregiver,
      tenantId: authUser?.tenant?.id,
      clientId: clientId,
      assignmentDate: data.assignmentDate,
      unassignmentDate: data.unassignmentDate,
      notes: data.assignmentNotes,
      scheduleHours: dialogMode === 'CG' ? data.scheduleHours : undefined
    }

    const accountHistoryPayLoad = {
      actionType: 'ClientAssignedToCaregiver',
      details: `Client (ID: ${clientId}) assigned to Caregiver (ID: ${selectedCaregiver}) by User (ID: ${authUser?.id})`,
      userId: authUser?.id,
      caregiverId: selectedCaregiverInfo?.id
    }

    const title = 'New Client Assigned'
    const body = `You have been assigned to ${clientData?.clientData?.firstName} ${clientData?.clientData?.lastName} starting ${data.assignmentDate
      ? new Date(data.assignmentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : ''
      } for ${data.scheduleHours} hours. Check your details.`

    await api.post(`/user/createClientUser`, assignClientBody)
    await api.post(`/account-history/log`, accountHistoryPayLoad)
    await api.post(`/notification/send/${selectedCaregiver}`, { title, body })

    reset()
    fetchAssigned()
    handleCloseModal()
    setAssignButtonLoading(false)
  }

  return (
    <Dialog
      open={showModal}
      onClose={handleCloseModal}
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleCloseModal} disableRipple>
        <i className='bx-x' />
      </DialogCloseButton>
      <div className='flex items-center justify-center pt-[10px] pb-[5px] w-full px-5'>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
            <div>
              <h2 className='text-xl font-semibold mt-5 mb-6'>{`Assign ${dialogMode === 'CG' ? 'Caregiver' : 'Qualified Professional'}`}</h2>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomDropDown
                    label={`Select ${dialogMode === 'QP' ? 'QP' : 'Caregiver'}`}
                    optionList={
                      dropDownList?.map((item: any) => {
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
                        return assignmentDate && new Date(value) >= new Date(assignmentDate)
                          ? true
                          : 'unassignment date must be greater than assignment date'
                      }
                    }}
                  />
                </Grid>
                <>
                  {dialogMode !== 'QP' && (
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <CustomTextField
                        label={'Scheduled Hours'}
                        placeHolder={'Scheduled Hours'}
                        name={'scheduleHours'}
                        defaultValue={''}
                        type={'number'}
                        isRequired={dialogMode === 'CG'}
                        error={errors.scheduleHours}
                        control={control}
                      />
                    </Grid>
                  )}
                </>
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
              <Button variant='outlined' color='secondary' onClick={handleCloseModal}>
                CANCEL
              </Button>
              <Button
                type='submit'
                variant='contained'
                startIcon={assignButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
                disabled={assignButtonLoading}
              >
                {`Assign ${dialogMode === 'CG' ? 'Caregiver' : 'Qualified Professional'} `}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Dialog>
  )
}

export default AssignCG_QPModal

// React Imports
import { useEffect, useState } from 'react'
import type { ReactNode, RefObject, SyntheticEvent } from 'react'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import Autocomplete from '@mui/material/Autocomplete'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import PersonIcon from '@mui/icons-material/Person'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { ChatDataType, StatusObjType } from '@/types/apps/chatTypes'
import type { AppDispatch } from '@/redux-store'

// Slice Imports
import { addNewChat, createChatRoom, fetchChatRooms, receiveMessage } from '@/redux-store/slices/chat'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'
import UserProfileLeft from './UserProfileLeft'
import AvatarWithBadge from './AvatarWithBadge'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { Button, Chip, CircularProgress, Dialog, Grid2 as Grid } from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import api from '@/utils/api'
import { useMqttClient } from '@/hooks/useMqtt'
import { renderChat } from './RenderChat'
import CustomAlert from '@/@core/components/mui/Alter'

export const statusObj: StatusObjType = {
  busy: 'error',
  away: 'warning',
  online: 'success',
  offline: 'secondary'
}

type FormItems = {
  clientId?: number
  otherUser?: number
}

type Props = {
  chatStore: ChatDataType
  getActiveUserData: (id: number) => void
  dispatch: AppDispatch
  backdropOpen: boolean
  setBackdropOpen: (value: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (value: boolean) => void
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean
  messageInputRef: RefObject<HTMLDivElement>
}

// Scroll wrapper for chat list
const ScrollWrapper = ({ children, isBelowLgScreen }: { children: ReactNode; isBelowLgScreen: boolean }) => {
  if (isBelowLgScreen) {
    return <div className='bs-full overflow-y-auto overflow-x-hidden'>{children}</div>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
  }
}

const SidebarLeft = (props: Props) => {
  // Props
  const {
    chatStore,
    getActiveUserData,
    dispatch,
    backdropOpen,
    setBackdropOpen,
    sidebarOpen,
    setSidebarOpen,
    isBelowLgScreen,
    isBelowMdScreen,
    isBelowSmScreen,
    messageInputRef
  } = props

  // States
  const [userSidebar, setUserSidebar] = useState(false)
  const [searchValue, setSearchValue] = useState<{ label: string; chatRoomId: number | undefined } | null>(null)
  const [isModalShow, setIsModalShow] = useState(false)
  const [clients, setClients] = useState<any>([])
  const [caregivers, setCaregivers] = useState<any>([])
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState<any>()
  const [isCreateChatLoading, setIsCreateChatLoading] = useState(false)

  // MQTT Hook
  const { subscribe, isConnected } = useMqttClient({
    username: authUser?.userName || 'anonymous'
  })

  // Subscribe to MQTT wildcard topic
  useEffect(() => {
    if (isConnected && authUser?.tenant?.id) {
      const wildcardTopic = `carekey/chat/#`

      subscribe(wildcardTopic, (message: string) => {
        try {
          const parsedMessage = JSON.parse(message)
          const { chatRoomId, message: text, senderId, time } = parsedMessage

          // Skip if sent by current user
          if (senderId === authUser?.id) {
            return
          }

          // Dispatch new message to Redux
          dispatch(receiveMessage(parsedMessage))
        } catch (error) {
          console.error('Invalid MQTT message:', error)
        }
      })
    }
  }, [isConnected, subscribe, dispatch, authUser])

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientList: any = await api.get(`/client/tenant/${authUser?.tenant?.id}`)

        const formattedClients =
          clientList?.data?.map((item: any) => ({
            key: `${item.id}-${item.firstName}`,
            value: item.id,
            optionString: `${item.firstName} ${item.lastName}`
          })) || []

        const caregiverList: any = await api.get(`/user/tenant/${authUser?.tenant?.id}`)
        const dataToFilter = Array.isArray(caregiverList) ? caregiverList : caregiverList?.data || []
        const formattedCaregivers = dataToFilter
          .filter(
            (item: any) =>
              item !== null &&
              item.id !== authUser?.id &&
              item?.role?.rolePermissions?.some((permission: any) => permission.permission.name === 'Chat')
          )
          .map((item: any) => ({
            key: `${item?.id}-${item?.userName}`,
            value: item?.id,
            optionString: `${item?.userName}`
          }))

        setCaregivers(formattedCaregivers)
        setClients(formattedClients)
      } catch (err: any) {
        console.error('Error fetching clients:', err.message)
      }
    }
    fetchClients()
  }, [authUser?.tenant?.id])

  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: { label: string; chatRoomId: number | undefined } | null,
    reason: any,
    details?: any
  ) => {
    setSearchValue(newValue)
    if (newValue?.chatRoomId) {
      getActiveUserData(newValue.chatRoomId)
      isBelowMdScreen && setSidebarOpen(false)
      setBackdropOpen(false)
      setSearchValue(null)
      messageInputRef.current?.focus()
    }
  }

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      clientId: null,
      otherUser: null
    }
  })

  const handleModalClose = () => {
    setIsModalShow(false)
  }

  const onSubmit = async (data: any) => {
    setIsCreateChatLoading(true)
    const { otherUser, clientId } = data
    const chatRoomName = `chatroom-${Math.min(authUser?.id, Number(otherUser))}-${Math.max(authUser?.id, Number(otherUser))}-${clientId}`

    const response: any = await dispatch(
      createChatRoom({
        chatRoomName,
        userId: authUser?.id,
        clientId: Number(clientId),
        otherUserId: Number(otherUser)
      })
    )

    if (response?.error?.message?.includes('Chatroom already exists')) {
      setAlertOpen(true)
      setAlertProps({
        message: 'Chatroom already exists',
        severity: 'error'
      })
      return
    }

    await dispatch(fetchChatRooms(authUser?.id))
    handleModalClose()
    reset() // Reset form fields after successful submission
    setIsCreateChatLoading(false)
  }

  return (
    <>
      <CustomAlert AlertProps={alertProps} openAlert={alertOpen} setOpenAlert={setAlertOpen} />

      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className='bs-full'
        variant={!isBelowMdScreen ? 'permanent' : 'persistent'}
        ModalProps={{
          disablePortal: true,
          keepMounted: true
        }}
        sx={{
          zIndex: isBelowMdScreen && sidebarOpen ? 11 : 10,
          position: !isBelowMdScreen ? 'static' : 'absolute',
          ...(isBelowSmScreen && sidebarOpen && { width: '100%' }),
          '& .MuiDrawer-paper': {
            overflow: 'hidden',
            boxShadow: 'none',
            width: isBelowSmScreen ? '100%' : '370px',
            position: !isBelowMdScreen ? 'static' : 'absolute'
          }
        }}
      >
        <div className='flex items-center plb-[19px] pli-6 gap-4 border-be'>
          <AvatarWithBadge
            alt={chatStore.profileUser.fullName}
            src={chatStore.profileUser.avatar}
            badgeColor={statusObj[chatStore.profileUser.status]}
            onClick={() => setUserSidebar(true)}
          />
          <div className='flex is-full items-center flex-auto sm:gap-x-3'>
            <Autocomplete
              fullWidth
              size='small'
              id='select-contact'
              options={chatStore.contacts.map(contact => ({
                label: `${contact.fullName} (${contact.about.split('/')[1]})`,
                chatRoomId: contact.chatRoomId,
                key: contact.chatRoomId
              }))}
              value={searchValue}
              onChange={handleChange}
              getOptionLabel={option => option.label}
              isOptionEqualToValue={(option, value) => option.chatRoomId === value.chatRoomId}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  variant='outlined'
                  placeholder='Search Contacts'
                  sx={{ '& .MuiFilledInput-root': { borderRadius: '999px !important' } }}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position='start' className='mli-1'>
                          <i className='bx-search' />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              )}
            />
            <IconButton className='mis-2' size='small' onClick={() => setIsModalShow(true)}>
              <i className='bx bx-plus text-2xl' />
            </IconButton>
            {isBelowMdScreen ? (
              <IconButton
                className='mis-2'
                size='small'
                onClick={() => {
                  setSidebarOpen(false)
                  setBackdropOpen(false)
                }}
              >
                <i className='bx-x text-2xl' />
              </IconButton>
            ) : null}
          </div>
        </div>
        <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
          <ul className='p-3 pbs-4'>
            {renderChat({
              chatStore,
              getActiveUserData,
              backdropOpen,
              setSidebarOpen,
              isBelowMdScreen,
              setBackdropOpen
            })}
          </ul>
        </ScrollWrapper>
      </Drawer>

      <UserProfileLeft
        userSidebar={userSidebar}
        setUserSidebar={setUserSidebar}
        profileUserData={chatStore.profileUser}
        dispatch={dispatch}
        isBelowLgScreen={isBelowLgScreen}
        isBelowSmScreen={isBelowSmScreen}
      />

      <Dialog
        open={isModalShow}
        onClose={handleModalClose}
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        maxWidth='md'
      >
        <DialogCloseButton onClick={() => setIsModalShow(false)} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <div className='flex items-center justify-center w-full px-5'>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
            <div>
              <h2 className='text-xl font-semibold mt-10 mb-6'>Create chat</h2>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <CustomDropDown
                    label='Select a client'
                    optionList={clients}
                    name={'clientId'}
                    control={control}
                    error={errors.clientId}
                    defaultValue={''}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <CustomDropDown
                    label='Select User'
                    optionList={caregivers}
                    name={'otherUser'}
                    control={control}
                    error={errors.otherUser}
                    defaultValue={''}
                  />
                </Grid>
              </Grid>
            </div>
            <div className='flex gap-4 justify-end mt-4 mb-4'>
              <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                Cancel
              </Button>
              <Button
                startIcon={isCreateChatLoading ? <CircularProgress size={20} color='inherit' /> : null}
                type='submit'
                variant='contained'
                disabled={isCreateChatLoading}
              >
                Create
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </>
  )
}

export default SidebarLeft

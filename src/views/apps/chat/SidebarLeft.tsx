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
import { addNewChat, createChatRoom, fetchChatRooms } from '@/redux-store/slices/chat'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'
import UserProfileLeft from './UserProfileLeft'
import AvatarWithBadge from './AvatarWithBadge'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { formatDateToMonthShort } from './utils'
import { Button, Chip, Dialog, Grid2 as Grid } from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import CustomDropDown from '@/@core/components/custom-inputs/CustomDropDown'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useSession } from 'next-auth/react'

export const statusObj: StatusObjType = {
  busy: 'error',
  away: 'warning',
  online: 'success',
  offline: 'secondary'
}

type FormItems = {
  clientId?: number
  caregiverId?: number
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

type RenderChatType = {
  chatStore: ChatDataType
  getActiveUserData: (id: number) => void
  setSidebarOpen: (value: boolean) => void
  backdropOpen: boolean
  setBackdropOpen: (value: boolean) => void
  isBelowMdScreen: boolean
}

// Render chat list
const renderChat = (props: RenderChatType) => {
  const { chatStore, getActiveUserData, setSidebarOpen, backdropOpen, setBackdropOpen, isBelowMdScreen } = props
  return chatStore.chats.map(chat => {
    const contact = chatStore.contacts.find(contact => contact.chatRoomId === chat.id)
    if (!contact) return null
    const isChatActive = chatStore.activeUser?.chatRoomId === contact.chatRoomId

    return (
      <li
        key={chat.id}
        className={classnames('flex items-start gap-4 bs-[60px] pli-3 plb-2 cursor-pointer rounded mbe-1', {
          'bg-[#4B0082] shadow-primarySm': isChatActive,
          'text-[var(--mui-palette-primary-contrastText)]': isChatActive
        })}
        onClick={() => {
          if (contact.chatRoomId !== undefined) {
            getActiveUserData(contact.chatRoomId)
          }
          isBelowMdScreen && setSidebarOpen(false)
          isBelowMdScreen && backdropOpen && setBackdropOpen(false)
        }}
      >
        <AvatarWithBadge
          src={contact.avatar}
          isChatActive={isChatActive}
          alt={contact.fullName}
          badgeColor={statusObj[contact.status]}
          color={contact.avatarColor}
        />
        <div className='min-is-0 flex-auto'>
          <div className='flex items-center gap-3'>
            <Typography>
              {contact.fullName.length > 8 ? `${contact.fullName.substring(0, 8)}...` : contact.fullName}
            </Typography>
            <Chip icon={<PersonIcon />} label={contact.about.split('/')[1]} variant='outlined' />
          </div>
          {chat.chat.length ? (
            <Typography variant='body2' color={isChatActive ? 'inherit' : 'text.secondary'} className='truncate'>
              {chat.chat[chat.chat.length - 1].message}
            </Typography>
          ) : (
            <Typography variant='body2' color={isChatActive ? 'inherit' : 'text.secondary'} className='truncate'>
              {contact.role}
            </Typography>
          )}
        </div>
        <div className='flex flex-col items-end justify-start'>
          <Typography
            variant='body2'
            color='inherit'
            className={classnames('truncate', {
              'text-textDisabled': !isChatActive
            })}
          >
            {chat.chat.length ? formatDateToMonthShort(chat.chat[chat.chat.length - 1].time || new Date()) : null}
          </Typography>
          {chat.unseenMsgs > 0 ? <CustomChip round='true' label={chat.unseenMsgs} color='error' size='small' /> : null}
        </div>
      </li>
    )
  })
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
  const authUser: any = JSON.parse(localStorage.getItem('AuthUser') ?? '')

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientList: any = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/clientUsers/${authUser?.tenant?.id}`
        )

        const formattedClients =
          clientList?.data?.map((item: any) => {
            return {
              key: `${item.client.id}-${item.client.firstName}`,
              value: item.client.id,
              optionString: `${item.client.firstName} ${item.client.lastName}`
            }
          }) || []

        const caregiverList: any = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/tenant/${authUser?.tenant?.id}`
        )
        const formattedCaregivers = caregiverList.data
          .filter((item: any) => item !== null && item.id != authUser?.id) // Filter out null and current user
          ?.map((item: any) => ({
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
  }, [])

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
  } = useForm<FormItems>()

  const handleModalClose = () => {
    setIsModalShow(false)
  }

  const onSubmit = async (data: FormItems) => {
    const { caregiverId, clientId } = data
    const chatRoomName = `chatroom-${Math.min(authUser?.id, Number(caregiverId))}-${Math.max(authUser?.id, Number(caregiverId))}-${clientId}`

    dispatch(
      createChatRoom({
        chatRoomName,
        caregiverId: authUser?.id,
        clientId: Number(clientId),
        otherCaregiverId: Number(caregiverId)
      })
    )
    dispatch(fetchChatRooms(authUser?.id))
    handleModalClose()
  }

  return (
    <>
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className='bs-full'
        variant={!isBelowMdScreen ? 'permanent' : 'persistent'}
        ModalProps={{
          disablePortal: true,
          keepMounted: true // Better open performance on mobile.
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
            onClick={() => {
              setUserSidebar(true)
            }}
          />
          <div className='flex is-full items-center flex-auto sm:gap-x-3'>
            <Autocomplete
              fullWidth
              size='small'
              id='select-contact'
              options={chatStore.contacts.map(contact => ({
                label: `${contact.fullName} (${contact.about.split('/')[1]})`,
                chatRoomId: contact.chatRoomId,
                key: contact.chatRoomId // Add the key prop here
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
            <IconButton
              className='mis-2'
              size='small'
              onClick={() => {
                setIsModalShow(true)
              }}
            >
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
                    sx={{ width: '100%', minWidth: '180px' }} // added width styling
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <CustomDropDown
                    label='Select caregiver'
                    optionList={caregivers}
                    name={'caregiverId'}
                    control={control}
                    error={errors.caregiverId}
                    defaultValue={''}
                    sx={{ width: '100%', minWidth: '180px' }} // added width styling
                  />
                </Grid>
              </Grid>
            </div>
            <div className='flex gap-4 justify-end mt-4 mb-4'>
              <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                Cancel
              </Button>
              <Button type='submit' variant='contained' className='bg-[#4B0082]'>
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

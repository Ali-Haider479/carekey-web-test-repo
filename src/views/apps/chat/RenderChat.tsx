import classnames from 'classnames'
// import { AvatarWithBadge, CustomChip, Typography } from ''
import PersonIcon from '@mui/icons-material/Person'
import { ChatDataType, StatusObjType } from '@/types/apps/chatTypes'
import Chip from '@mui/material/Chip'
import { formatDateToMonthShort } from './utils'
import AvatarWithBadge from './AvatarWithBadge'
import { Typography } from '@mui/material'
import CustomChip from '@/@core/components/mui/Chip'

export const statusObj: StatusObjType = {
  busy: 'error',
  away: 'warning',
  online: 'success',
  offline: 'secondary'
}

type RenderChatType = {
  chatStore: ChatDataType
  getActiveUserData: (id: number) => void
  setSidebarOpen: (value: boolean) => void
  backdropOpen: boolean
  setBackdropOpen: (value: boolean) => void
  isBelowMdScreen: boolean
}

export const renderChat = (props: RenderChatType) => {
  const { chatStore, getActiveUserData, setSidebarOpen, backdropOpen, setBackdropOpen, isBelowMdScreen } = props

  const sortedChats = [...chatStore.chats].sort((a, b) => {
    const aLastMessageTime = a.chat.length ? new Date(a.chat[a.chat.length - 1].time).getTime() : 0
    const bLastMessageTime = b.chat.length ? new Date(b.chat[b.chat.length - 1].time).getTime() : 0
    return bLastMessageTime - aLastMessageTime
  })

  return sortedChats.map(chat => {
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
          if (isBelowMdScreen) {
            setSidebarOpen(false)
            if (backdropOpen) setBackdropOpen(false)
          }
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
          {chat.id === chatStore.activeUser?.chatRoomId ? (
            ''
          ) : chat.unseenMsgs > 0 ? (
            <CustomChip round='true' label={chat.unseenMsgs} color='error' size='small' />
          ) : null}
        </div>
      </li>
    )
  })
}

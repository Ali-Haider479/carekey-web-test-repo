// Type Imports
import type { ThemeColor } from '@core/types'

export type StatusType = 'busy' | 'away' | 'online' | 'offline'

export type StatusObjType = Record<StatusType, ThemeColor>

export type ProfileUserType = {
  id: number
  role: string
  about: string
  avatar: string
  fullName: string
  status: StatusType
  settings: {
    isNotificationsOn: boolean
    isTwoStepAuthVerificationEnabled: boolean
  }
}

export type ContactType = {
  id: number
  fullName: string
  role: string
  about: string
  chatRoomId?: number
  avatar?: string
  avatarColor?: ThemeColor
  status: StatusType
}

export type UserChatType = {
  message: string
  time: string | Date
  senderId: number
  attachmentFile: {
    fileKey: string
    fileName: string
    mimeType: string
  } | null
  msgStatus?: Record<'isSent' | 'isDelivered' | 'isSeen', boolean>
  chatRoomId?: number
}

export type ChatType = {
  id: number
  userId: number
  unseenMsgs: number
  chat: UserChatType[]
}

export type ChatDataType = {
  profileUser: ProfileUserType
  contacts: ContactType[]
  chats: ChatType[]
  activeUser?: ContactType
  loading: boolean
  error?: string
}

export interface ChatMessage {
  timestamp: string | number | Date
  senderId: string
  receiverId: string
  message: string
  attachmentFile: {
    fileKey: string
    fileName: string
    mimeType: string
  } | null
  chatRoomId?: any
  time: string
  msgStatus: {
    isSent: boolean
    isDelivered: boolean
    isSeen: boolean
  }
}

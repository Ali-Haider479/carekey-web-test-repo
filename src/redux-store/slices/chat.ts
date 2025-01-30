import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ChatDataType, ChatMessage, StatusType } from '@/types/apps/chatTypes'
import axios from 'axios'

const initialState: ChatDataType = {
  profileUser: {
    id: 1,
    avatar: '/images/avatars/1.png',
    fullName: 'John Doe',
    role: 'Admin',
    about:
      'Dessert chocolate cake lemon drops jujubes. Biscuit cupcake ice cream bear claw brownie brownie marshmallow.',
    status: 'online',
    settings: {
      isTwoStepAuthVerificationEnabled: true,
      isNotificationsOn: false
    }
  },
  contacts: [],
  chats: [],
  activeUser: undefined, // Since `activeUser` is optional
  loading: false,
  error: undefined
}

export const fetchChatRooms = createAsyncThunk('chat/fetchChatRooms', async (userId: number) => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chatroom/list/${userId}`)
  const chatRooms = response.data

  // Transform contacts - use otherCaregiver.id as the contact id
  const contacts = chatRooms.map((room: any) => ({
    id: room.otherCaregiver.id, // Use otherCaregiver.id instead of room.id
    fullName: room.otherCaregiver.userName,
    role: 'Caregiver',
    about: `Chatroom for ${room.chatName}`,
    avatar: room.otherCaregiver.profileImageUrl || '/images/avatars/default.png',
    status: 'offline',
    chatRoomId: room.id // Store chatRoomId for reference
  }))

  // Transform messages - use otherCaregiver.id as userId
  const chats = chatRooms.map((room: any) => ({
    id: room.id,
    userId: room.otherCaregiver.id, // Use otherCaregiver.id to match with contact
    unseenMsgs: room.unreadCount || 0,
    chat: room.messages.map((msg: any) => ({
      message: msg.message,
      time: msg.createdAt,
      senderId: msg.sender.id,
      msgStatus: {
        isSent: true,
        isDelivered: true,
        isSeen: msg.isRead
      }
    }))
  }))

  return {
    contacts,
    chats
  }
})

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    getActiveUserData: (state, action: PayloadAction<number>) => {
      // Find contact by otherCaregiver.id
      const activeUser = state.contacts.find(user => user.id === action.payload)

      // Find chat using the same ID
      const chat = state.chats.find(chat => chat.userId === action.payload)

      if (chat && chat.unseenMsgs > 0) {
        chat.unseenMsgs = 0
      }

      if (activeUser) {
        state.activeUser = activeUser
      }
    },

    addNewChat: (state, action) => {
      const { id } = action.payload

      state.contacts.find(contact => {
        if (contact.id === id && !state.chats.find(chat => chat.userId === contact.id)) {
          state.chats.unshift({
            id: state.chats.length + 1,
            userId: contact.id,
            unseenMsgs: 0,
            chat: []
          })
        }
      })
    },

    setUserStatus: (state, action: PayloadAction<{ status: StatusType }>) => {
      state.profileUser = {
        ...state.profileUser,
        status: action.payload.status
      }
    },

    sendMsg: (state, action: PayloadAction<{ msg: string }>) => {
      const { msg } = action.payload

      const existingChat = state.chats.find(chat => chat.userId === state.activeUser?.id)

      if (existingChat) {
        existingChat.chat.push({
          message: msg,
          time: new Date(),
          senderId: state.profileUser.id,
          msgStatus: {
            isSent: true,
            isDelivered: false,
            isSeen: false
          }
        })

        // Remove and add to beginning to maintain order
        state.chats = state.chats.filter(chat => chat.userId !== state.activeUser?.id)
        state.chats.unshift(existingChat)
      }
    },

    receiveMessage: (state, action: PayloadAction<ChatMessage>) => {
      // MQTT handel display new message so no need to add it manually
      const { senderId, receiverId } = action.payload
      const chatId = Number(senderId) === state.profileUser.id ? Number(receiverId) : Number(senderId)
      const chat = state.chats.find(c => c.userId === chatId)
      if (chat) {
        chat.chat.push({
          ...action.payload,
          senderId: Number(action.payload.senderId),
          time: new Date(action.payload.timestamp).toISOString()
        })
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchChatRooms.pending, state => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.loading = false
        state.contacts = action.payload.contacts
        state.chats = action.payload.chats
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { getActiveUserData, addNewChat, setUserStatus, sendMsg, receiveMessage } = chatSlice.actions

export default chatSlice.reducer

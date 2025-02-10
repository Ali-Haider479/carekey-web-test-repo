import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ChatDataType, ChatMessage, StatusType } from '@/types/apps/chatTypes'
import axios from 'axios'

const initialState: ChatDataType = {
  profileUser: {
    id: 0,
    avatar: '/images/avatars/1.png',
    fullName: '',
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
    status: 'offline' as StatusType,
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

export const createChatRoom = createAsyncThunk(
  'chat/createChatRoom',
  async (
    payload: {
      chatRoomName: string
      caregiverId: number
      clientId: number
      otherCaregiverId: number
    },
    { dispatch }
  ) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chatroom/create`, payload)

      if (response.data.message === 'Chatroom already exists') {
        throw new Error('Chatroom already exists')
      }

      // Fetch updated room list to ensure consistency
      const updatedResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chatroom/list/${payload.caregiverId}`)
      const newRoom = updatedResponse.data.find((room: any) => room.otherCaregiver.id === payload.otherCaregiverId)
      if (!newRoom) throw new Error('Failed to fetch new chatroom')

      // Transform the new room data to match your state structure
      const newContact = {
        id: newRoom.otherCaregiver.id,
        fullName: newRoom.otherCaregiver.userName,
        role: 'Caregiver',
        about: `Chatroom for ${newRoom.chatName}`,
        avatar: newRoom.otherCaregiver.profileImageUrl || '/images/avatars/default.png',
        status: 'offline' as StatusType,
        chatRoomId: newRoom.id
      }

      const newChat = {
        id: newRoom.id,
        userId: newRoom.otherCaregiver.id,
        unseenMsgs: 0,
        chat: newRoom.messages.map((msg: any) => ({
          message: msg.message,
          time: msg.createdAt,
          senderId: msg.sender.id,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: msg.isRead
          }
        }))
      }

      return {
        contact: newContact,
        chat: newChat,
        message: response.data.message
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message)
    }
  }
)

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    updateProfileFromSession: (state, action: PayloadAction<{ id: number; userName: string }>) => {
      state.profileUser = {
        ...state.profileUser,
        id: action.payload.id,
        fullName: action.payload.userName
      }
    },
    getActiveUserData: (state, action: PayloadAction<number>) => {
      // Find contact by otherCaregiver.id
      const activeUser = state.contacts.find(user => user.chatRoomId === action.payload)
      // Find chat using the same ID
      const chat = state.chats.find(chat => chat.id === action.payload)

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
      const existingChat = state.chats.find(chat => chat.id === state.activeUser?.chatRoomId)

      if (existingChat) {
        const newMessage = {
          message: msg,
          time: new Date().toISOString(),
          senderId: state.profileUser.id,
          msgStatus: {
            isSent: true,
            isDelivered: false,
            isSeen: false
          }
        }

        // Check if the message already exists
        const isDuplicate = existingChat.chat.some(
          chatMsg =>
            chatMsg.message === newMessage.message &&
            chatMsg.senderId === newMessage.senderId &&
            Math.abs(new Date(chatMsg.time).getTime() - new Date(newMessage.time).getTime()) < 1000 // Allow 1-second tolerance
        )

        if (!isDuplicate) {
          existingChat.chat.push(newMessage)

          // Remove and add to beginning to maintain order
          state.chats = state.chats.filter(chat => chat.id !== state.activeUser?.chatRoomId)
          state.chats.unshift(existingChat)
        }
      }
    },

    receiveMessage: (state, action: PayloadAction<ChatMessage>) => {
      const { senderId, receiverId } = action.payload
      const chatId = Number(senderId) === state.profileUser.id ? Number(receiverId) : Number(senderId)
      const chat = state.chats.find(c => c.userId === chatId)

      if (chat) {
        const newMessage = {
          ...action.payload,
          senderId: Number(action.payload.senderId),
          time: new Date(action.payload.time).toISOString()
        }

        // Check if the message already exists
        const isDuplicate = chat.chat.some(
          chatMsg =>
            chatMsg.message === newMessage.message &&
            chatMsg.senderId === newMessage.senderId &&
            Math.abs(new Date(chatMsg.time).getTime() - new Date(newMessage.time).getTime()) < 1000 // Allow 1-second tolerance
        )

        if (!isDuplicate) {
          chat.chat.push(newMessage)
        }
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
      //
      .addCase(createChatRoom.pending, state => {
        state.loading = true
        state.error = undefined
      })
      .addCase(createChatRoom.fulfilled, (state, action) => {
        state.loading = false

        // Check if contact already exists
        const existingContactIndex = state.contacts.findIndex(contact => contact.id === action.payload.contact.id)

        if (existingContactIndex !== -1) {
          // Update existing contact
          state.contacts[existingContactIndex] = action.payload.contact
        } else {
          // Add new contact
          state.contacts.push(action.payload.contact)
        }

        // Check if chat already exists
        const existingChatIndex = state.chats.findIndex(chat => chat.userId === action.payload.chat.userId)

        if (existingChatIndex !== -1) {
          // Update existing chat
          state.chats[existingChatIndex] = action.payload.chat
        } else {
          // Add new chat
          state.chats.unshift(action.payload.chat)
        }
      })
      .addCase(createChatRoom.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

export const { getActiveUserData, addNewChat, setUserStatus, sendMsg, receiveMessage, updateProfileFromSession } =
  chatSlice.actions

export default chatSlice.reducer

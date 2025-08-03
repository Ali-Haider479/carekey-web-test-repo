// React Imports
import { useRef, useEffect, useState } from 'react'
import type { MutableRefObject, ReactNode } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CardContent from '@mui/material/CardContent'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { ChatType, ChatDataType, UserChatType, ProfileUserType } from '@/types/apps/chatTypes'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { useMqttClient } from '@/hooks/useMqtt'
import { useAppDispatch } from '@/hooks/useDispatch'
import { receiveMessage } from '@/redux-store/slices/chat'
import axios from 'axios'
import api from '@/utils/api'
import { Box, CircularProgress, Divider, IconButton } from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ImageIcon from '@mui/icons-material/Image'
import { Description, Download, Feed, FolderZip, Slideshow, VideoFile } from '@mui/icons-material'
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay'
import ImageRenderWithPresignedUrl from '@/@core/components/mui/ImageRenderWithPresignedUrl'
import { forceFileDownload } from '@/utils/helperFunctions'

type MsgGroupType = {
  senderId: number
  messages: Omit<UserChatType, 'senderId'>[]
}

type ChatLogProps = {
  chatStore: ChatDataType
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean
}

// Formats the chat data into a structured format for display.
const formattedChatData = (chats: ChatType['chat'], profileUser: ProfileUserType) => {
  const formattedChatData: MsgGroupType[] = []
  let chatMessageSenderId = chats[0] ? chats[0].senderId : profileUser.id
  let msgGroup: MsgGroupType = {
    senderId: chatMessageSenderId,
    messages: []
  }

  chats.forEach((chat, index) => {
    if (chatMessageSenderId === chat.senderId) {
      msgGroup.messages.push({
        time: chat.time,
        message: chat.message,
        msgStatus: chat.msgStatus,
        attachmentFile: chat.attachmentFile
      })
    } else {
      chatMessageSenderId = chat.senderId

      formattedChatData.push(msgGroup)
      msgGroup = {
        senderId: chat.senderId,
        messages: [
          {
            time: chat.time,
            message: chat.message,
            msgStatus: chat.msgStatus,
            attachmentFile: chat.attachmentFile
          }
        ]
      }
    }

    if (index === chats.length - 1) formattedChatData.push(msgGroup)
  })

  return formattedChatData
}

// Wrapper for the chat log to handle scrolling
const ScrollWrapper = ({
  children,
  isBelowLgScreen,
  scrollRef
}: {
  children: ReactNode
  isBelowLgScreen: boolean
  scrollRef: MutableRefObject<null>
}) => {
  if (isBelowLgScreen) {
    return (
      <div ref={scrollRef} className='bs-full overflow-y-auto overflow-x-hidden'>
        {children}
      </div>
    )
  } else {
    return (
      <PerfectScrollbar ref={scrollRef} options={{ wheelPropagation: false }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const ChatLog = ({ chatStore, isBelowLgScreen, isBelowMdScreen, isBelowSmScreen }: ChatLogProps) => {
  const { profileUser, contacts, activeUser } = chatStore
  const dispatch = useAppDispatch()
  const activeUserChat = chatStore.chats.find((chat: ChatType) => chat.id === chatStore.activeUser?.chatRoomId)
  const scrollRef = useRef(null)
  const processedMessages = useRef(new Set<string>())
  const [loading, setLoading] = useState<string | null>(null)
  const [loadedImagesCount, setLoadedImagesCount] = useState(0)
  const [totalImagesCount, setTotalImagesCount] = useState(0)

  // Track the previous active chat room ID
  const previousChatRoomRef = useRef<number | null>(null)

  // Use this to prevent duplicate API calls
  const isUpdatePendingRef = useRef<boolean>(false)

  const mqttClient = useMqttClient({
    username: profileUser.fullName
  })

  const fileTypeIcons: Record<string, React.ReactNode> = {
    'image/jpeg': <ImageIcon color='inherit' />,
    'image/png': <ImageIcon color='inherit' />,
    'image/jpg': <ImageIcon color='inherit' />,
    'application/pdf': <PictureAsPdfIcon color='error' />,
    'video/mp4': <VideoFile color='inherit' />,
    'video/mpeg': <VideoFile color='inherit' />,
    'video/avi': <VideoFile color='inherit' />,
    'video/mkv': <VideoFile color='inherit' />,
    'video/webm': <VideoFile color='inherit' />,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (
      <Description className='text-[#40a5ee]' />
    ),
    'application/msword': <Description className='text-[#40a5ee]' />,
    'text/plain': <Description className='text-[#40a5ee]' />,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': <Feed className='text-[#35bc73]' />,
    'application/vnd.ms-excel': <Feed className='text-[#35bc73]' />,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': (
      <Slideshow className='text-[#e34220]' />
    ),
    'application/vnd.ms-powerpoint': <Slideshow className='text-[#e34220]' />,
    'text/csv': <Feed className='text-[#35bc73]' />,
    'application/zip': <FolderZip className='text-[#ffe694]' />
  }

  // Get the icon for the file type, default to DescriptionIcon for unknown types
  const getFileIcon = (fileType: string) => {
    return fileTypeIcons[fileType] || <Description color='primary' />
  }

  // Function to update message read status
  const updateMessagesReadStatus = async (chatRoomId: number) => {
    if (!chatRoomId || !profileUser?.id || isUpdatePendingRef.current) return
    try {
      isUpdatePendingRef.current = true
      await api.post(`/chat/update-read-status`, {
        chatRoomId: chatRoomId,
        readerId: profileUser.id
      })
      console.log('Updated read status for chat:', chatRoomId)
    } catch (error) {
      console.error('Error updating message read status:', error)
    } finally {
      isUpdatePendingRef.current = false
    }
  }

  // MQTT subscription logic remains the same...
  useEffect(() => {
    if (activeUser && mqttClient.isConnected) {
      // const incomingTopic = `carekey/chat/${activeUser.id}/${profileUser.id}`
      // const outgoingTopic = `carekey/chat/${profileUser.id}/${activeUser.id}`

      const outgoingTopic = `carekey/chat/${profileUser.fullName.replaceAll(' ', '_')}-${profileUser.id}/${activeUser?.fullName.replaceAll(' ', '_')}-${activeUser?.id}`
      const incomingTopic = `carekey/chat/${activeUser.fullName.replaceAll(' ', '_')}-${activeUser.id}/${profileUser?.fullName.replaceAll(' ', '_')}-${profileUser?.id}`

      const handleMessage = (message: string) => {
        try {
          const messageData = JSON.parse(message)
          console.log('I FOUND LIVE MESSAGE', messageData)
          // Create a unique message identifier using content and timestamp
          const messageId = `${messageData.message}-${messageData.time}-${messageData.senderId}`

          // Only process message if we haven't seen it before
          if (!processedMessages.current.has(messageId)) {
            processedMessages.current.add(messageId)
            dispatch(receiveMessage(messageData))
          }
        } catch (error) {
          console.error('Error parsing MQTT message:', error)
        }
      }

      mqttClient.subscribe(incomingTopic, handleMessage)
      mqttClient.subscribe(outgoingTopic, handleMessage)

      return () => {
        // Clear processed messages when unmounting or changing active user
        processedMessages.current.clear()
      }
    }
  }, [activeUser, profileUser.id, mqttClient.isConnected])

  useEffect(() => {
    if (activeUserChat) {
      const imagesCount = activeUserChat.chat.reduce((count, chat) => {
        return count + (chat.attachmentFile?.mimeType.startsWith('image/') ? 1 : 0)
      }, 0)
      setTotalImagesCount(imagesCount)
      setLoadedImagesCount(0) // Reset when chat changes
    }
  }, [activeUserChat])

  // Function to scroll to bottom when new message is sent
  const scrollToBottom = () => {
    if (scrollRef.current) {
      if (isBelowLgScreen) {
        // @ts-ignore
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      } else {
        // @ts-ignore
        scrollRef.current._container.scrollTop = scrollRef.current._container.scrollHeight
      }
    }
  }

  // Scroll to bottom on new message
  useEffect(() => {
    if (activeUserChat && activeUserChat.chat && activeUserChat.chat.length) {
      scrollToBottom()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatStore])

  useEffect(() => {
    const handleVisibilityChange = () => {
      // If tab becomes hidden and we have a previous chat, update its read status
      if (document.visibilityState === 'hidden' && previousChatRoomRef.current) {
        updateMessagesReadStatus(previousChatRoomRef.current)
      }
    }

    // Listen for visibility changes (tab switching, minimizing)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Update previous chat room when active user changes
    if (activeUser?.chatRoomId) {
      // If we have a previous chat and it's different from current, update its read status
      if (previousChatRoomRef.current && previousChatRoomRef.current !== activeUser.chatRoomId) {
        updateMessagesReadStatus(previousChatRoomRef.current)
      }

      // Store current chat room as previous for next change
      previousChatRoomRef.current = activeUser.chatRoomId
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      // When unmounting, update the current chat's read status
      if (activeUser?.chatRoomId) {
        updateMessagesReadStatus(activeUser.chatRoomId)
      }
    }
  }, [activeUser?.chatRoomId])

  const handleFileClick = async (fileKey: string, fileName: string) => {
    if (!fileKey) return

    setLoading(fileKey)
    try {
      const response = await api.get(`/upload-document/get-signed-chat-file-get-url/${fileKey}`)

      if (response?.status === 200 && response.data) {
        await forceFileDownload(response.data, fileName)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      // Consider adding user feedback here (toast notification, etc.)
    } finally {
      setLoading(null)
    }
  }

  const handleImageLoad = () => {
    setLoadedImagesCount(prev => prev + 1)
  }

  useEffect(() => {
    if (loadedImagesCount === totalImagesCount) {
      scrollToBottom()
    }
  }, [loadedImagesCount, totalImagesCount])

  return (
    <ScrollWrapper isBelowLgScreen={isBelowLgScreen} scrollRef={scrollRef}>
      <CardContent className='p-0'>
        {activeUserChat &&
          formattedChatData(activeUserChat.chat, profileUser).map((msgGroup, index) => {
            console.log('Message Group---->', msgGroup)
            const isSender = msgGroup.senderId === profileUser.id

            return (
              <div key={index} className={classnames('flex gap-4 p-6', { 'flex-row-reverse': isSender })}>
                {!isSender ? (
                  contacts.find(contact => contact.id === activeUserChat?.userId)?.avatar ? (
                    <Avatar
                      alt={contacts.find(contact => contact.id === activeUserChat?.userId)?.fullName}
                      src={contacts.find(contact => contact.id === activeUserChat?.userId)?.avatar}
                      className='is-8 bs-8'
                    />
                  ) : (
                    <CustomAvatar
                      color={contacts.find(contact => contact.id === activeUserChat?.userId)?.avatarColor}
                      skin='light'
                      size={32}
                    >
                      {getInitials(contacts.find(contact => contact.id === activeUserChat?.userId)?.fullName as string)}
                    </CustomAvatar>
                  )
                ) : profileUser.avatar ? (
                  <Avatar alt={profileUser.fullName} src={profileUser.avatar} className='is-8 bs-8' />
                ) : (
                  <CustomAvatar alt={profileUser.fullName} src={profileUser.avatar} size={32} />
                )}
                <div
                  className={classnames('flex gap-2 flex-col', {
                    'items-start': !isSender,
                    'items-end': isSender,
                    'max-is-[65%]': !isBelowMdScreen,
                    'max-is-[75%]': isBelowMdScreen && !isBelowSmScreen,
                    'max-is-[calc(100%-5.75rem)]': isBelowSmScreen
                  })}
                >
                  {msgGroup.messages
                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                    .map((msg, index) => (
                      <Box key={index}>
                        {msg?.attachmentFile ? (
                          <>
                            {msg.attachmentFile.mimeType.startsWith('image/') ? (
                              <Box
                                className={classnames('whitespace-pre-wrap shadow-xs', {
                                  'bg-backgroundPaper rounded-e rounded-b': !isSender,
                                  'text-[var(--mui-palette-primary-contrastText)] rounded-s rounded-b': isSender
                                })}
                                sx={theme => ({
                                  backgroundColor:
                                    theme.palette.mode === 'light'
                                      ? theme.palette.primary.main
                                      : theme.palette.primary.dark,
                                  cursor: 'pointer',
                                  width: '325px',
                                  maxHeight: 'auto',
                                  gap: '2px',
                                  borderRadius: '4px',
                                  p: 1.25,
                                  py: 1.5,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                  justifyContent: 'center'
                                })}
                              >
                                <ImageRenderWithPresignedUrl
                                  fileKey={msg.attachmentFile.fileKey}
                                  fileName={msg.attachmentFile.fileName}
                                  handleClick={() =>
                                    handleFileClick(msg.attachmentFile!.fileKey, msg.attachmentFile!.fileName)
                                  }
                                  downloading={loading === msg.attachmentFile.fileKey}
                                  onLoad={handleImageLoad}
                                />
                                {msg.message !== 'fileAttachment' && (
                                  <Typography
                                    className={classnames('whitespace-pre-wrap pli-2 plb-1', {
                                      'bg-backgroundPaper rounded-e rounded-b': !isSender,
                                      'text-[var(--mui-palette-primary-contrastText)]': isSender
                                    })}
                                    sx={theme => ({
                                      backgroundColor:
                                        theme.palette.mode === 'light'
                                          ? theme.palette.primary.main
                                          : theme.palette.primary.dark
                                    })}
                                    style={{ wordBreak: 'break-word' }}
                                  >
                                    {msg.message}
                                  </Typography>
                                )}
                                <Box sx={{ mt: 'auto', display: 'flex', width: '100%', px: 2 }}>
                                  <Typography
                                    variant='caption'
                                    sx={theme => ({
                                      color: theme.palette.mode === 'light' ? '#bbb' : 'textSecondary'
                                    })}
                                  >
                                    {msg.attachmentFile!.fileName.split('.').pop()?.toUpperCase()}
                                  </Typography>
                                  <Typography
                                    variant='caption'
                                    sx={theme => ({
                                      ml: 'auto',
                                      color: theme.palette.mode === 'light' ? '#bbb' : 'textSecondary'
                                    })}
                                  >
                                    {new Date(msg.time).toLocaleString('en-US', {
                                      hour: 'numeric',
                                      minute: 'numeric',
                                      hour12: true
                                    })}
                                  </Typography>
                                </Box>
                              </Box>
                            ) : (
                              <Box
                                className={classnames('whitespace-pre-wrap pli-3 plb-2 shadow-xs', {
                                  'bg-backgroundPaper rounded-e rounded-b': !isSender,
                                  'text-[var(--mui-palette-primary-contrastText)] rounded-s rounded-b': isSender
                                })}
                                sx={theme => ({
                                  backgroundColor:
                                    theme.palette.mode === 'light'
                                      ? theme.palette.primary.main
                                      : theme.palette.primary.dark,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  width: '325px',
                                  maxHeight: 'auto',
                                  gap: '4px',
                                  alignItems: 'flex-start',
                                  boxShadow: 3
                                })}
                              >
                                <Box
                                  sx={theme => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    gap: '8px',
                                    minHeight: '50px',
                                    borderRadius: '4px'
                                  })}
                                >
                                  {getFileIcon(msg.attachmentFile!.mimeType)}
                                  <Typography
                                    sx={theme => ({
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      wordBreak: 'break-word',
                                      color: theme.palette.mode === 'light' ? '#bbb' : 'textSecondary'
                                    })}
                                  >
                                    {msg.attachmentFile!.fileName.length > 50
                                      ? `${msg.attachmentFile!.fileName.substring(0, 45)}...`
                                      : msg.attachmentFile!.fileName}
                                  </Typography>

                                  <IconButton
                                    sx={theme => ({
                                      ml: 'auto',
                                      color: 'inherit'
                                    })}
                                    size='small'
                                    disabled={loading === msg.attachmentFile!.fileKey}
                                    onClick={() =>
                                      handleFileClick(msg.attachmentFile!.fileKey, msg.attachmentFile!.fileName)
                                    }
                                  >
                                    {loading === msg.attachmentFile!.fileKey ? (
                                      <CircularProgress size={24} color='inherit' />
                                    ) : (
                                      <Download />
                                    )}
                                  </IconButton>
                                </Box>
                                {msg.message !== 'fileAttachment' && (
                                  <>
                                    {/* <div className='w-full flex items-center justify-center'>
                                    <Divider className='w-full bg-[#bbb]' />
                                  </div> */}
                                    <Typography
                                      className={classnames('whitespace-pre-wrap pli-0 plb-1', {
                                        'bg-backgroundPaper rounded-e rounded-b': !isSender,
                                        'text-[var(--mui-palette-primary-contrastText)]': isSender
                                      })}
                                      sx={theme => ({
                                        backgroundColor:
                                          theme.palette.mode === 'light'
                                            ? theme.palette.primary.main
                                            : theme.palette.primary.dark
                                      })}
                                      style={{ wordBreak: 'break-word' }}
                                    >
                                      {msg.message}
                                    </Typography>
                                  </>
                                )}
                                <Box sx={{ mt: 'auto', display: 'flex', width: '100%' }}>
                                  <Typography
                                    variant='caption'
                                    sx={theme => ({
                                      color: theme.palette.mode === 'light' ? '#bbb' : 'textSecondary'
                                    })}
                                  >
                                    {msg.attachmentFile!.fileName.split('.').pop()?.toUpperCase()}
                                  </Typography>
                                  <Typography
                                    variant='caption'
                                    sx={theme => ({
                                      ml: 'auto',
                                      color: theme.palette.mode === 'light' ? '#bbb' : 'textSecondary'
                                    })}
                                  >
                                    {new Date(msg.time).toLocaleString('en-US', {
                                      hour: 'numeric',
                                      minute: 'numeric',
                                      hour12: true
                                    })}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </>
                        ) : (
                          <Typography
                            className={classnames('whitespace-pre-wrap pli-4 plb-2 shadow-xs', {
                              'bg-backgroundPaper rounded-e rounded-b': !isSender,
                              'text-[var(--mui-palette-primary-contrastText)] rounded-s rounded-b': isSender
                            })}
                            sx={theme => ({
                              backgroundColor:
                                theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.dark
                            })}
                            style={{ wordBreak: 'break-word' }}
                          >
                            {msg.message}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  {msgGroup.messages
                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                    .map(
                      (msg, index) =>
                        index === msgGroup.messages.length - 1 &&
                        (isSender ? (
                          <div key={index} className='flex items-center gap-2'>
                            {msg.msgStatus?.isSeen ? (
                              <i className='bx-check-double text-success text-base' />
                            ) : msg.msgStatus?.isDelivered ? (
                              <i className='bx-check-double text-base' />
                            ) : (
                              msg.msgStatus?.isSent && <i className='bx-check text-base' />
                            )}
                            {index === activeUserChat.chat.length - 1 ? (
                              <Typography variant='caption'>
                                {new Date().toLocaleString('en-US', {
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true
                                })}
                              </Typography>
                            ) : msg.time ? (
                              <Typography variant='caption'>
                                {new Date(msg.time).toLocaleString('en-US', {
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true
                                })}
                              </Typography>
                            ) : null}
                          </div>
                        ) : index === activeUserChat.chat.length - 1 ? (
                          <Typography key={index} variant='caption'>
                            {new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                          </Typography>
                        ) : msg.time ? (
                          <Typography key={index} variant='caption'>
                            {new Date(msg.time).toLocaleString('en-US', {
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true
                            })}
                          </Typography>
                        ) : null)
                    )}
                </div>
              </div>
            )
          })}
      </CardContent>
    </ScrollWrapper>
  )
}

export default ChatLog

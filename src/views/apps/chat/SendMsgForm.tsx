// React Imports
import { useRef, useState, useEffect } from 'react'
import type { FormEvent, KeyboardEvent, RefObject, MouseEvent, ChangeEvent } from 'react'

// MUI Imports
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

// Type Imports
import type { ChatDataType, ContactType } from '@/types/apps/chatTypes'
import type { AppDispatch } from '@/redux-store'

// Slice Imports
import { sendMsg } from '@/redux-store/slices/chat'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'
import { useMqttClient } from '@/hooks/useMqtt'
import { Box } from '@mui/material'
import FileProgress from '@/@core/components/mui/FileProgress'
import api from '@/utils/api'

import axios, { AxiosProgressEvent } from 'axios'
import CustomAlert from '@/@core/components/mui/Alter'

type Props = {
  dispatch: AppDispatch
  activeUser: ContactType
  isBelowSmScreen: boolean
  messageInputRef: RefObject<HTMLDivElement>
  chatStore: ChatDataType
}

// Emoji Picker Component for selecting emojis
const EmojiPicker = ({
  onChange,
  isBelowSmScreen,
  openEmojiPicker,
  setOpenEmojiPicker,
  anchorRef
}: {
  onChange: (value: string) => void
  isBelowSmScreen: boolean
  openEmojiPicker: boolean
  setOpenEmojiPicker: (value: boolean | ((prevVar: boolean) => boolean)) => void
  anchorRef: RefObject<HTMLButtonElement>
}) => {
  return (
    <>
      <Popper
        open={openEmojiPicker}
        transition
        disablePortal
        placement='top-start'
        className='z-[12]'
        anchorEl={anchorRef.current}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'top-start' ? 'right top' : 'left top' }}>
            <Paper>
              <ClickAwayListener onClickAway={() => setOpenEmojiPicker(false)}>
                <span>
                  <Picker
                    emojiSize={18}
                    theme='light'
                    data={data}
                    maxFrequentRows={1}
                    onEmojiSelect={(emoji: any) => {
                      onChange(emoji.native)
                      setOpenEmojiPicker(false)
                    }}
                    {...(isBelowSmScreen && { perLine: 8 })}
                  />
                </span>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

const SendMsgForm = ({ dispatch, activeUser, isBelowSmScreen, messageInputRef, chatStore }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [file, setFile] = useState<File | null>()
  const [fileError, setFileError] = useState<string | null>(null)
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false)
  const [msg, setMsg] = useState('')
  const { profileUser, contacts } = chatStore
  const scrollRef = useRef(null)
  const [uploadStatus, setUploadStatus] = useState<'ready' | 'uploading' | 'completed' | 'error'>('ready')
  const [progress, setProgress] = useState(0)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)

  // Vars
  const open = Boolean(anchorEl)

  // Mqtt
  const mqttClient = useMqttClient({
    username: profileUser.fullName
  })

  const handleToggle = () => {
    setOpenEmojiPicker(prevOpen => !prevOpen)
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(prev => (prev ? null : event.currentTarget))
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  console.log('File--->', file)

  const handleSendMsg = (event: FormEvent | KeyboardEvent, msg: string) => {
    event.preventDefault()
    if (msg.trim() !== '') {
      // Find contact details from contacts array
      const contactDetails = contacts.find(contact => contact.chatRoomId === activeUser.chatRoomId)
      const messageData = {
        messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique message ID
        senderId: profileUser.id,
        receiverId: activeUser.id,
        chatRoomId: contactDetails?.chatRoomId,
        message: msg,
        time: new Date().toISOString(),
        msgStatus: { isSent: true, isDelivered: false, isSeen: false }
      }

      // const chatTopic = `carekey/chat/${profileUser.id}/${activeUser.id}`
      const chatTopic = `carekey/chat/${profileUser.fullName.replaceAll(' ', '_')}-${profileUser.id}/${activeUser?.fullName.replaceAll(' ', '_')}-${activeUser?.id}`
      if (mqttClient.isConnected) {
        mqttClient.publish(chatTopic, JSON.stringify(messageData))
        dispatch(sendMsg({ msg, attachmentFile: null })) // Pass full messageData to redux
        setMsg('')
      } else {
        console.warn('Message not sent: MQTT not connected')
        // Optionally show a user-friendly error message
      }
    }
  }

  const handleInputEndAdornment = () => {
    return (
      <div className='flex items-center gap-1'>
        {isBelowSmScreen ? (
          <>
            <IconButton
              id='option-menu'
              aria-haspopup='true'
              {...(open && { 'aria-expanded': true, 'aria-controls': 'share-menu' })}
              onClick={handleClick}
              ref={anchorRef}
            >
              <i className='bx-dots-vertical-rounded text-textPrimary' />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              {/* <MenuItem
                onClick={() => {
                  handleToggle()
                  handleClose()
                }}
              >
                <i className='bx-smile' />
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <i className='bx-microphone' />
              </MenuItem> */}
              <MenuItem onClick={handleClose} className='p-0'>
                <label htmlFor='upload-img' className='plb-2 pli-4'>
                  <i className='bx-paperclip' />
                  <input
                    hidden
                    type='file'
                    id='upload-img'
                    accept='image/*,.pdf,.doc,.docx,video/*,.txt,.xlsx,.xls,.pptx,.ppt,.csv,.zip'
                    onChange={e => handleFileChange(e)}
                  />
                </label>
              </MenuItem>
            </Menu>
            <EmojiPicker
              anchorRef={anchorRef}
              openEmojiPicker={openEmojiPicker}
              setOpenEmojiPicker={setOpenEmojiPicker}
              isBelowSmScreen={isBelowSmScreen}
              onChange={value => {
                setMsg(msg + value)

                if (messageInputRef.current) {
                  messageInputRef.current.focus()
                }
              }}
            />
          </>
        ) : (
          <>
            {/* <IconButton ref={anchorRef} onClick={handleToggle}>
              <i className='bx-smile cursor-pointer text-textPrimary' />
            </IconButton> */}
            {/* <EmojiPicker
              anchorRef={anchorRef}
              openEmojiPicker={openEmojiPicker}
              setOpenEmojiPicker={setOpenEmojiPicker}
              isBelowSmScreen={isBelowSmScreen}
              onChange={value => {
                setMsg(msg + value)

                if (messageInputRef.current) {
                  messageInputRef.current.focus()
                }
              }}
            />
            <IconButton>
              <i className='bx-microphone text-textPrimary' />
            </IconButton> */}
            <IconButton component='label' htmlFor='upload-img-desktop'>
              <i className='bx-paperclip text-textPrimary' />
              <input
                hidden
                type='file'
                id='upload-img-desktop'
                accept='image/*,.pdf,.doc,.docx,video/*,.txt,.xlsx,.xls,.pptx,.ppt,.csv,.zip'
                onChange={e => handleFileChange(e)}
              />
            </IconButton>
          </>
        )}
        {isBelowSmScreen ? (
          <CustomIconButton variant='contained' color='primary' type='submit'>
            <i className='bx-paper-plane' />
          </CustomIconButton>
        ) : (
          <Button variant='contained' color='primary' type='submit' endIcon={<i className='bx-paper-plane' />}>
            Send
          </Button>
        )}
      </div>
    )
  }

  useEffect(() => {
    setMsg('')
  }, [activeUser.id])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFileError('No file selected')
      setFile(null)
      return
    }

    const file = e.target.files[0]
    const MAX_SIZE = 12 * 1024 * 1024 // 12 mb max file size
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'video/mp4',
      'video/mpeg',
      'video/avi',
      'video/mkv',
      'video/webm',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'text/csv',
      'application/zip'
    ]

    if (file.size > MAX_SIZE) {
      setFileError('File too large')
      return
    }

    if (!allowedTypes.includes(file.type)) {
      setFileError('File type not supported')
      return
    }

    console.log('Event File Handle--->', file)
    setFile(file)
  }

  const readFileAsDataURL = (file: File): Promise<string> => {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const base64ToBlob = (base64String: string, contentType: string) => {
    const sliceSize = 1024
    const byteCharacters = atob(base64String)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize)

      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    return new Blob(byteArrays, { type: contentType })
  }

  const handleUpload = async (event: FormEvent, msg: string) => {
    event.preventDefault()
    setUploadStatus('uploading')
    try {
      // Get pre-signed URL
      const preSignedUrl = await api.post('/upload-document/get-signed-chat-put-url', [file?.name])

      // Prepare the file data
      const thumbUrl = await readFileAsDataURL(file as File)
      const base64Data = thumbUrl.split(',')
      const mimeType = base64Data[0].match(/:(.*?);/)![1]
      const blob = base64ToBlob(base64Data[1], mimeType)

      // Upload with progress tracking
      const options = {
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setProgress(percentCompleted)
          }
        },
        headers: {
          'Content-Type': mimeType
        }
      }

      const s3UploadRes = await axios.put(preSignedUrl.data[0].url, blob, options)
      if (s3UploadRes.status === 200) {
        console.log('File uploaded successfully:', preSignedUrl.data[0].key)
        const contactDetails = contacts.find(contact => contact.chatRoomId === activeUser.chatRoomId)
        const messageData = {
          messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique message ID
          senderId: profileUser.id,
          receiverId: activeUser.id,
          chatRoomId: contactDetails?.chatRoomId,
          message: msg || file?.name,
          attachmentFile: { fileKey: preSignedUrl.data[0].key, fileName: file?.name, mimeType: file?.type },
          time: new Date().toISOString(),
          msgStatus: { isSent: true, isDelivered: false, isSeen: false }
        }

        // const chatTopic = `carekey/chat/${profileUser.id}/${activeUser.id}`
        const chatTopic = `carekey/chat/${profileUser.fullName.replaceAll(' ', '_')}-${profileUser.id}/${activeUser?.fullName.replaceAll(' ', '_')}-${activeUser?.id}`
        if (mqttClient.isConnected) {
          mqttClient.publish(chatTopic, JSON.stringify(messageData))
          console.log('chatTopic--->', chatTopic, messageData)
          dispatch(
            sendMsg({
              msg: msg || (file?.name as string),
              attachmentFile: {
                fileKey: preSignedUrl.data[0].key,
                fileName: file?.name as string,
                mimeType: file?.type as string
              }
            })
          ) // Pass full messageData to redux
          setMsg('')
        } else {
          console.warn('Message not sent: MQTT not connected')
          // Optionally show a user-friendly error message
        }
        setUploadStatus('completed')
        setFile(null)
        setProgress(0)
      } else {
        throw new Error('File upload failed')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadStatus('error')
    } finally {
      setUploadStatus('ready')
      setFile(null)
    }
  }

  return (
    <>
      <CustomAlert
        AlertProps={{
          message: fileError ? fileError : '',
          status: 400,
          severity: 'error'
        }}
        openAlert={fileError ? true : false}
        setOpenAlert={() => setFileError(null)}
      />
      <form autoComplete='off' onSubmit={event => (!file ? handleSendMsg(event, msg) : handleUpload(event, msg))}>
        {file && (
          <Box sx={{ px: 6, display: 'flex', gap: 3, alignItems: 'center' }}>
            <FileProgress
              file={file}
              onRemove={() => {
                setFile(null)
              }}
              progress={progress}
              uploadStatus={uploadStatus}
            />
          </Box>
        )}
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder='Type a message'
          value={msg}
          className='p-6'
          onChange={e => setMsg(e.target.value)}
          sx={{
            '& fieldset': { border: '0' },
            '& .MuiOutlinedInput-root': {
              background: 'var(--mui-palette-background-paper)',
              boxShadow: 'var(--mui-customShadows-xs) !important'
            }
          }}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              !file ? handleSendMsg(e, msg) : handleUpload(e, msg)
            }
          }}
          size='small'
          inputRef={messageInputRef}
          slotProps={{ input: { endAdornment: handleInputEndAdornment() } }}
        />
      </form>
    </>
  )
}

export default SendMsgForm

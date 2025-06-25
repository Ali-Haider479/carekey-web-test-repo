// React Imports
import { useRef, useState, useEffect } from 'react'
import type { FormEvent, KeyboardEvent, RefObject, MouseEvent } from 'react'

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
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false)
  const [msg, setMsg] = useState('')
  const { profileUser, contacts } = chatStore
  const scrollRef = useRef(null)

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
        dispatch(sendMsg({ msg })) // Pass full messageData to redux
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
                  <input hidden type='file' id='upload-img' />
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
            <IconButton component='label' htmlFor='upload-img'>
              <i className='bx-paperclip text-textPrimary' />
              <input hidden type='file' id='upload-img' />
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

  return (
    <form autoComplete='off' onSubmit={event => handleSendMsg(event, msg)}>
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
            handleSendMsg(e, msg)
          }
        }}
        size='small'
        inputRef={messageInputRef}
        slotProps={{ input: { endAdornment: handleInputEndAdornment() } }}
      />
    </form>
  )
}

export default SendMsgForm

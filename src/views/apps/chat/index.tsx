'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// MUI Imports
import Backdrop from '@mui/material/Backdrop'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

// Type Imports
import type { RootState } from '@/redux-store'

// Slice Imports
import { fetchChatRooms, getActiveUserData, updateProfileFromSession } from '@/redux-store/slices/chat'

// Component Imports
import SidebarLeft from './SidebarLeft'
import ChatContent from './ChatContent'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'
import { useAppDispatch } from '@/hooks/useDispatch'
import { useSession } from 'next-auth/react'

const ChatWrapper = () => {
  // States
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()

  // Refs
  const messageInputRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { settings } = useSettings()
  const dispatch = useAppDispatch()

  const chatStore: any = useSelector((state: RootState) => state.chatReducer)
  const isBelowLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const isInitialFetchRef = useRef(false)
  const [isSessionLoaded, setIsSessionLoaded] = useState(false)

  // Get active user’s data
  // useEffect(() => {
  //   if (session?.user) {
  //     dispatch(
  //       updateProfileFromSession({
  //         id: session.user.id,
  //         userName: session.user.userName
  //       })
  //     )
  //   }
  //   // dispatch(fetchChatRooms(loggedInUserId))
  // }, [session, dispatch])

  useEffect(() => {
    // Check if session exists and hasn't been processed yet
    if (session?.user && !isInitialFetchRef.current && !isSessionLoaded) {
      isInitialFetchRef.current = true // Mark that we've started the fetch
      setIsSessionLoaded(true)

      // Update profile and fetch chat rooms
      dispatch(
        updateProfileFromSession({
          id: session.user.id,
          userName: session.user.userName,
          profileImageUrl: session.user.profileImageUrl,
          role: session.user.userRoles.title
        })
      )
      dispatch(fetchChatRooms(session.user.id))
    }
  }, [session, dispatch, isSessionLoaded])

  const activeUser = (id: number) => {
    dispatch(getActiveUserData(id))
  }

  // useEffect(() => {
  //   dispatch(fetchChatRooms(loggedInUserId))
  //   // dispatch(fetchChatHistory(1))
  // }, [dispatch])

  // Focus on message input when active user changes
  useEffect(() => {
    if (chatStore.activeUser?.id !== null && messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }, [chatStore.activeUser])

  // Close backdrop when sidebar is open on below md screen
  useEffect(() => {
    if (!isBelowMdScreen && backdropOpen && sidebarOpen) {
      setBackdropOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowMdScreen])

  // Open backdrop when sidebar is open on below sm screen
  useEffect(() => {
    if (!isBelowSmScreen && sidebarOpen) {
      setBackdropOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowSmScreen])

  // Close sidebar when backdrop is closed on below md screen
  useEffect(() => {
    if (!backdropOpen && sidebarOpen) {
      setSidebarOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropOpen])

  console.log('CHAT STORE', chatStore)
  return (
    <div
      className={classNames(commonLayoutClasses.contentHeightFixed, 'flex is-full overflow-hidden rounded relative', {
        border: settings.skin === 'bordered',
        'shadow-md': settings.skin !== 'bordered'
      })}
    >
      <SidebarLeft
        chatStore={chatStore}
        getActiveUserData={activeUser}
        dispatch={dispatch}
        backdropOpen={backdropOpen}
        setBackdropOpen={setBackdropOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowSmScreen={isBelowSmScreen}
        messageInputRef={messageInputRef}
      />

      <ChatContent
        chatStore={chatStore}
        dispatch={dispatch}
        backdropOpen={backdropOpen}
        setBackdropOpen={setBackdropOpen}
        setSidebarOpen={setSidebarOpen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowSmScreen={isBelowSmScreen}
        messageInputRef={messageInputRef}
      />

      <Backdrop open={backdropOpen} onClick={() => setBackdropOpen(false)} className='absolute z-10' />
    </div>
  )
}

export default ChatWrapper

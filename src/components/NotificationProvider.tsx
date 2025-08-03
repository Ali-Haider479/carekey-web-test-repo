'use client'

import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useMqttClient } from '@/hooks/useMqtt'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { addNotification, setChatUnReadMessageStatus, setNotificationCount } from '@/redux-store/slices/notification'
import { RootState } from '@/redux-store'

const notificationSound = new Audio('/sounds/notification.mp3')

interface AuthUser {
  id?: string
  [key: string]: any
}

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { subscribe, unsubscribe, isConnected } = useMqttClient({ username: 'placeholder' }) // Adjust username if needed
  const router = useRouter()
  const dispatch = useDispatch()
  const notificationCount = useSelector((state: RootState) => state.notificationReducer.notificationCount)

  // const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  // Safely retrieve auth user from localStorage
  let authUser: AuthUser = {}
  try {
    const storedUser = localStorage.getItem('AuthUser')
    if (storedUser) {
      authUser = JSON.parse(storedUser)
    }
  } catch (error) {
    console.error('Error parsing AuthUser from localStorage:', error)
  }

  // const Msg = ({ data }: any) => {
  //     return (
  //         <div className="msg-container">
  //             <p className="msg-title">{data.title}</p>
  //             <p className="msg-description">{data.text}</p>
  //         </div>
  //     );
  // };

  useEffect(() => {
    console.log('MQTT Connection Status:', isConnected, 'User ID:', authUser.id)
    if (authUser.id && isConnected) {
      const topic = `carekey/notifications/${authUser.id}`
      console.log('Subscribing to topic:', topic)
      const handleNotification = async (message: string) => {
        console.log('SUBSCRIBE===', message)
        const Msg = ({
          data,
          closeToast
        }: {
          data: { title: string; text: string; notificationData?: any }
          closeToast?: () => void
        }) => {
          const isChat = data.notificationData?.type === 'chat'
          return (
            <div
              className='flex items-start p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer max-w-sm'
              onClick={() => {
                if (data.notificationData?.path) {
                  router.push(data.notificationData.path)
                  closeToast?.()
                }
              }}
            >
              <div className='flex-shrink-0'>
                {isChat ? (
                  <svg className='w-6 h-6 text-blue-500' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z' />
                    <path d='M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z' />
                  </svg>
                ) : (
                  <svg className='w-6 h-6 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm0-10a1 1 0 00-1 1v4a1 1 0 002 0V7a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z' />
                  </svg>
                )}
              </div>
              <div className='ml-3 flex-1'>
                <p className='text-sm font-semibold text-gray-900 truncate'>{data.title}</p>
                <p className='text-sm text-gray-600 line-clamp-2'>{data.text}</p>
              </div>
              <button
                className='ml-2 text-gray-400 hover:text-gray-600 focus:outline-none rounded-full p-1 hover:bg-gray-100 transition-colors'
                onClick={e => {
                  e.stopPropagation()
                  closeToast?.()
                }}
              >
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' />
                </svg>
              </button>
            </div>
          )
        }
        try {
          const notification = JSON.parse(message)
          const notificationData = {
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            created_at: notification.created_at,
            is_read: notification.is_read ?? false // Default to false if not provided
          }

          // Handle chat notifications
          if (notification.data?.type === 'chat') {
            dispatch(setChatUnReadMessageStatus(true))
            // try {
            //   const response = await api.get(`chat/unread-messages-count/${authUser.id}`);
            //   dispatch(setChatUnReadMessageStatus(response.data));
            // } catch (error) {
            //   console.error('Error fetching unread message count:', error);
            // }
          } else {
            // Handle non-chat notifications
            dispatch(addNotification(notificationData))
            dispatch(setNotificationCount(notificationCount + 1))
          }

          toast(Msg, {
            position: 'bottom-right',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            theme: 'colored',
            className: 'mt-2 bg-transparent shadow-none', // Remove background and shadow
            closeButton: false,
            bodyClassName: 'p-0', // Remove padding
            data: { title: notification.title, text: notification.body },
            // onClick: () => {
            //     if (notification.data?.path) {
            //         router.push(notification.data.path) // Navigate to path in data
            //     }
            // }
            onOpen: () => {
              notificationSound.play().catch(error => {
                console.error('Error playing notification sound:', error)
              })
            }
          })
        } catch (error) {
          console.error('Error parsing MQTT notification:', error)
          toast.error('Failed to display notification', {
            position: 'bottom-right',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            theme: 'light',
            className: 'mt-2'
          })
        }
      }
      subscribe(topic, handleNotification)
      return () => unsubscribe(topic)
    }
  }, [authUser.id, isConnected, subscribe, unsubscribe, router])

  return <>{children}</>
}

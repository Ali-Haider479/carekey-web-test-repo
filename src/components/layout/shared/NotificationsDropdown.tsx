'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'
import type { MouseEvent, ReactNode } from 'react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'
import type { Theme } from '@mui/material/styles'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { CustomAvatarProps } from '@core/components/mui/Avatar'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import api from '@/utils/api'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { setNotificationsData, setNotificationCount } from '@/redux-store/slices/notification'

export type NotificationsType = {
  title: string
  subtitle: string
  time: string
  read: boolean
} & (
    | {
      avatarImage?: string
      avatarIcon?: never
      avatarText?: never
      avatarColor?: never
      avatarSkin?: never
    }
    | {
      avatarIcon?: string
      avatarColor?: ThemeColor
      avatarSkin?: CustomAvatarProps['skin']
      avatarImage?: never
      avatarText?: never
    }
    | {
      avatarText?: string
      avatarColor?: ThemeColor
      avatarSkin?: CustomAvatarProps['skin']
      avatarImage?: never
      avatarIcon?: never
    }
  )

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const getAvatar = (
  params: Pick<NotificationsType, 'avatarImage' | 'avatarIcon' | 'title' | 'avatarText' | 'avatarColor' | 'avatarSkin'>
) => {
  const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params

  if (avatarImage) {
    return <Avatar src={avatarImage} />
  } else if (avatarIcon) {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        <i className={avatarIcon} />
      </CustomAvatar>
    )
  } else {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        {avatarText || getInitials(title)}
      </CustomAvatar>
    )
  }
}

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const notificationCount = useSelector((state: RootState) => state.notificationReducer.notificationCount);
  const notificationsData = useSelector((state: RootState) => state.notificationReducer.notificationsData);
  // States
  const [open, setOpen] = useState(false)

  // Vars
  const readAll = notificationsData.every(notification => notification.is_read)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  // Hooks
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const { settings } = useSettings()

  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        const [notificationsRes, notificationCountRes] = await Promise.all([
          api.get(`notification/list/${authUser.id}`),
          api.get(`notification/unread-count/${authUser.id}`),
        ]);

        dispatch(setNotificationsData(notificationsRes.data.notifications));
        dispatch(setNotificationCount(notificationCountRes.data));
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error('Failed to fetch notification data:', error);
      }
    }
    fetchNotificationData();
  }, [dispatch])

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }


  const readAllNotifications = async () => {
    try {
      const response = await api.patch(`/notification/read/${authUser.id}`)
      console.log(response.data)
      const newNotificationsData = notificationsData.map(notification => ({
        ...notification,
        is_read: true, // Mark all as read
      }));
      console.log('Updated notifications:', newNotificationsData);
      dispatch(setNotificationsData(newNotificationsData));
      dispatch(setNotificationCount(0))
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    const adjustPopoverHeight = () => {
      if (ref.current) {
        // Calculate available height, subtracting any fixed UI elements' height as necessary
        const availableHeight = window.innerHeight - 100

        ref.current.style.height = `${Math.min(availableHeight, 550)}px`
      }
    }

    window.addEventListener('resize', adjustPopoverHeight)
  }, [])

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
        <Badge
          color='error'
          className='cursor-pointer'
          variant='dot'
          overlap='circular'
          invisible={notificationCount === 0}
          sx={{
            '& .MuiBadge-dot': { top: 6, right: 5, boxShadow: 'var(--mui-palette-background-paper) 0px 0px 0px 2px' }
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='bx-bell' />
        </Badge>
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        ref={ref}
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
            className: 'is-full !mbs-4 z-[1] max-bs-[550px] bs-[550px]',
            modifiers: [
              {
                name: 'preventOverflow',
                options: {
                  padding: themeConfig.layoutPadding
                }
              }
            ]
          }
          : { className: 'is-96 !mbs-4 z-[1] max-bs-[550px] bs-[550px]' })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className={classnames('bs-full', settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg')}>
              <ClickAwayListener onClickAway={handleClose}>
                <div className='bs-full flex flex-col'>
                  <div className='flex items-center justify-between plb-3.5 pli-5 is-full gap-2'>
                    <Typography variant='h6' className='flex-auto'>
                      Notifications
                    </Typography>
                    {notificationCount > 0 && (
                      <Chip size='small' variant='tonal' color='primary' label={`${notificationCount} New`} />
                    )}
                    <Tooltip
                      title={readAll ? 'Mark all as unread' : 'Mark all as read'}
                      placement={placement === 'bottom-end' ? 'left' : 'right'}
                      slotProps={{
                        popper: {
                          sx: {
                            '& .MuiTooltip-tooltip': {
                              transformOrigin:
                                placement === 'bottom-end' ? 'right center !important' : 'right center !important'
                            }
                          }
                        }
                      }}
                    >
                      {notificationsData.length > 0 ? (
                        <IconButton size='small' onClick={() => readAllNotifications()} className='text-textPrimary'>
                          <i className={readAll ? 'bx-envelope' : 'bx-envelope-open'} />
                        </IconButton>
                      ) : (
                        <></>
                      )}
                    </Tooltip>
                  </div>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    {notificationsData.map((notification, index) => {
                      const {
                        title,
                        body,
                        created_at,
                        is_read,
                      } = notification
                      const formattedDate = new Date(created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      });
                      return (
                        <div
                          key={index}
                          className={classnames('flex plb-3 pli-5 gap-3 cursor-pointer hover:bg-actionHover group', {
                            'border-be': index !== notificationsData.length - 1
                          })}
                        >
                          {/* {getAvatar({ avatarImage, avatarIcon, title, avatarText, avatarColor, avatarSkin })} */}
                          <div className='flex flex-col flex-auto'>
                            <Typography variant='body2' className='font-medium mbe-1' color='text.primary'>
                              {title}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' className='mbe-2'>
                              {body}
                            </Typography>
                            <Typography variant='caption'>{formattedDate}</Typography>
                          </div>
                          <div className='flex flex-col items-end gap-2'>
                            <Badge
                              variant='dot'
                              color={is_read ? 'secondary' : 'primary'}
                              className={classnames('mlb-1 mie-1', {
                                'invisible group-hover:visible': is_read
                              })}
                            />
                            {/* <i
                              className='bx-x text-xl invisible group-hover:visible'
                              onClick={e => handleRemoveNotification(e, index)}
                            /> */}
                          </div>
                        </div>
                      )
                    })}
                  </ScrollWrapper>
                  <Divider />
                  {/* <div className='plb-4 pli-5'>
                    <Button fullWidth variant='contained' size='small'>
                      View All Notifications
                    </Button>
                  </div> */}
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationDropdown

'use client'
import { useAppDispatch } from '@/hooks/useDispatch'
import { addEvent, fetchEvents, selectedEvent, updateEvent, setSelectedDate } from '@/redux-store/slices/calendar'
import { CalendarType } from '@/types/apps/calendarTypes'
import api from '@/utils/api'
import { serviceStatuses } from '@/utils/constants'
import { Add, ChevronLeft, ChevronRight } from '@mui/icons-material'
import { Box, Button, Theme, Typography, useMediaQuery, useTheme } from '@mui/material'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import EventBubble from './EventBubble'
import CalenderFilters from './CalenderFilters'
import AddEventModal from './AddScheduleSidebar'
import EventModal from './EventModal'

interface Event {
  id: string
  start: string // ISO string (e.g., '2025-07-08')
  client: any
  caregiver: any
  status: string
  title: string
  service: any
  clientService: any
  serviceAuth: any
  timelog: any
  location: string
  notes: string
  assignedHours: string
}

const Calendar = () => {
  const theme = useTheme()
  const [caregiverList, setCaregiverList] = useState<[] | any>([])
  const [clientList, setClientList] = useState<[] | any>([])
  const [serviceList, setServiceList] = useState<[] | any>([])
  const [payPeriod, setPayPeriod] = useState<[] | any>([])
  const [isEdited, setIsEdited] = useState<boolean>(false)
  const [localEvents, setLocalEvents] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [openAddEventModal, setOpenAddEventModal] = useState<boolean>(false)
  const [expandedDays, setExpandedDays] = useState(new Set())
  const [selectedClientFilter, setSelectedClientFilter] = useState('')
  const [selectedCaregiverFilter, setSelectedCaregiverFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const lightTheme = theme.palette.mode === 'light'

  // Hooks
  const dispatch = useAppDispatch()
  const calendarStore = useSelector((state: { calendarReducer: CalendarType }) => state.calendarReducer)

  const isEditedOn = () => setIsEdited(true)
  const isEditedOff = () => setIsEdited(false)

  useEffect(() => {
    const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
    console.log('LOGGED USER', authUser)
    ;(async () => {
      try {
        const response = await Promise.all([
          api.get(`/caregivers`),
          api.get(`/client`),
          api.get(`/service`),
          api.get(`/pay-period/tenant/${authUser?.tenant?.id}`)
        ])
        setCaregiverList(response[0].data)
        setClientList(response[1].data)
        setServiceList(response[2].data)
        setPayPeriod(response[3].data)
      } catch (error) {
        console.log('ERROR', error)
      }
    })()
  }, [])

  useEffect(() => {
    setLocalEvents(calendarStore.events)
  }, [calendarStore.events])

  useEffect(() => {
    if (isEdited === false) {
      console.log('Flag', isEdited)
      dispatch(fetchEvents())
    }
  }, [dispatch, isEdited])

  const filterEvent = (value: any, label: any) => {
    if (label.includes('caregiver')) {
      const filtered = localEvents.filter(event => event.caregiver?.id === value)
      setSelectedCaregiverFilter(value)
      // dispatch(filterCaregiverSchedules(value))
    } else if (label.includes('client')) {
      const filtered = localEvents.filter(event => event.client?.id === value)
      setSelectedClientFilter(value)
      // dispatch(filterClientSchedules(value))
    }
  }

  const handleAddEvent = (newEvent: any) => {
    setLocalEvents(prevEvents => [...prevEvents, ...newEvent])
    setIsEdited(false)
    dispatch(addEvent(newEvent))
  }

  const handleUpdateEvent = (updatedEvent: any) => {
    setLocalEvents(prevEvents => prevEvents.map(event => (event.id === updatedEvent.id ? updatedEvent : event)))
    dispatch(updateEvent(updatedEvent))
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad the calendar to start on Sunday
  const startPadding = getDay(monthStart)
  const paddedDays = [...Array(startPadding).fill(null), ...calendarDays]

  // Filter events based on selected client, caregiver, and status
  const filteredEvents = useMemo(() => {
    return localEvents.filter(event => {
      const clientMatch = selectedClientFilter === '' || event.client.id === selectedClientFilter
      const caregiverMatch = selectedCaregiverFilter === '' || event.caregiver.id === selectedCaregiverFilter
      const statusMatch = !statusFilter || event.status === statusFilter
      return clientMatch && caregiverMatch && statusMatch
    })
  }, [localEvents, selectedClientFilter, selectedCaregiverFilter, statusFilter])

  // Group filtered events by date
  const eventsByDate = useMemo(() => {
    return filteredEvents.reduce(
      (acc, event) => {
        const eventStartDate = event.start || event[0].start
        // const dateKey = new Date(event.start).toLocaleDateString().split('/').join('-')
        const dateKey = format(new Date(eventStartDate).toISOString(), 'M-dd-yyyy')

        if (!acc[dateKey]) {
          acc[dateKey] = []
        }
        acc[dateKey].push(event)
        return acc
      },
      {} as Record<string, typeof filteredEvents>
    )
  }, [filteredEvents])

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const handleDayClick = (day: Date | null) => {
    if (!day) return
    const dateStr = new Date(day).toISOString().split('T')[0]
    dispatch(setSelectedDate(day))
    setSelectedDate(dateStr)
    dispatch(selectedEvent(null))
    setOpenAddEventModal(true)
    isEditedOn()
  }

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDate(event.start)
    dispatch(selectedEvent(event))
    setOpenAddEventModal(true)
    isEditedOn()
  }

  const toggleDayExpansion = (dateStr: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr)
      } else {
        newSet.add(dateStr)
      }
      return newSet
    })
  }

  const expandAllDays = () => {
    console.log(Object.keys(eventsByDate))
    const daysWithMultipleEvents = Object.keys(eventsByDate).filter(dateStr => {
      const dayEvents = eventsByDate[dateStr] || []
      return dayEvents.length >= 2 // Only expand days with more than 2 events
    })
    setExpandedDays(new Set(daysWithMultipleEvents))
  }

  const collapseAllDays = () => {
    setExpandedDays(new Set())
  }

  const renderDayEvents = (day: { toISOString: () => string }) => {
    if (!day) return null
    const dateStr = format(day.toISOString(), 'M-dd-yyyy') //.split('T')[0]
    const dayEvents = eventsByDate[dateStr] || []
    const isExpanded = expandedDays.has(dateStr)

    // Apply current filters to day events
    const filteredEvents = dayEvents.filter((event: Event) => {
      if (selectedClientFilter && event.client.id !== selectedClientFilter) return false
      if (selectedCaregiverFilter && event.caregiver.id !== selectedCaregiverFilter) return false
      if (statusFilter && event.status !== statusFilter) return false
      return true
    })

    // Show 2 events by default with better spacing
    const maxVisible = 1

    if (filteredEvents.length === 0) return null

    const visibleEvents = isExpanded ? filteredEvents : filteredEvents.slice(0, maxVisible)
    const hiddenCount = filteredEvents.length - maxVisible

    return (
      <div className='flex-1 flex flex-col space-y-1 mt-1 min-h-10'>
        <div className='space-y-1 overflow-hidden'>
          {visibleEvents.map((event: any, index: number) => (
            <EventBubble key={event.id} event={event} onClick={e => handleEventClick(event, e)} onDelete={() => {}} />
          ))}
        </div>

        {!isExpanded && hiddenCount > 0 && (
          <div className='mt-auto'>
            <button
              onClick={e => {
                e.stopPropagation()
                toggleDayExpansion(dateStr)
              }}
              className='w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 py-1 px-1 rounded bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors font-medium border border-blue-200 dark:border-blue-800'
            >
              +{hiddenCount} more event{hiddenCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        {isExpanded && filteredEvents.length > maxVisible && (
          <div className='mt-2'>
            <button
              onClick={e => {
                e.stopPropagation()
                toggleDayExpansion(dateStr)
              }}
              className='w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 py-1 px-1 rounded bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium border border-gray-200 dark:border-gray-600'
            >
              ▲ Show less
            </button>
          </div>
        )}
      </div>
    )
  }

  const getFilteredEventCount = () => {
    return filteredEvents.length
  }

  const getSelectedStatusName = () => {
    if (!statusFilter) return null
    const status = serviceStatuses.find(s => s.id === statusFilter)
    return status ? status.name : null
  }
  return (
    <>
      <Box
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 1,
          boxShadow: 1,
          border: `1px solid ${theme.palette.background.paperChannel}`,
          mb: 4,
          p: 4
        }}
      >
        <CalenderFilters filterEvent={filterEvent} />
      </Box>

      <Box
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 1,
          boxShadow: 1,
          border: `1px solid ${theme.palette.background.paperChannel}`,
          mb: 6
        }}
      >
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 border-b ${theme.palette.mode === 'light' ? 'border-gray-200' : 'border-gray-700'} gap-2`}
        >
          <Box className='flex items-center justify-center sm:justify-start space-x-4'>
            <Button
              onClick={() => navigateMonth(-1)}
              className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation'
            >
              <ChevronLeft className='w-5 h-5 text-gray-600 dark:text-gray-400' />
            </Button>

            <Typography
              variant='h5'
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 'bold',
                color: theme.palette.text.primary,
                textAlign: 'center'
              }}
            >
              {format(currentDate, 'MMMM yyyy')}
            </Typography>

            <Button
              onClick={() => navigateMonth(1)}
              className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation'
            >
              <ChevronRight className='w-5 h-5 text-gray-600 dark:text-gray-400' />
            </Button>
          </Box>

          <div className='flex flex-col items-center sm:items-end space-y-2'>
            <Typography
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                color: theme.palette.text.secondary,
                textAlign: { xs: 'center', sm: 'right' }
              }}
            >
              {getFilteredEventCount()} services{' '}
              {selectedClientFilter || selectedCaregiverFilter || statusFilter ? 'filtered' : 'scheduled'} this month
              {statusFilter && (
                <Box sx={{ fontSize: '0.75rem', color: theme.palette.grey[400], mt: 1 }}>
                  ({getSelectedStatusName()} only)
                </Box>
              )}
            </Typography>

            {/* Expand/Collapse All Button */}
            <div className='flex space-x-2'>
              {expandedDays.size > 0 ? (
                <Button
                  onClick={collapseAllDays}
                  variant='text'
                  className={`text-xs px-3 py-1 ${lightTheme ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gray-700  text-gray-300  hover:bg-gray-600'} rounded-md transition-colors font-medium`}
                >
                  Collapse All
                </Button>
              ) : (
                <Button
                  onClick={expandAllDays}
                  variant='text'
                  className={`text-xs px-3 py-1 ${lightTheme ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-blue-900/20  text-blue-400  hover:bg-blue-900/40'} rounded-md transition-colors font-medium`}
                >
                  Expand All
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Service Status Legend - Mobile Responsive & Clickable */}
        <div
          className={`p-2 sm:p-3 border-b ${theme.palette.mode === 'light' ? 'border-gray-200' : 'border-gray-700'}`}
        >
          <div className='flex items-center justify-between mb-3'>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 'medium', color: theme.palette.text.secondary }}>
              Service Status (Click to Filter)
            </Typography>
            {statusFilter && (
              <Button variant='text' onClick={() => setStatusFilter(null)} className='text-xs font-medium'>
                Show All
              </Button>
            )}
          </div>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box className='flex flex-wrap gap-1 sm:gap-2'>
              {serviceStatuses.map(status => (
                <Button
                  key={status.id}
                  onClick={() => setStatusFilter(statusFilter === status.id ? null : status.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:shadow-md ${
                    statusFilter === status.id ? 'ring-2 ring-offset-1 transform scale-105' : 'hover:scale-105'
                  }`}
                  sx={{
                    backgroundColor: statusFilter === status.id ? status.color : status.bgColor,
                    borderColor: status.color,
                    color: statusFilter === status.id ? 'white' : status.color
                    //   ringColor: statusFilter === status.id ? status.color : 'transparent'
                  }}
                >
                  <div
                    className='w-2 h-2 rounded-full'
                    style={{
                      backgroundColor: statusFilter === status.id ? 'white' : status.color
                    }}
                  />
                  <span className='font-bold text-xs'>{status.name}</span>
                </Button>
              ))}
            </Box>
            <Button
              variant='contained'
              startIcon={<Add />}
              size='small'
              sx={{ alignSelf: 'flex-end' }}
              onClick={() => setOpenAddEventModal(true)}
            >
              Add Event
            </Button>
          </Box>

          {statusFilter && (
            <div className='mt-2 text-xs text-gray-600 dark:text-gray-400'>
              Showing only <strong>{serviceStatuses.find(s => s.id === statusFilter)?.name}</strong> services
            </div>
          )}
        </div>

        {/* Calendar Grid - Mobile Responsive */}
        <Box className='p-1 sm:p-2'>
          {/* Day Headers */}
          <Box component={'div'} className='grid grid-cols-7 gap-px mb-1'>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className='py-1 px-1 text-center'>
                <span className='text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400'>
                  {window.innerWidth < 640 ? day.slice(0, 1) : day}
                </span>
              </div>
            ))}
          </Box>

          {/* Calendar Days */}
          <Box className='grid grid-cols-7 gap-1 rounded-lg overflow-visible relative p-1'>
            {paddedDays.map((day, index) => {
              if (!day) {
                return <Box key={index} className='h-24 sm:h-32 md:h-40 rounded-md' />
              }

              const isCurrentMonth = isSameMonth(day, currentDate)
              const isCurrentDay = isToday(day)
              const dateStr = format(day.toISOString(), 'M-dd-yyyy')
              const dayEvents = eventsByDate[dateStr] || []
              const isExpanded = expandedDays.has(dateStr)
              console.log(expandedDays.has(dateStr), expandedDays, dateStr)

              // Consistent height for better uniformity
              const getHeightClass = () => {
                if (isExpanded) {
                  // Use auto height when expanded to fit all content
                  return 'h-auto min-h-[180px]'
                }
                // Uniform height for all days - enough space for 2 events + expand button
                return 'h-32 sm:h-40 md:h-48'
              }

              return (
                <Box
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={`
                    ${getHeightClass()} p-2 cursor-pointer transition-all duration-300 touch-manipulation rounded-md border flex flex-col
                    ${
                      isExpanded
                        ? 'overflow-visible z-10 shadow-lg border-blue-300 dark:border-blue-500 relative'
                        : `overflow-hidden border-[${theme.palette.background.paperChannel}]`
                    }
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                    ${isCurrentDay ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                  `}
                  sx={{
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.background.default
                        : theme.palette.customColors.bodyBg,
                    ...(!isExpanded && {
                      '&:hover': {
                        bgcolor: theme => (theme.palette.mode === 'dark' ? 'secondary.dark' : 'secondary.light')
                      }
                    })
                  }}
                >
                  <div className='flex-shrink-0 text-center mb-1'>
                    {/* Centered Date */}
                    <div
                      className={`
                      text-base sm:text-lg font-bold
                      ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : `${theme.palette.mode === 'dark' ? `text-[${theme.palette.secondary.main}]` : `text-[${theme.palette.secondary.light}]`} `}
                    `}
                    >
                      {format(day, 'd')}
                    </div>
                    {/* Service Count - Show filtered count */}
                    {dayEvents.length > 0 &&
                      (() => {
                        // Get filtered events for this day
                        const filteredEvents = dayEvents.filter(
                          (event: { clientId: string; caregiverId: string; status: string }) => {
                            if (selectedClientFilter && event.clientId !== selectedClientFilter) return false
                            if (selectedCaregiverFilter && event.caregiverId !== selectedCaregiverFilter) return false
                            if (statusFilter && event.status !== statusFilter) return false
                            return true
                          }
                        )

                        if (filteredEvents.length > 0) {
                          return (
                            <div className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
                              {filteredEvents.length} service{filteredEvents.length !== 1 ? 's' : ''}
                            </div>
                          )
                        }
                        return null
                      })()}
                  </div>

                  {renderDayEvents(day)}
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
      <AddEventModal
        dispatch={dispatch}
        calendarStore={{ ...calendarStore, events: localEvents }}
        addEventSidebarOpen={openAddEventModal}
        handleAddEventSidebarToggle={() => setOpenAddEventModal(!openAddEventModal)}
        caregiverList={caregiverList}
        clientList={clientList}
        serviceList={serviceList}
        setIsEditedOff={isEditedOff}
        isEdited={isEdited}
        handleAddEvent={handleAddEvent}
        handleUpdateEvent={handleUpdateEvent}
        payPeriod={payPeriod}
      />
    </>
  )
}

export default Calendar

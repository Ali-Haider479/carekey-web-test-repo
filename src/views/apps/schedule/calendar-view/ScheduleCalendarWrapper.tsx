'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { useMediaQuery } from '@mui/material'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import { useDispatch, useSelector } from 'react-redux'

// Type Imports
import type { CalendarColors, CalendarType } from '@/types/apps/calendarTypes'

// Component Imports
import ScheduleCalendar from './ScheduleCalendar'
import ScheduleSidebarLeft from './ScheduleSidebarLeft'
import AddScheduleSidebar from './AddScheduleSidebar'
import { fetchEvents } from '@/redux-store/slices/calendar'
import axios from 'axios'

// CalendarColors Object
const calendarsColor: CalendarColors = {
    Personal: 'error',
    Business: 'primary',
    Family: 'warning',
    Holiday: 'success',
    ETC: 'info'
}

const AppCalendar = () => {
    // States
    const [calendarApi, setCalendarApi] = useState<null | any>(null)
    const [caregiverList, setCaregiverList] = useState<[] | any>([])
    const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)
    const [addEventSidebarOpen, setAddEventSidebarOpen] = useState<boolean>(false)

    // Hooks
    const dispatch = useDispatch()
    const calendarStore = useSelector((state: { calendarReducer: CalendarType }) => state.calendarReducer)
    const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

    const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

    const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)

    useEffect(() => {
        dispatch(fetchEvents())
    }, [dispatch])

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/caregivers`)
                const responseData = response.data
                setCaregiverList(responseData)
            } catch (error) {
                console.log('ERROR', error)
            }
        })()
    }, [])

    console.log('PARENT SCHEDULE', calendarStore.events)
    return (
        <>
            <ScheduleSidebarLeft
                mdAbove={mdAbove}
                dispatch={dispatch}
                calendarApi={calendarApi}
                calendarStore={calendarStore}
                calendarsColor={calendarsColor}
                leftSidebarOpen={leftSidebarOpen}
                handleLeftSidebarToggle={handleLeftSidebarToggle}
                handleAddEventSidebarToggle={handleAddEventSidebarToggle}
            />
            <div className='p-6 pbe-0 flex-grow overflow-visible bg-backgroundPaper rounded'>
                <ScheduleCalendar
                    dispatch={dispatch}
                    calendarApi={calendarApi}
                    calendarStore={calendarStore}
                    setCalendarApi={setCalendarApi}
                    calendarsColor={calendarsColor}
                    handleLeftSidebarToggle={handleLeftSidebarToggle}
                    handleAddEventSidebarToggle={handleAddEventSidebarToggle}
                />
            </div>
            <AddScheduleSidebar
                dispatch={dispatch}
                calendarApi={calendarApi}
                calendarStore={calendarStore}
                addEventSidebarOpen={addEventSidebarOpen}
                handleAddEventSidebarToggle={handleAddEventSidebarToggle}
                caregiverList={caregiverList}
            />
        </>
    )
}

export default AppCalendar

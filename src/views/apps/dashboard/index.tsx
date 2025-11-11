'use client'
// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports

import HorizontalWithBorder from '@/components/card-statistics/HorizontalWithBorder'
import TotalIncome from './components/TotalIncome'
import LineProfitReportChart from './components/LineProfitReportChart'
import Performance from './components/Performance'
import SalesInfoCard from './components/SalesInfoCard'
import BarChartRevenueGrowth from './components/BarChartRevenueGrowth'
import PopularInstructors from './components/PopularInstructors'
import DueInformationCard from './components/DueInformationCard'

import { Cloud, RestartAlt, CalendarMonth, CloudOutlined } from '@mui/icons-material'
import ClientsSvg from '@/@core/svg/ClientSVG'
import CaregiverSvg from '@/@core/svg/CaregiverSVG'
import UserSvg from '@/@core/svg/UserSVG'
import MissedUserSVG from '@/@core/svg/MissedUserSVG'
import CallIcon from '@mui/icons-material/Call'
import MobileFriendlyIcon from '@mui/icons-material/MobileFriendly'
import { dark } from '@mui/material/styles/createPalette'
import { Avatar, Card, CircularProgress, Theme, Typography, useTheme } from '@mui/material'
import { useEffect, useState } from 'react'
import api from '@/utils/api'
import { useSession } from 'next-auth/react'
import { useDispatch, useSelector } from 'react-redux'
import { setPlan, selectPlan } from '@/redux-store/slices/plan'

interface DashboardData {
  caregiverCount: number
  clientCount: number
  clientsWithoutServiceAuthCount: number
  clientsWithoutServiceAuth: { name: string; email: string | null }[]
}

interface ShiftsData {
  activeShiftsCount: number
  missedShiftsCount: number
}

const AppDashboard = () => {
  // const { title, stats, trendNumber, avatarIcon, color } = props
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [shiftsData, setShiftsData] = useState<ShiftsData | null>(null)
  const [tenantData, setTenantData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')
  const theme = useTheme<Theme>()
  const { data: session, update } = useSession()
  const dispatch = useDispatch()

  const plan = useSelector(selectPlan)

  console.log('CURRENT PLAN FROM DASHBOARD (REDUX):', plan)

  const tenantId = authUser?.tenant?.id

  // Fetch data from backend
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (tenantId) {
        // Fetch dashboard data (Clients, Caregivers, Waiting for SA)
        const dashboardResponse = await api.get(`/tenant/dashboard-data/${tenantId}`)
        const dashboardData = dashboardResponse?.data

        const tenantDataResponse = await api.get(`/tenant/${tenantId}`)
        const tenantData = tenantDataResponse?.data

        // Fetch shifts data (Active Shifts, Missed Shifts)
        // const shiftsResponse = await api.get(`/time-log/dashboard/active-missed-shifts/${tenantId}`);
        // const shiftsData = shiftsResponse?.data

        setDashboardData({
          caregiverCount: dashboardData.caregiverCount,
          clientCount: dashboardData.clientCount,
          clientsWithoutServiceAuthCount: dashboardData.clientsWithoutServiceAuthCount,
          clientsWithoutServiceAuth: dashboardData.clientsWithoutServiceAuth
        })
        setTenantData(tenantData)
        // setShiftsData({
        //   activeShiftsCount: shiftsData.activeShiftsCount,
        //   missedShiftsCount: shiftsData.missedShiftsCount
        // })
        setShiftsData({
          activeShiftsCount: 0,
          missedShiftsCount: 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  console.log('Session Data in Dashboard---', session)

  useEffect(() => {
    const updateSession = async () => {
      if (tenantData) {
        const tenantSubscriptionPlan = tenantData?.subscribedPlan || null
        console.log('TENANT SUBSCRIPTION PLAN---', tenantSubscriptionPlan)

        const reduxUpdate = dispatch(setPlan(tenantSubscriptionPlan))

        const updateResult = await update({
          user: {
            ...session?.user,
            subscribedPlan: tenantSubscriptionPlan?.planName,
            accessToken: session?.user?.accessToken,
            refreshToken: session?.user?.refreshToken
          }
        })

        console.log('Redux Updated result:', reduxUpdate)
      }
      setLoading(false)
    }
    updateSession()
  }, [tenantData])

  return (
    <>
      {loading ? (
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 12, lg: 12 }}>
            <div className='flex justify-center items-center h-full'>
              <CircularProgress className='mx-auto my-20' size={50} />
            </div>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={6}>
          {!plan && (
            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
              <Card className='p-6 text-center mb-0 rounded-lg w-full'>
                <div className='text-center'>
                  {/* <CloudOutlined className='mx-auto mb-4 text-[#666CFF]' style={{ fontSize: '64px' }} /> */}
                  <Typography className='text-2xl font-bold text-gray-600 mb-3'>No Active Subscription</Typography>
                  <Typography className='text-gray-600'>
                    It looks like your tenant does not have an active subscription plan. <br /> Please subscribe to a
                    plan to access all the features.
                  </Typography>
                </div>
              </Card>
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 3 }}>
            <HorizontalWithBorder
              title='Clients'
              stats={dashboardData?.clientCount?.toString() || '0'}
              avatarIcon={
                <Avatar variant='rounded' className='items-center'>
                  <ClientsSvg
                    color={theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main}
                    scale={1.5}
                  />
                </Avatar>
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <HorizontalWithBorder
              title='Caregivers'
              stats={dashboardData?.caregiverCount?.toString() || '0'}
              avatarIcon={
                <Avatar variant='rounded' className='items-center'>
                  <CaregiverSvg scale={1.3} />
                </Avatar>
              }
              color='info'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <HorizontalWithBorder
              title='Active App users'
              stats={shiftsData?.activeShiftsCount?.toString() || '0'}
              avatarIcon={
                <Avatar variant='rounded' className='items-center'>
                  <UserSvg scale={1.3} />
                </Avatar>
              }
              color='success'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <HorizontalWithBorder
              title='Missed Clients'
              stats={shiftsData?.missedShiftsCount?.toString() || '0'}
              avatarIcon={
                <Avatar variant='rounded' className='items-center'>
                  <MissedUserSVG scale={1.2} />
                </Avatar>
              }
              color='error'
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <TotalIncome />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Performance />
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 4 }}>
                <SalesInfoCard
                  title='Waiting for SA'
                  value={dashboardData?.clientsWithoutServiceAuthCount?.toString() || '0'}
                  icon={
                    <Avatar variant='rounded' className='items-center'>
                      <CalendarMonth className='text-[#FF3E1D]' />
                    </Avatar>
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 4 }}>
                <SalesInfoCard
                  title='Product updates'
                  value='11'
                  icon={
                    <Avatar variant='rounded' className='items-center'>
                      <RestartAlt className='text-[#71DD37]' />
                    </Avatar>
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 4 }}>
                <SalesInfoCard
                  title='Cloud forms'
                  value='7'
                  icon={
                    <Avatar variant='rounded' className='items-center'>
                      <CloudOutlined className='text-[#666CFF]' />
                    </Avatar>
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 6 }}>
                <BarChartRevenueGrowth />
              </Grid>
              <Grid size={{ xs: 12, md: 4, lg: 6 }}>
                <LineProfitReportChart title='Clients' />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 4 }}>
                <SalesInfoCard
                  title='EVV App'
                  value='Manual'
                  icon={
                    <Avatar variant='rounded' className='items-center'>
                      <MobileFriendlyIcon className='text-[#666CFF]' />
                    </Avatar>
                  }
                  extraClassItem='items-center'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 4 }}>
                <SalesInfoCard
                  title='Telephony'
                  value='Manual'
                  icon={
                    <Avatar variant='rounded' className='items-center'>
                      <CallIcon className='text-[#71DD37]' />
                    </Avatar>
                  }
                  extraClassItem='items-center'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 4 }}>
                <SalesInfoCard
                  title='Training'
                  value='Videos'
                  iconClass='bx-video text-[#FDB528]'
                  extraClassItem='items-center'
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <PopularInstructors clientsWithoutServiceAuth={dashboardData?.clientsWithoutServiceAuth || []} />
            <DueInformationCard />
          </Grid>
        </Grid>
      )}
    </>
  )
}

// {/* <div>Please subscribe to an active plan to view the dashboard.</div> */}

export default AppDashboard

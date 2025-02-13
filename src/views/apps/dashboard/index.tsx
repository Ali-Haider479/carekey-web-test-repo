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
import { Avatar } from '@mui/material'

const AppDashboard = () => {
  // const { title, stats, trendNumber, avatarIcon, color } = props

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 3 }}>
        <HorizontalWithBorder
          title='Clients'
          stats='11'
          avatarIcon={
            <Avatar variant='rounded' className='items-center'>
              <ClientsSvg color={`${dark ? '#7112B7' : '#4B0082'}`} scale={1.5} />
            </Avatar>
          }
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <HorizontalWithBorder
          title='Caregivers'
          stats='11'
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
          title='Active app users'
          stats='11'
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
          stats='11'
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
              value='3'
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
        <PopularInstructors />
        <DueInformationCard />
      </Grid>
    </Grid>
  )
}

export default AppDashboard

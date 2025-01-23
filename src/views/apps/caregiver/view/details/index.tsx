'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import ProfileBanner from '@/@layouts/components/horizontal/ProfileBanner'
import { Typography } from '@mui/material'

interface BottomBodyProps {
  tabContentList: Record<string, ReactElement>
}

const CaregiverDetails = ({ tabContentList }: BottomBodyProps) => {
  // States
  const [activeTab, setActiveTab] = useState('profile')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  const getTabHeading = (tabKey: string) => {
    switch (tabKey) {
      case 'profile':
        return 'Caregiver - Profile'
      case 'e-doc':
        return 'Caregiver - Electronic Documents'
      case 'forms':
        return 'Caregiver - Submitted Form'
      case 'account-history':
        return 'Caregiver - Account History'
      case 'assigned-service':
        return 'Caregiver - Assigned Services'
      case 'time-log':
        return 'Caregiver - Time Log'
      case 'schedule':
        return 'Caregiver - Schedule'
      default:
        return 'Caregiver'
    }
  }

  return (
    <>
      <TabContext value={activeTab}>
        <Typography variant='h4' gutterBottom>
          {getTabHeading(activeTab)}
        </Typography>
        <ProfileBanner
          props={{
            fullName: 'Suhanna Ibrahim',
            coverImg: '/images/pages/profile-banner.png',
            location: 'USA',
            profileImg: '/images/avatars/2.png',
            status: 'ACTIVE'
          }}
        />
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true' overRideColor='#4B0082'>
              <Tab value='profile' label='PROFILE' />
              <Tab value='e-doc' label='E-DOC' />
              <Tab value='forms' label='FORMS' />
              <Tab value='account-history' label='ACC HISTORY' />
              <Tab value='assigned-service' label='ASSIGNED SERVICE' />
              <Tab value='time-log' label='VIEW TIME LOG' />
              <Tab value='schedule' label='VIEW SCHEDULE' />
            </CustomTabList>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default CaregiverDetails

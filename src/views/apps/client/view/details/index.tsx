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

const ClientDetails = ({ tabContentList }: BottomBodyProps) => {
  // States
  const [activeTab, setActiveTab] = useState('profile')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  const shouldShowBanner = ['profile', 'e-doc', 'forms'].includes(activeTab)

  const getTabHeading = (tabKey: string) => {
    switch (tabKey) {
      case 'profile':
        return ' Profile'
      case 'e-doc':
        return '/ Electronic Documents'
      case 'forms':
        return '/ Submitted Form'
      case 'account-history':
        return '/ Account History'
      case 'time-sheets':
        return '/ Time '
      case 'service-authorization':
        return '/ Service Authorization'
      default:
        return ''
    }
  }

  return (
    <>
      <TabContext value={activeTab}>
        <Typography className='text-[34px] font-medium' gutterBottom>
          {`Client ${getTabHeading(activeTab)}`}
        </Typography>

        {shouldShowBanner && (
          <ProfileBanner
            props={{
              fullName: 'Suhanna Ibrahim',
              coverImg: '/images/pages/profile-banner.png',
              location: 'USA',
              profileImg: '/images/avatars/2.png',
              status: 'ACTIVE'
            }}
          />
        )}

        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true' overRideColor='#4B0082'>
              <Tab value='profile' label='PROFILE' />
              <Tab value='e-doc' label='E-DOC' />
              <Tab value='forms' label='FORMS' />
              <Tab value='account-history' label='ACC HISTORY' />
              <Tab value='time-sheets' label='VIEW TIME SHEETS' />
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

export default ClientDetails

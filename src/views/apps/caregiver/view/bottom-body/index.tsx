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

interface BottomBodyProps {
  tabContentList: Record<string, ReactElement>
  onTabChange: (activeTab: string) => void
}

const BottomBody = ({ tabContentList, onTabChange }: BottomBodyProps) => {
  // States
  const [activeTab, setActiveTab] = useState('profile')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
    onTabChange(value)
  }

  return (
    <>
      <TabContext value={activeTab}>
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

export default BottomBody

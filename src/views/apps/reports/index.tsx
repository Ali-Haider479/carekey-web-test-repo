'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const ReportsView = ({ tabContentList }: { tabContentList: { [key: string]: ReactElement } }) => {
  // States
  const [activeTab, setActiveTab] = useState('cost-report')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 12 }}>
          <Typography variant='h3' className='mbe-4'>
            Reports
          </Typography>
          <CustomTabList orientation='horizontal' onChange={handleChange} className='is-fit' pill='true'>
            <Tab label='COST REPORT' iconPosition='start' value='cost-report' className='flex-row justify-start' />
            <Tab
              label='SERVICE AUTH'
              iconPosition='start'
              value='service-auth-report'
              className='flex-row justify-start'
            />
            <Tab label='SCHEDULE' iconPosition='start' value='schedule-report' className='flex-row justify-start' />
            <Tab
              label='REMITTANCE REPORT'
              iconPosition='start'
              value='remittance-report'
              className='flex-row justify-start'
            />
            <Tab
              label='FINANCIAL SUMMARY'
              iconPosition='start'
              value='financial-summary'
              className='flex-row justify-start'
            />
            <Tab label='CUSTOM REPORT' iconPosition='start' value='custom-report' className='flex-row justify-start' />
          </CustomTabList>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <TabPanel value={activeTab} className='p-0'>
                {tabContentList[activeTab]}
              </TabPanel>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default ReportsView

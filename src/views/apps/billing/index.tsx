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

const BillingTabsView = ({ tabContentList }: { tabContentList: { [key: string]: ReactElement } }) => {
  // States
  const [activeTab, setActiveTab] = useState('billing-details')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 12 }}>
          <Typography variant='h3' className='mbe-4'>
            Billing Overview
          </Typography>
          <CustomTabList orientation='horizontal' onChange={handleChange} className='is-fit' pill='true'>
            <Tab
              label='BILLING DETAILS'
              // icon={<i className='bx-store-alt' />}
              iconPosition='start'
              value='billing-details'
              className='flex-row justify-start'
            />
            <Tab
              label='BILLING OVERVIEW BY PAY DATES'
              // icon={<i className='bx-credit-card' />}
              iconPosition='start'
              value='billing-overview'
              className='flex-row justify-start'
            />
            <Tab
              label='SUBMITTED BATCH STATUS'
              // icon={<i className='bx-cart' />}
              iconPosition='start'
              value='submitted-batch'
              className='flex-row justify-start'
            />
            <Tab
              label='SAVED BATCHES'
              // icon={<i className='bx-package' />}
              iconPosition='start'
              value='saved-batch'
              className='flex-row justify-start'
            />
          </CustomTabList>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <TabPanel value={activeTab} className='p-0'>
                {tabContentList[activeTab]}
              </TabPanel>
            </Grid>
            {/* <Grid size={{ xs: 12 }}>
              <div className='flex justify-end gap-4'>
                <Button variant='tonal' color='secondary'>
                  Discard
                </Button>
                <Button variant='contained'>Save Changes</Button>
              </div>
            </Grid> */}
          </Grid>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default BillingTabsView

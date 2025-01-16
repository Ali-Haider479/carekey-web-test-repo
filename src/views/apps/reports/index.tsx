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
    const [activeTab, setActiveTab] = useState('caregiver-list')

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
                    <CustomTabList orientation='horizontal' onChange={handleChange} className='is-fit' pill='true' overRideColor='#4B0082'>
                        <Tab
                            label='Careviger List'
                            // icon={<i className='bx-store-alt' />}
                            iconPosition='start'
                            value='caregiver-list'
                            className='flex-row justify-start'
                        />
                        <Tab
                            label='Client List'
                            // icon={<i className='bx-credit-card' />}
                            iconPosition='start'
                            value='client-list'
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
                    </Grid>
                </Grid>
            </Grid>
        </TabContext>
    )
}

export default ReportsView

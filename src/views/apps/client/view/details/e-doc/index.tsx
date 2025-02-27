'use client'
import CustomCheckList from '@/@core/components/mui/CustomChecklist'
import { Button, ButtonGroup, Card, CardContent, Menu, MenuItem, Tab } from '@mui/material'
import Grid from '@mui/material/Grid2'
import React, { useState } from 'react'
import InfoCard from '../../../components/InfoCard'
import CustomTabList from '@/@core/components/mui/TabList'
import AllFilesTab from './AllFilesTab'
import SentFilesTab from './SentFilesTab'
import RecievedFilesTab from './RecievedFilesTab'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'

const E_Document = () => {
  const [activeTab, setActiveTab] = useState('allFilesTab')

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={0}>
        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <InfoCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }}>
          <Card className='rounded-lg shadow-md'>
            {/* Header */}
            <div className='flex justify-center'>
              <div className='border-2 rounded-md w-[98%] mt-5 p-2'>
                <CustomTabList onChange={handleTabChange} className='w-full' pill='true'>
                  <Tab value={'allFilesTab'} label={'ALL FILES'} className='w-1/3' />
                  <Tab value={'sentFilesTab'} label={'SENT FILES'} className='w-1/3' />
                  <Tab value={'recievedFilesTab'} label={'RECIEVED FILES'} className='w-1/3' />
                </CustomTabList>
              </div>
            </div>
            <CardContent className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Electronic Documentation</h2>
              <Button variant='contained'>+ Create Folder</Button>
            </CardContent>
            <CardContent>
              <div>
                <TabPanel value='allFilesTab'>
                  <AllFilesTab />
                </TabPanel>
                <TabPanel value='sentFilesTab'>
                  <SentFilesTab />
                </TabPanel>
                <TabPanel value='recievedFilesTab'>
                  <RecievedFilesTab />
                </TabPanel>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default E_Document

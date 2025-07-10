'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import ProfileBanner from '@/@layouts/components/horizontal/ProfileBanner'
import { CircularProgress, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import api from '@/utils/api'

interface BottomBodyProps {
  tabContentList: Record<string, ReactElement>
}

const ClientDetails = ({ tabContentList }: BottomBodyProps) => {
  // States
  const [activeTab, setActiveTab] = useState('profile')
  const [clientData, setClientData] = useState<any>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { id } = useParams()

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
      case 'services':
        return '/ Services'
      case 'time-sheets':
        return '/ Time Sheets'
      case 'service-authorization':
        return '/ Service Authorization'
      case 'incidents':
        return '/ Incidents'
      case 'care-plan':
        return '/ Care Plan'
      case 'documents':
        return '/ Documents'
      default:
        return ''
    }
  }

  const fetchClientData = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/client/${id}`)
      setClientData(response.data)
    } catch (error) {
      console.error('Error getting Client Data: ', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClientData()
  }, [])

  return (
    <>
      <TabContext value={activeTab}>
        <Typography className='text-[34px] font-medium' gutterBottom>
          {`Client ${getTabHeading(activeTab)}`}
        </Typography>
        {isLoading ? (
          <Grid
            container
            size={{ xs: 12, md: 12 }}
            justifyContent='center'
            alignItems='center'
            style={{ minHeight: '200px' }}
          >
            <CircularProgress />
          </Grid>
        ) : (
          <>
            <ProfileBanner
              props={{
                fullName: `${clientData?.firstName ? clientData?.firstName : ''} ${clientData?.lastName ? clientData?.lastName : ''}`,
                coverImg: '/images/pages/profile-banner.png',
                location: `${clientData?.addresses[0]?.address?.state ? clientData?.addresses[0]?.address?.state : ''}`,
                profileImg: clientData?.profileImgUrl,
                status: 'CLIENT',
                isClient: true
              }}
            />
            <Grid container spacing={6}>
              <Grid size={{ xs: 12 }}>
                <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
                  <Tab value='profile' label='PROFILE' />
                  <Tab value='e-doc' label='E-DOC' />
                  <Tab value='forms' label='FORMS' />
                  <Tab value='services' label='SERVICES' />
                  <Tab value='account-history' label='LOGS' />
                  <Tab value='time-sheets' label='TIME SHEETS' />
                  <Tab value='service-authorization' label='SERVICE AUTH' />
                  <Tab value='incidents' label='INCIDENTS' />
                  <Tab value='care-plan' label='CARE PLAN' />
                  {/* <Tab value='documents' label='DOCUMENTS' /> */}
                </CustomTabList>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TabPanel value={activeTab} className='p-0'>
                  {tabContentList[activeTab]}
                </TabPanel>
              </Grid>
            </Grid>
          </>
        )}
      </TabContext>
    </>
  )
}

export default ClientDetails

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
import { Typography } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import api from '@/utils/api'
import CustomAlert from '@/@core/components/mui/Alter'

interface BottomBodyProps {
  tabContentList: Record<string, (props: { data: any }) => ReactElement>
}

const CaregiverDetails = ({ tabContentList }: BottomBodyProps) => {
  const { id } = useParams()
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertProps, setAlertProps] = useState({ message: '', severity: 'info' })

  // States
  const [activeTab, setActiveTab] = useState('profile')
  const [data, setData] = useState<any>()
  const router = useRouter()

  useEffect(() => {
    // Fetch data from the backend API
    const fetchData = async () => {
      try {
        const response = await api.get(`/caregivers/caregiver/${id}`)
        const fetchedData = response.data
        console.log('Caregiver Profile Data ----> ', fetchedData)
        setData(fetchedData)
      } catch (error: any) {
        // RLS return us 404 instead of 403 Forbidden error
        if (error.response?.status === 403) {
          setAlertOpen(true)
          setAlertProps({
            message: 'You do not have access to this tenant.',
            severity: 'warning'
          })
          // Redirect to homepage after a delay (e.g., 3 seconds)
          // setTimeout(() => {
          router.push('/')
        }
        console.error('Error fetching data', error)
      }
    }

    fetchData()
  }, [])

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  const getTabHeading = (tabKey: string) => {
    switch (tabKey) {
      case 'profile':
        return 'Caregiver - Profile'
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

  const fullName = [data?.firstName || '', data?.middleName || '', data?.lastName || ''].filter(Boolean).join(' ')

  console.log('Caregiver Data ------------->> ', data)

  return (
    <>
      <CustomAlert
        AlertProps={alertProps}
        openAlert={alertOpen}
        setOpenAlert={setAlertOpen}
        style={{
          padding: 0 // Only these styles will be applied
        }}
      />
      <TabContext value={activeTab}>
        <Typography variant='h4' gutterBottom>
          {getTabHeading(activeTab)}
        </Typography>
        <ProfileBanner
          props={{
            fullName: fullName,
            coverImg: '/images/pages/profile-banner.png',
            location: data?.addresses[0]?.address?.state ? data?.addresses[0]?.address?.state : '---',
            profileImg: data?.user?.profileImageUrl,
            status: 'CAREGIVER',
            isClient: false,
            userId: data?.user?.id
          }}
        />
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab value='profile' label='PROFILE' />
              <Tab value='account-history' label='ACC HISTORY' />
              <Tab value='assigned-service' label='ASSIGNED SERVICE' />
              <Tab value='time-log' label='VIEW TIME LOG' />
              <Tab value='schedule' label='VIEW SCHEDULE' />
            </CustomTabList>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]({ data: data })}
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default CaregiverDetails

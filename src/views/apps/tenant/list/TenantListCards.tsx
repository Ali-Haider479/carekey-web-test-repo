// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

// Vars
const data: UserDataType[] = [
  {
    title: 'Session',
    stats: '21,459',
    avatarIcon: 'bx-group',
    avatarColor: 'primary',
    trend: 'positive',
    trendNumber: '29%',
    subtitle: 'Total User'
  },
  {
    title: 'Paid Users',
    stats: '4,567',
    avatarIcon: 'bx-user-plus',
    avatarColor: 'error',
    trend: 'positive',
    trendNumber: '18%',
    subtitle: 'Last week analytics'
  },
  {
    title: 'Active Users',
    stats: '19,860',
    avatarIcon: 'bx-user-check',
    avatarColor: 'success',
    trend: 'negative',
    trendNumber: '14%',
    subtitle: 'Last week analytics'
  },
  {
    title: 'Pending Users',
    stats: '237',
    avatarIcon: 'bx-user-voice',
    avatarColor: 'warning',
    trend: 'positive',
    trendNumber: '42%',
    subtitle: 'Last week analytics'
  }
]

const TenantListCards = () => {
  return (
    <Grid container spacing={6}>
      {data.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <HorizontalWithSubtitle {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default TenantListCards

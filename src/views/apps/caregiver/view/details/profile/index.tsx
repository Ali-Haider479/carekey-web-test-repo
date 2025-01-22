import React from 'react'
import InfoCard from './InfoCard'
import CaregiverAboutCard from './CaregiverAboutCard'
import Grid from '@mui/material/Grid2'

const Profile = () => {
  return (
    <Grid container spacing={0}>
      <Grid size={{ xs: 12, sm: 4, md: 4 }}>
        <InfoCard />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 8 }}>
        <CaregiverAboutCard />
      </Grid>
    </Grid>
  )
}

export default Profile

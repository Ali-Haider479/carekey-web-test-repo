import Grid from '@mui/material/Grid2'
import React from 'react'
import InfoCard from '../profile/InfoCard'
import ElectronicDocumentation from './ElectronicDocumentation'

const EDocument = () => {
  return (
    <Grid container spacing={0}>
      <Grid size={{ xs: 12, sm: 4, md: 4 }}>
        <InfoCard />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 8 }}>
        <ElectronicDocumentation />
      </Grid>
    </Grid>
  )
}

export default EDocument

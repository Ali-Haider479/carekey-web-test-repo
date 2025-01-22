'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import CaregiverTable from './CaregiversTable'
import CaregiverFilters from './CaregiverFilters'

// Component Imports

const CaregiverList = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CaregiverFilters setData={() => {}} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CaregiverTable />
      </Grid>
    </Grid>
  )
}

export default CaregiverList

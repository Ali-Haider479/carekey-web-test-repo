'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import BillingDetailTable from './BillingDetailTable'
import BillingDetailFilters from './BillingDetailFilters'

// Component Imports

const BillingDetails = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <BillingDetailFilters />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <BillingDetailTable />
      </Grid>
    </Grid>
  )
}

export default BillingDetails

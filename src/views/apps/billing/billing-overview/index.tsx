'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import BillingOverviewFilters from './BillingOverviewFilters'
import BillingOverviewTable from './BillingOverviewTable'

// Component Imports

const BillingOverviewDetails = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <BillingOverviewFilters />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <BillingOverviewTable />
      </Grid>
    </Grid>
  )
}

export default BillingOverviewDetails

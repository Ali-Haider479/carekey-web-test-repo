'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import SignatureStatusTable from './SignatureStatusTable'
import SignatureStatusFilters from './SignatureStatusFilters'

// Component Imports

const SignatureDetails = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SignatureStatusFilters />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <SignatureStatusTable />
      </Grid>
      {/* <Grid size={{ xs: 12 }}>
        <BillingInformation />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TimeZone />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <StoreCurrency />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <OrderIdFormat />
      </Grid> */}
    </Grid>
  )
}

export default SignatureDetails

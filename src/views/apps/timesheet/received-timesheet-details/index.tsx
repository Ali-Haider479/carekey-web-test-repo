'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import ReceivedTimesheetTable from './ReceivedTimesheetTable'
import ReceivedTimesheetFilters from './ReceivedTimesheetFilters'

// Component Imports

const ReceivedTimsesheetDetails = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ReceivedTimesheetFilters />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ReceivedTimesheetTable />
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

export default ReceivedTimsesheetDetails

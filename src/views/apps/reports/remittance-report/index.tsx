'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import RemittanceReportFilters from './RemittanceReportFilters'
import RemittanceReportTable from './RemittanceReportTable'

// Component Imports

const RemittanceReport = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <RemittanceReportFilters />
        <RemittanceReportTable />
      </Grid>
    </Grid>
  )
}

export default RemittanceReport

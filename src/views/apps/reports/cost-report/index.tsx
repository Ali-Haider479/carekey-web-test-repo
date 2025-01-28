'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import CostReportFilters from './CostReportFilters'
import CostReportTable from './CostReportTable'

// Component Imports

const CostReport = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CostReportFilters />
        <CostReportTable />
      </Grid>
    </Grid>
  )
}

export default CostReport

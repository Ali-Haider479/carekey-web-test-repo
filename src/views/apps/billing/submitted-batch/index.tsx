'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import SubmittedBatchTable from './SubmittedBatchTable'
import SubmittedBatchFilters from './SubmittedBatchFilters'

// Component Imports

const SubmittedBatchDetails = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SubmittedBatchFilters />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <SubmittedBatchTable />
      </Grid>
    </Grid>
  )
}

export default SubmittedBatchDetails

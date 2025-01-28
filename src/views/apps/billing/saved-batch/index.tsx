'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import SavedBatchTable from './SavedBatchTable'
import SavedBatchFilters from './SavedBatchFilters'

// Component Imports

const SavedBatchDetails = () => {
  return (
    <Grid container spacing={6}>
      {/* <Grid size={{ xs: 12 }}>
        <SavedBatchFilters />
      </Grid> */}
      <Grid size={{ xs: 12 }}>
        <SavedBatchTable />
      </Grid>
    </Grid>
  )
}

export default SavedBatchDetails

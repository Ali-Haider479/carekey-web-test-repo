'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import WaitingLogsApprovalTable from './WaitingLogsApprovalTable'
import LogsApprovalFilters from './LogsApprovalFilters'

// Component Imports

const LogsApprovalDetails = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <LogsApprovalFilters />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <WaitingLogsApprovalTable />
      </Grid>
    </Grid>
  )
}

export default LogsApprovalDetails

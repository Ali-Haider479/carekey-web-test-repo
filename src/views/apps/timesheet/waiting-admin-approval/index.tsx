'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import WaitingAdminApprovalTable from './WaitingAdminApprovalTable'
import AdminApprovalFilters from './AdminApprovalFilters'

// Component Imports

const AdminApprovalDetails = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AdminApprovalFilters />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <WaitingAdminApprovalTable />
      </Grid>
    </Grid>
  )
}

export default AdminApprovalDetails

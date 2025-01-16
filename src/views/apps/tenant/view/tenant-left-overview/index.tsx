// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import TenantDetails from './TenantDetails'
import TenantPlan from './TenantPlan'

const TenantLeftOverview = () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <TenantDetails />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TenantPlan />
            </Grid>
        </Grid>
    )
}

export default TenantLeftOverview

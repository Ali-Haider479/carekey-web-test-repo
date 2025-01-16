// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import TenantListTable from './TenantListTable'
import TenantListCards from './TenantListCards'

const TenantList = () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <TenantListCards />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TenantListTable />
            </Grid>
        </Grid>
    )
}

export default TenantList

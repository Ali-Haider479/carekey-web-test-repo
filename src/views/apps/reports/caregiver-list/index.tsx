'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import CaregiverListTable from './CaregiverListTable'

// Component Imports

const CaregiverList = () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <CaregiverListTable />
            </Grid>
        </Grid>
    )
}

export default CaregiverList

'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import ClientListTable from './ClientListTable'

// Component Imports

const ClientList = () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <ClientListTable />
            </Grid>
        </Grid>
    )
}

export default ClientList

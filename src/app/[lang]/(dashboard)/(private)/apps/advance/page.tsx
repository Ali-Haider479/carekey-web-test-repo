// MUI Imports
import { Card, CardContent, CardHeader, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import SupportTicketCard from './SupportTicketCard'



const SupportTicketView = () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <Typography variant='h2'>
                    Support Ticket
                </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
                <SupportTicketCard />
            </Grid>
        </Grid>
    )
}

export default SupportTicketView

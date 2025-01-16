// MUI Imports
import { Card, CardContent, CardHeader, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'

import ScheduleTableFiltersCard from './ScheduleTableFiltersCard'
import ScheduleListTable from './ScheduleListTable'


const ScheduleList = () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <Typography variant='h2'>
                    Schedule List
                </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
                <ScheduleTableFiltersCard />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <ScheduleListTable />
            </Grid>
        </Grid>
    )
}

export default ScheduleList

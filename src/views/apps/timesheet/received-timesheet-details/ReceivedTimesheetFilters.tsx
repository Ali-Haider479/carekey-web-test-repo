import React, { useState } from 'react'
import { Card, CardHeader, CardContent, Grid, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material'

const ReceivedTimesheetFilters = () => {
    const [week, setWeek] = useState('')
    const [billingPeriod, setBillingPeriod] = useState('')

    const handleWeekChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setWeek(event.target.value as string)
    }

    const handleBillingPeriodChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setBillingPeriod(event.target.value as string)
    }

    return (
        <Card className="w-full" sx={{ p: 2, borderRadius: 1, boxShadow: 2 }}>
            {/* Card Header */}
            <CardHeader
                title="Filters"
                titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 500 } }}
            />

            {/* Card Content */}
            <CardContent>
                <Grid container spacing={4}>
                    {/* Search Client Name */}
                    <Grid item xs={12} md={6} sx={{ pb: 2 }}>
                        <TextField
                            fullWidth
                            label="Client Name"
                            placeholder="Enter client name"
                            variant="outlined"
                            size="small"
                        />
                    </Grid>

                    {/* Search Caregiver Name */}
                    <Grid item xs={12} md={6} sx={{ pb: 2 }}>
                        <TextField
                            fullWidth
                            label="Caregiver Name"
                            placeholder="Enter caregiver name"
                            variant="outlined"
                            size="small"
                        />
                    </Grid>

                    {/* Week Dropdown */}
                    <Grid item xs={12} md={6} sx={{ pb: 2 }}>
                        <FormControl fullWidth size="small" variant="outlined">
                            <InputLabel id="week-select-label">Week</InputLabel>
                            <Select
                                labelId="week-select-label"
                                value={week}
                                label="Week"
                            >
                                <MenuItem value="Week 1">Week 1</MenuItem>
                                <MenuItem value="Week 2">Week 2</MenuItem>
                                <MenuItem value="Week 3">Week 3</MenuItem>
                                <MenuItem value="Week 4">Week 4</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Billing Period Dropdown */}
                    <Grid item xs={12} md={6} sx={{ pb: 2 }}>
                        <FormControl fullWidth size="small" variant="outlined">
                            <InputLabel id="billing-period-select-label">Billing Period</InputLabel>
                            <Select
                                labelId="billing-period-select-label"
                                value={billingPeriod}
                                label="Billing Period"
                            >
                                <MenuItem value="Monthly">Monthly</MenuItem>
                                <MenuItem value="Quarterly">Quarterly</MenuItem>
                                <MenuItem value="Yearly">Yearly</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default ReceivedTimesheetFilters

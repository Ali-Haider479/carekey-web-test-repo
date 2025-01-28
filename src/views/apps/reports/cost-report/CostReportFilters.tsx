import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid2 as Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material'
import { useState } from 'react'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

const CostReportFilters = () => {
  const [claimDate, setClaimDate] = useState<Date | null>(null)
  return (
    <Card>
      <CardHeader title='Filters' />
      <CardContent>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField fullWidth label='Payor' placeholder='Payor' variant='outlined' size='small' />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField fullWidth label='Procedure' placeholder='Procedure' variant='outlined' size='small' />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField fullWidth label='Modifier' placeholder='Modifier' variant='outlined' size='small' />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <FormControl fullWidth size='small' variant='outlined'>
              <InputLabel id='client-select-label'>Client</InputLabel>
              <Select labelId='client-select-label' value={''} label='Client'>
                <MenuItem value='Option-1'>Option-1</MenuItem>
                <MenuItem value='Option-2'>Option-2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <AppReactDatepicker
              selected={claimDate}
              id='claim-date'
              onChange={(date: Date | null) => date !== null && setClaimDate(date)}
              placeholderText='MM/DD/YYYY'
              customInput={
                <TextField
                  fullWidth
                  size='small'
                  label={'Claim Date'}
                  placeholder='MM/DD/YYYY'
                  InputProps={{
                    endAdornment: (
                      <IconButton size='small'>
                        <CalendarTodayIcon style={{ scale: 1 }} />
                      </IconButton>
                    )
                  }}
                />
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CostReportFilters

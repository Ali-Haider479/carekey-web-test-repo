import { Card, CardContent, CardHeader, FormControl, Grid2 as Grid, InputLabel, MenuItem, Select } from '@mui/material'

const customReportFilters = () => {
  return (
    <Card>
      <CardHeader title='Filters' />
      <CardContent>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <FormControl fullWidth size='small' variant='outlined'>
              <InputLabel id='topic-select-label'>Topic</InputLabel>
              <Select labelId='topic-select-label' value={''} label='Topic'>
                <MenuItem value='Option-1'>Option-1</MenuItem>
                <MenuItem value='Option-2'>Option-2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <FormControl fullWidth size='small' variant='outlined'>
              <InputLabel id='report-type-select-label'>Report Type</InputLabel>
              <Select labelId='report-type-select-label' value={''} label='Report Type'>
                <MenuItem value='Option-1'>Option-1</MenuItem>
                <MenuItem value='Option-2'>Option-2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <FormControl fullWidth size='small' variant='outlined'>
              <InputLabel id='fields-select-label'>Fields</InputLabel>
              <Select labelId='fields-select-label' value={''} label='Fields'>
                <MenuItem value='Option-1'>Option-1</MenuItem>
                <MenuItem value='Option-2'>Option-2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <FormControl fullWidth size='small' variant='outlined'>
              <InputLabel id='sort-by-select-label'>Sort by</InputLabel>
              <Select labelId='sort-by-select-label' value={''} label='Sort by'>
                <MenuItem value='Option-1'>Option-1</MenuItem>
                <MenuItem value='Option-2'>Option-2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default customReportFilters

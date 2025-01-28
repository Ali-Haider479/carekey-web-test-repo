import { Grid2 as Grid } from '@mui/material'
import CustomReportFilters from './CustomReportFilters'
import CustomReportTable from './CustomReportTable'

const CustomReport = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CustomReportFilters />
        <CustomReportTable />
      </Grid>
    </Grid>
  )
}

export default CustomReport

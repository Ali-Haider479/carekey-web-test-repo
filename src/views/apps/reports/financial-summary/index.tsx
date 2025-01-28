import { Grid2 as Grid } from '@mui/material'
import FinancialSummaryFilters from './FinancialSummaryFilters'
import FinancialSummaryTable from './FinancialSummaryTable'

const FinancialSummary = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <FinancialSummaryFilters />
        <FinancialSummaryTable />
      </Grid>
    </Grid>
  )
}

export default FinancialSummary

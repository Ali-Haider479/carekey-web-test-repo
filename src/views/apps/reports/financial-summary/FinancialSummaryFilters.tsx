import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import {
  Card,
  CardHeader,
  CardContent,
  Grid2 as Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material'

const FinancialSummaryFilters = () => {
  return (
    <Card>
      <CardHeader title='Filters' />
      <CardContent>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField fullWidth label='Payor' placeholder='Payor' variant='outlined' size='small' />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField fullWidth label='Service Type' placeholder='Service Type' variant='outlined' size='small' />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <TextField fullWidth label='Adjustments' placeholder='Adjustments' variant='outlined' size='small' />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default FinancialSummaryFilters

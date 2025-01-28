import { Grid2 as Grid } from '@mui/material'
import ServiceAuthTable from './ServiceAuthTable'
import ServiceAuthFilters from './ServiceAuthFilters'

const ServiceAuth = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ServiceAuthFilters />
        <ServiceAuthTable />
      </Grid>
    </Grid>
  )
}

export default ServiceAuth

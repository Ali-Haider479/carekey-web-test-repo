// MUI Imports
import EmployeeStepper from '@/views/apps/caregiver/add-employee'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

const AddEmployeeStepper = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <EmployeeStepper />
      </Grid>
    </Grid>
  )
}

export default AddEmployeeStepper

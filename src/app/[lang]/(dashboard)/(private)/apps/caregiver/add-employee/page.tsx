// MUI Imports
import EmployeeStepper from '@/views/apps/caregiver/add-employee'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Component Imports
import StepperAlternativeLabel from '@views/forms/form-wizard/StepperAlternativeLabel'

const AddEmployeeStepper = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h5'>Adding a Employee/Details and caregiver notes</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <EmployeeStepper />
      </Grid>
    </Grid>
  )
}

export default AddEmployeeStepper

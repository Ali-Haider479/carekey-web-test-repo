// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import CreateTenant from './CreateTenant'
import { Card, CardHeader } from '@mui/material'
import { TenantType } from '@/types/apps/tenantTypes'

const CreateTenantView = () => {
  return (
    <Grid container spacing={6}>
      <Card className='w-full'>
        <CardHeader title='Adding a new Tenant' titleTypographyProps={{ sx: { fontSize: '24px' } }} />
      </Card>
      <Grid size={{ xs: 12 }}>
        <CreateTenant
          open={false}
          handleClose={function (): void {
            throw new Error('Function not implemented.')
          }}
          setData={function (data: TenantType[]): void {
            throw new Error('Function not implemented.')
          }}
        />
      </Grid>
    </Grid>
  )
}

export default CreateTenantView

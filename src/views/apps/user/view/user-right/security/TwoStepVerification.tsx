// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'
import CustomTextField from '@core/components/mui/TextField'

const TwoStepVerification = () => {
  return (
    <Card>
      <CardHeader title='Two-step verification' subheader='Keep your account secure with authentication step.' />
      <CardContent>
        <Typography variant='h6' htmlFor='sms' component={InputLabel} className='inline-flex mbe-1'>
          SMS
        </Typography>
        <div className='flex items-center mbe-4 gap-4'>
          <CustomTextField id='sms' placeholder='+1(968) 819-2547' fullWidth />
          <div className='flex items-center gap-1'>
            <CustomIconButton color='secondary'>
              <i className='bx-edit' />
            </CustomIconButton>
            <CustomIconButton color='secondary'>
              <i className='bx-user-plus' />
            </CustomIconButton>
          </div>
        </div>
        <Typography>
          Two-factor authentication adds an additional layer of security to your account by requiring more than just a
          password to log in. <span className='text-primary'>Learn more.</span>
        </Typography>
      </CardContent>
    </Card>
  )
}

export default TwoStepVerification

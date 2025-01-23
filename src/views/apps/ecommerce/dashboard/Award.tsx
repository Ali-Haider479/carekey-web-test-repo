// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'

const Award = ({ title, value }: any) => {
  return (
    <Card>
      <CardContent className='flex flex-row gap-7 relative items-start justify-between'>
        {/* <div className='flex flex-col items-start'>
          <Typography variant='h5'>Congratulations Katierrr! 🎉</Typography>
          <Typography variant='subtitle1'>Best seller of the month</Typography>
        </div> */}
        <div className='flex flex-col items-start'>
          <Typography variant='h5' color='primary.main'>
            {title}
          </Typography>
          <Typography>{value}</Typography>
        </div>
        {/* <Button size='small' variant='contained'>
          View Sales
        </Button> */}
        {/* <img src='/images/cards/trophy.png' alt='trophy' className='absolute inline-end-7 block-end-0' /> */}
        <PeopleAltIcon />
      </CardContent>
    </Card>
  )
}

export default Award

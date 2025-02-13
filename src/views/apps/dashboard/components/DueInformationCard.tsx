import { Avatar, Card, CardContent, CardHeader, Divider, Typography } from '@mui/material'
import DescriptionIcon from '@mui/icons-material/Description'

const DueInformationCard = () => {
  return (
    <Card className='mt-6'>
      <CardContent>
        <Typography className='text-xl'>{`Due Information (In Days)`}</Typography>
        <Divider />
        <div className='flex flex-row items-center gap-x-4 bg-actionHover rounded p-3 mt-4'>
          <Avatar variant='rounded' sx={{ width: 40, height: 40 }} className='flex items-center justify-center'>
            <DescriptionIcon className='text-[#71DD37] text-3xl' />
          </Avatar>
          <div>
            <Typography variant='h6'>PCA Supervision</Typography>
            <Typography variant='h6'>{'Due:'}</Typography>
          </div>
          <Typography className='text-3xl ml-auto' color={'success.main'}>
            23
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default DueInformationCard

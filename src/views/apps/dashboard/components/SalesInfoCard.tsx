// MUI Imports
import { Avatar } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const SalesInfoCard = ({ title, value, icon, iconClass, extraClassItem }: any) => {
  return (
    <Card>
      <CardContent className={`flex flex-col gap-y-2.5 ${extraClassItem ? extraClassItem : ''}`}>
        {iconClass ? (
          <Avatar variant='rounded' className='items-center'>
            <i className={iconClass} />
          </Avatar>
        ) : (
          icon
        )}
        <div className={`flex flex-col gap-y-0.5  ${extraClassItem ? extraClassItem : ''}`}>
          <Typography variant='body2'>{title}</Typography>
          <Typography variant='body2'>{value}</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default SalesInfoCard

'use client'

// MUI Imports
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import type { CardProps } from '@mui/material/Card'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'

// Types Imports
import type { ThemeColor } from '@core/types'
import type { CardStatsHorizontalWithBorderProps } from '@/types/pages/widgetTypes'

//Component Imports

type Props = CardProps & {
  color: ThemeColor
}

const Card = styled(MuiCard)<Props>(({ color }) => ({
  transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out, margin 0.3s ease-in-out',
  borderBottomWidth: '2px',
  borderBottomColor: `var(--mui-palette-${color}-darkerOpacity)`,
  '[data-skin="bordered"] &:hover': {
    boxShadow: 'none'
  },
  '&:hover': {
    borderBottomWidth: '3px',
    borderBottomColor: `var(--mui-palette-${color}-main) !important`,
    boxShadow: 'var(--mui-customShadows-xl)',
    marginBlockEnd: '-1px'
  }
}))

const HorizontalWithBorder = (props: any) => {
  // Props
  const { title, stats, trendNumber, avatarIcon, color } = props

  return (
    <Card color={color || 'primary'}>
      <CardContent className='flex flex-row gap-2 justify-between'>
        <div className='flex flex-col gap-2'>
          <Typography className='text-base'>{title}</Typography>
          <Typography variant='h4'>{stats}</Typography>
        </div>
        {avatarIcon}
      </CardContent>
    </Card>
  )
}

export default HorizontalWithBorder

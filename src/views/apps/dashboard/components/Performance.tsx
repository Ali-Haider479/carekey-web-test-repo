'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@/@core/components/mui/Avatar'
import CustomTextField from '@/@core/components/mui/TextField'
import React from 'react'

type ReportDataType = {
  title: string
  avatarWidth: number
  stats: string
  trendNumber: number
  trend: 'up' | 'down'
  avatarSrc: string
}

const Performance = () => {
  // Hooks
  const theme = useTheme()

  const reportData: ReportDataType[] = [
    {
      title: 'Income',
      avatarWidth: 20,
      stats: '$42,845',
      trendNumber: 2.34,
      trend: 'up',
      avatarSrc: '/images/cards/paypal-without-bg.png'
    },
    {
      avatarWidth: 20,
      title: 'Expense',
      stats: '$38,658',
      trendNumber: 1.15,
      trend: 'down',
      avatarSrc: '/images/cards/credit-card-without-bg.png'
    },
    {
      title: 'Profit',
      avatarWidth: 22,
      stats: '$18,220',
      trendNumber: 1.34,
      trend: 'up',
      avatarSrc: '/images/cards/wallet-without-bg.png'
    }
  ]

  return (
    <Card className='h-[420px]'>
      <CardHeader
        title='Pay Period'
        // subheader='Monthly Avg. $45.57k'
        action={<OptionMenu options={['Share', 'Refresh', 'Delete']} />}
      />
      <CardContent className='flex flex-col gap-y-4'>
        <div className='flex items-center gap-3'>
          <CustomTextField
            // inputRef={ref}
            fullWidth
            // {...props}
            // label={props.label || ''}
            // className={props.className}
            // id={props.id}
            // error={props.error}
            placeholder='Start Date'
          />
          <CustomTextField
            // inputRef={ref}
            fullWidth
            // {...props}
            // label={props.label || ''}
            // className={props.className}
            // id={props.id}
            // error={props.error}
            placeholder='End Date'
          />
        </div>
        {reportData.map((data, index) => (
          <div key={index} className='plb-3 pli-4 flex items-center justify-between gap-x-4 bg-actionHover rounded'>
            <CustomAvatar size={40} variant='rounded' className='bg-backgroundPaper'>
              <img src={data.avatarSrc} alt='Paypal' className='is-5' />
            </CustomAvatar>
            <div>
              <Typography color='text.disabled'>{data.title}</Typography>
              <Typography variant='h5'>{data.stats}</Typography>
            </div>
            <Typography color={data.trend === 'up' ? 'success.main' : 'error.main'} variant='body2'>
              {data.trend === 'up' ? '+' : '-'}
              {data.trendNumber}k
            </Typography>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default Performance

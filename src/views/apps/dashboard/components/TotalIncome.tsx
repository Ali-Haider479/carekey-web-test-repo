'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
import { useEffect, useState } from 'react'
import api from '@/utils/api'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

type ReportDataType = {
  title: string
  avatarWidth: number
  stats: string
  trendNumber: number
  trend: 'up' | 'down'
  avatarSrc: string
}

// Vars
const series = [
  {
    name: 'Hours',
    data: [15, 30, 30, 20, 20, 30, 30]
  }
]

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

const TotalIncome = () => {
  // Hooks
  const theme = useTheme()
  const [chartData, setChartData] = useState<{
    series: { name: string; data: number[] }[]
    categories: string[]
  }>({
    series: [{ name: 'Hours', data: [0, 0, 0, 0, 0, 0, 0] }],
    categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  })
  const authUser: any = JSON.parse(localStorage?.getItem('AuthUser') ?? '{}')

  // Fetch data from backend
  useEffect(() => {
    const fetchWeeklyReport = async () => {
      try {
        const tenantId = authUser?.tenant?.id
        if (tenantId) {
          const response = await api.get(`/caregivers/weekly-report/${tenantId}`)
          const data = response?.data
          setChartData({
            series: data?.series,
            categories: data?.categories
          })
        }
      } catch (error) {
        console.error('Error fetching weekly report:', error)
      }
    }

    fetchWeeklyReport()
  }, [])

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    dataLabels: { enabled: false },
    stroke: {
      width: 4,
      curve: 'straight'
    },
    grid: {
      borderColor: 'var(--mui-palette-divider)',
      strokeDashArray: 6,
      padding: {
        top: 5,
        right: 6,
        bottom: 7
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityTo: 0.5,
        opacityFrom: 0.8,
        stops: [0, 95, 100],
        shadeIntensity: 0.8,
        colorStops: [
          [
            {
              offset: 0,
              opacity: 0.5,
              color: 'var(--mui-palette-primary-main)'
            },
            {
              opacity: 0.2,
              offset: 100,
              color: 'var(--mui-palette-background-paper)'
            }
          ]
        ]
      }
    },
    theme: {
      monochrome: {
        enabled: true,
        shadeTo: 'light',
        shadeIntensity: 1,
        color: theme.palette.primary.main
      }
    },
    xaxis: {
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: chartData.categories, // Use dynamic categories
      labels: {
        style: {
          fontSize: '13px',
          colors: 'var(--mui-palette-text-disabled)',
          fontFamily: 'Public Sans'
        }
      }
    },
    yaxis: {
      tickAmount: 6,
      labels: {
        formatter: value => `${value}hr`,
        style: {
          fontSize: '13px',
          colors: 'var(--mui-palette-text-disabled)',
          fontFamily: 'Public Sans'
        }
      }
    }
  }

  return (
    <Card>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 12 }} className='max-md:border-be md:border-ie'>
          <CardHeader
            title='Total hours Worked'
            subheader='Weekly report overview'
            action={<OptionMenu options={['Share', 'Refresh', 'Delete']} />}
          />
          <CardContent className='flex flex-col gap-y-6'>
            <AppReactApexCharts type='area' height={299} width='100%' series={chartData.series} options={options} />
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default TotalIncome

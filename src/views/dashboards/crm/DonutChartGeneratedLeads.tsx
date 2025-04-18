'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const series = [25, 25, 25, 25]

const BarChartRevenueGrowth = () => {
  // Hook
  const theme = useTheme()

  const options: ApexOptions = {
    colors: [
      'var(--mui-palette-success-main)',
      'var(--mui-palette-success-lightOpacity)',
      'rgba(var(--mui-palette-success-mainChannel) / 0.5)',
      'rgba(var(--mui-palette-success-mainChannel) / 0.7)'
    ],
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: { theme: 'false' },
    dataLabels: { enabled: false },
    labels: ['Electronic', 'Sports', 'Decor', 'Fashion'],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    grid: {
      padding: {
        top: -10,
        bottom: -10,
        right: -10,
        left: -10
      }
    },
    plotOptions: {
      pie: {
        customScale: 0.8,
        expandOnClick: false,
        donut: {
          size: '73%',
          labels: {
            show: true,
            name: {
              offsetY: 25,
              color: 'var(--mui-palette-text-secondary)',
              fontFamily: theme.typography.fontFamily
            },
            value: {
              offsetY: -15,
              fontWeight: 500,
              formatter: val => `${val}%`,
              color: 'var(--mui-palette-text-primary)',
              fontFamily: theme.typography.fontFamily,
              fontSize: theme.typography.h4.fontSize as string
            },
            total: {
              show: true,
              label: 'Average',
              fontFamily: theme.typography.fontFamily,
              fontSize: theme.typography.body1.fontSize as string,
              color: 'var(--mui-palette-text-secondary)',
              formatter: () => `${series.reduce((a, b) => a + b, 0) / series.length}%`
            }
          }
        }
      }
    }
  }

  return (
    <Card className='overflow-visible'>
      <CardContent className='flex justify-between gap-4'>
        <div className='flex flex-col justify-between'>
          <div className='flex flex-col'>
            <Typography variant='h5'>Generated Leads</Typography>
            <Typography>Monthly Report</Typography>
          </div>
          <div className='flex flex-col items-start'>
            <Typography variant='h4'>4,350</Typography>
            <div className='flex items-center gap-x-1'>
              <i className='bx-chevron-up text-success' />
              <Typography color='success.main'>+15.8%</Typography>
            </div>
          </div>
        </div>
        <AppReactApexCharts type='donut' width={159} height={159} series={series} options={options} />
      </CardContent>
    </Card>
  )
}

export default BarChartRevenueGrowth

// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports
import Award from '@views/apps/ecommerce/dashboard/Award'
import NewVisitorsAndActivityCharts from '@views/apps/ecommerce/dashboard/NewVisitorsAndActivityCharts'
import Vertical from '@components/card-statistics/Vertical'
import BarProfitChart from '@views/apps/ecommerce/dashboard/BarProfitChart'
import RadialExpensesChart from '@views/apps/ecommerce/dashboard/RadialExpensesChart'
import TotalIncome from '@views/apps/ecommerce/dashboard/TotalIncome'
import Performance from '@views/apps/ecommerce/dashboard//Performance'
import ConversionRate from '@views/apps/ecommerce/dashboard/ConversionRate'
import SalesInfoCard from '@views/apps/ecommerce/dashboard/SalesInfoCard'
import BarExpensesChart from '@views/apps/ecommerce/dashboard/BarExpensesChart'
import TotalBalance from '@views/apps/ecommerce/dashboard/TotalBalance'
import CustomersTable from '@views/apps/ecommerce/dashboard/CustomersTable'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CloudIcon from '@mui/icons-material/Cloud'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import BarChartRevenueGrowth from '@/views/dashboards/crm/DonutChartGeneratedLeads'
import PopularInstructors from '@/views/apps/academy/dashboard/PopularInstructors'
import LogisticsStatisticsCard from '@/views/apps/logistics/dashboard/LogisticsStatisticsCard'
import HorizontalWithBorder from '@/components/card-statistics/HorizontalWithBorder'

const EcommerceDashboard = () => {
  // const { title, stats, trendNumber, avatarIcon, color } = props

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 3 }}>
        <HorizontalWithBorder title='Caregivers' stats='11' />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <HorizontalWithBorder title='Caregivers' stats='11' />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <HorizontalWithBorder title='Active app users' stats='11' />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <HorizontalWithBorder title='Missed Clients' stats='11' />
      </Grid>
      {/* <Grid size={{ xs: 12, md: 8 }}>
        <NewVisitorsAndActivityCharts />
      </Grid> */}
      {/* <Grid size={{ xs: 12, lg: 4 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 6 }}>
            <Vertical
              title='Sales'
              imageSrc='/images/cards/wallet-info-bg.png'
              stats='$4,679'
              trendNumber={28.14}
              trend='positive'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 6 }}>
            <BarProfitChart />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 6 }}>
            <RadialExpensesChart />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 6 }}>
            <Vertical
              title='Transactions'
              imageSrc='/images/cards/credit-card-primary-bg.png'
              stats='$14,854'
              trendNumber={62}
              trend='positive'
            />
          </Grid>
        </Grid>
      </Grid> */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <TotalIncome />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Performance />
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Grid container spacing={6}>
          {/* <Grid size={{ xs: 12, sm: 6, md: 3, lg: 6 }}>
            <Vertical
              title='Revenue'
              imageSrc='/images/cards/mac-warning-bg.png'
              stats='$42,389'
              trendNumber={52.18}
              trend='positive'
            />
          </Grid> */}
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 4 }}>
            <SalesInfoCard title='Waiting for SA' value='3' icon={<CalendarMonthIcon />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 4 }}>
            <SalesInfoCard title='Product updates' value='11' icon={<CloudIcon />} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 4 }}>
            <SalesInfoCard title='Cloud forms' value='7' icon={<RestartAltIcon />} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <BarChartRevenueGrowth />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <BarExpensesChart />
          </Grid>
        </Grid>
      </Grid>
      {/* <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <ConversionRate />
      </Grid> */}

      {/* <Grid size={{ xs: 12, lg: 8 }}>
        <CustomersTable />
      </Grid> */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <PopularInstructors />
      </Grid>
    </Grid>
  )
}

export default EcommerceDashboard

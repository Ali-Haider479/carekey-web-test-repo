// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { CaregiverTypes } from '@/types/apps/caregiverTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import Card from '@mui/material/Card'

const CaregiverFilters = ({
  setData,
  tableData
}: {
  setData: (data: CaregiverTypes[]) => void
  tableData?: CaregiverTypes[]
}) => {
  // States
  const [item, setItem] = useState<CaregiverTypes['item']>('')
  const [status, setStatus] = useState<CaregiverTypes['status']>('')

  useEffect(() => {
    const filteredData = tableData?.filter(user => {
      if (status && user.status !== status) return false
      if (item && user.item !== item) return false
      return true
    })

    setData(filteredData || [])
  }, [status, item, tableData, setData])

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0, padding: 5 }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <span className='text-[20px]'>
          <strong>Filters</strong>
        </span>
      </Grid>
      <Grid container spacing={6} marginTop={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-status'
            value={status}
            onChange={e => setStatus(e.target.value)}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''> Status</MenuItem>
            <MenuItem value='basic'>Pending</MenuItem>
            <MenuItem value='company'>Active</MenuItem>
            <MenuItem value='enterprise'>Inactive</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-item'
            value={item}
            onChange={e => setItem(e.target.value)}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''> Item</MenuItem>
            <MenuItem value='pending'>Pending</MenuItem>
            <MenuItem value='active'>Active</MenuItem>
            <MenuItem value='inactive'>Inactive</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </Card>
  )
}

export default CaregiverFilters

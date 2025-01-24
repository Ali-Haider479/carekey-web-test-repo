'use client'
import DataTable from '@/@core/components/mui/DataTable'
import { Add } from '@mui/icons-material'
import { Autocomplete, Button, Card, CardContent, TextField } from '@mui/material'
import { useState } from 'react'

const options = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' }
]

const ServiceAuthorization = () => {
  const [selectedOption, setSelectedOption] = useState(null)

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Search query:', event.target.value)
  }

  const handleChange = (event: any, newValue: any) => {
    setSelectedOption(newValue)
    console.log('Selected:', newValue)
  }

  const data = [
    {
      id: 1,
      payor: 'MA',
      promod: 'H2014 (UC U3)',
      saNumber: '32069012220',
      startDate: '08/01/2023',
      endDate: '11/27/2023',
      unitRate: 'Hours',
      totalUnits: '320'
    },
    {
      id: 2,
      payor: 'MA',
      promod: 'H2014 (UC U3)',
      saNumber: '32069012220',
      startDate: '08/01/2023',
      endDate: '11/27/2023',
      unitRate: 'Hours',
      totalUnits: '320'
    }
  ]

  const columns = [
    {
      headerName: 'PAYER',
      field: 'payor',
      flex: 0.75
    },
    {
      headerName: 'PRO & MOD',
      field: 'promod',
      flex: 0.75
    },
    {
      headerName: 'SA NUMBER',
      field: 'saNumber',
      flex: 0.75
    },
    {
      headerName: 'START DATE',
      field: 'startDate',
      flex: 0.75
    },
    {
      headerName: 'END DATE',
      field: 'endDate',
      flex: 0.75
    },
    {
      headerName: 'UNIT/RATE',
      field: 'unitRate',
      flex: 0.75
    },
    {
      headerName: 'TOTAL UNITS',
      field: 'totalUnits',
      flex: 0.75
    }
  ]
  return (
    <>
      <Card className=' w-full flex flex-col h-36 p-4 shadow-md rounded-lg'>
        <span className='ml-2 text-2xl font-bold '>Filters</span>
        <div className='flex justify-between'>
          <div className='w-[530px] mt-4'>
            <Autocomplete
              options={options}
              getOptionLabel={option => option.label}
              onInputChange={() => handleSearch}
              onChange={handleChange}
              renderInput={params => (
                <TextField {...params} placeholder='Show All' variant='outlined' className='h-[56px]' />
              )}
              filterOptions={x => x} // Keep all options (you can adjust filtering logic)
            />
          </div>
          <div className='flex justify-end'>
            <Button startIcon={<Add />} className='w-[160px] bg-[#4B0082] text-white mt-4'>
              ADD SA LIST
            </Button>
            <Button startIcon={<Add />} className='bg-[#32475C99] bg-opacity-60 text-white mt-4 ml-4'>
              ADD SERVICE AUTHORIZATION
            </Button>
          </div>
        </div>
      </Card>
      <Card className=' w-full  flex flex-col h-auto mt-3 shadow-md rounded-lg'>
        <span className='p-6 text-xl '>IHS (With training)</span>
        <DataTable columns={columns} data={data} />
      </Card>
      <Card className=' w-full flex flex-col h-auto mt-3 shadow-md rounded-lg'>
        <span className='p-6 text-xl '>Integrated Community Supports Daily</span>
        <DataTable columns={columns} data={data} />
      </Card>
    </>
  )
}

export default ServiceAuthorization

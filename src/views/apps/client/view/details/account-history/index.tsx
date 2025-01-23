'use client'
import DataTable from '@/@core/components/mui/DataTable'
import CustomTextField from '@/@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { SearchOutlined } from '@mui/icons-material'
import { Box, Card, Input, List, ListItem, ListItemText, Paper, Typography } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import React, { useState, forwardRef } from 'react'

interface DefaultStateType {
  url: string
  title: string
  allDay: boolean
  calendar: string
  description: string
  endDate: Date
  startDate: Date
  guests: string[] | undefined
}

interface PickerProps {
  label?: string
  error?: boolean
  className?: string
  id?: string
  registername?: string
}

const defaultState: DefaultStateType = {
  url: '',
  title: '',
  guests: [],
  allDay: true,
  description: '',
  endDate: new Date(),
  calendar: 'Business',
  startDate: new Date()
}

const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
  return (
    <CustomTextField
      inputRef={ref}
      fullWidth
      {...props}
      label={props.label || ''}
      className={props.className}
      id={props.id}
      error={props.error}
    />
  )
})

const AccountHistory = () => {
  const [values, setValues] = useState<DefaultStateType>(defaultState)
  const data = [
    {
      id: '1',
      dateTime: '04/28/2024, 02:12 pm',
      admin: 'Sameer khan',
      section: 'Profile',
      changes: ['Updated Assign client - Yolanda Jordan']
    }
  ]

  const listData = [
    'Removed Hss User',
    'Updated Agency Location-868005',
    'Updated Agency Location-868006',
    'Updated Agency Location-868007',
    'Updated Agency Location-868009',
    'Removed Payor Group Information HSS-a:5'
  ]

  const columns: GridColDef[] = [
    {
      headerName: 'Date & Time',
      field: 'dateTime',
      flex: 0.75
    },
    {
      headerName: 'Admin',
      field: 'admin',
      flex: 0.75
    },
    {
      headerName: 'Section',
      field: 'section',
      flex: 0.75
    },
    {
      headerName: 'Changes Made',
      field: 'changes',
      flex: 1.75,
      renderCell: (params: GridRenderCellParams) => (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {Array.isArray(params.value) &&
            params.value.map((change: string, index: number) => (
              <li
                key={index}
                style={{
                  marginBottom: '0.25rem',
                  color: change.includes('Removed') ? 'red' : ''
                }}
              >
                {change}
              </li>
            ))}
        </ul>
      )
    }
  ]

  const handleStartDate = (date: Date | null) => {
    if (date && date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    }
  }

  return (
    <>
      <Card className=' w-full flex flex-col h-[152px] p-4 shadow-md rounded-lg'>
        <span className='ml-2 text-2xl font-bold'>Filters</span>
        <AppReactDatepicker
          className='w-[534px] h-14 mt-4 ml-3 '
          selectsStart
          id='event-start-date'
          endDate={values.endDate}
          selected={values.startDate}
          startDate={values.startDate}
          showTimeSelect={!values.allDay}
          dateFormat={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
          customInput={<PickersComponent label='' registername='startDate' className='mbe-6' id='event-start-date' />}
          onChange={(date: Date | null) => date !== null && setValues({ ...values, startDate: new Date(date) })}
          onSelect={handleStartDate}
          icon={<SearchOutlined />}
        />
      </Card>
      <Card className=' h-full w-full mt-3 shadow-md rounded-lg p-1'>
        <Input endAdornment={<SearchOutlined />} className='w-[534px] !h-[40px] m-4' placeholder='Search Admin name' />
        <DataTable
          columns={columns}
          data={data}
          paginationConfig={{ pages: 1, pageSize: 1 }}
          checkboxSelection={false}
        />
        <List>
          {listData.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                padding: '0.5rem',
                marginBottom: '0.25rem',
                borderBottom: '2px solid #DBDBEB1F'
              }}
            >
              <ListItemText sx={{ color: item.includes('Removed') ? 'red' : '#E0E0E0' }} primary={item} />
            </ListItem>
          ))}
        </List>
      </Card>
    </>
  )
}

export default AccountHistory

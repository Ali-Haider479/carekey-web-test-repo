import * as React from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import Paper from '@mui/material/Paper'

type paginationConfigType = {
  pages: number
  pageSize: number
}

type Props = {
  columns: GridColDef[]
  data: any[]
  paginationConfig?: paginationConfigType
}

const Samplecolumns: GridColDef[] = [
  { field: 'id', headerName: 'ID', flex: 0.5 },
  { field: 'firstName', headerName: 'First name', flex: 1 },
  { field: 'lastName', headerName: 'Last name', flex: 1 },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    flex: 0.75,
    align: 'center'
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    flex: 1.5,
    valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`
  }
]

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 }
]

const defaultPaginationModel = { page: 0, pageSize: 5 }

const DataTable = ({ columns, data, paginationConfig }: Props) => {
  const paginationModel = paginationConfig ? { page: 0, pageSize: paginationConfig.pageSize } : defaultPaginationModel

  return (
    <Paper sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={data ? data : rows}
        columns={columns ? columns : Samplecolumns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  )
}

export default DataTable

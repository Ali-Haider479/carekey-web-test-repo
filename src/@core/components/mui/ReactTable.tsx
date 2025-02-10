import {
  MaterialReactTable,
  MRT_RowSelectionState,
  useMaterialReactTable,
  type MRT_ColumnDef
} from 'material-react-table'
import { useState } from 'react'

export type TableProps = {
  columns: MRT_ColumnDef<any>[]
  data: any[]
  enableExpanding?: boolean
  enableFilters?: boolean
  manualPagination?: boolean
  manualSorting?: boolean
  enableExpandAll?: boolean
}

const ReactTable = ({
  columns,
  data,
  enableExpanding = false,
  enableFilters = false,
  manualPagination = false,
  manualSorting = false,
  enableExpandAll = false
}: TableProps) => {
  // const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  const table = useMaterialReactTable({
    columns,
    data,
    enableExpanding,
    enableFilters,
    manualPagination,
    manualSorting,
    enableExpandAll,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableTopToolbar: false,
    enableSorting: false,
    enableRowSelection: true
  })

  return <MaterialReactTable table={table} />
}

export default ReactTable

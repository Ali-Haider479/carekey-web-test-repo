'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// CSS Module Imports
import styles from '../reportsTable.module.css'

// Type Definitions
type Caregiver = {
    id: number
    fullName: string
    pmi: string
    clientCode: string
    dob: string
    address: string
    city: string
    zip: string
    avatar: string
}

// Sample Data
const defaultData: Caregiver[] = [
    {
        id: 1,
        fullName: 'Ishtiaq Ali',
        pmi: '45127213',
        clientCode: '124152527',
        dob: '05/14/1993',
        address: '1606 SD 8th St, Minneapolis, MN 55455, USA',
        city: 'Minneapolis',
        zip: '55455',
        avatar: '/path/to/avatar1.jpg'
    },
    {
        id: 2,
        fullName: 'Abdul Waheed',
        pmi: '45127214',
        clientCode: '124152528',
        dob: '08/22/1990',
        address: '1607 SD 8th St, Minneapolis, MN 55455, USA',
        city: 'Minneapolis',
        zip: '55455',
        avatar: '/path/to/avatar2.jpg'
    },
    {
        id: 3,
        fullName: 'Alisha Karim',
        pmi: '45127215',
        clientCode: '124152529',
        dob: '03/11/1985',
        address: '1608 SD 8th St, Minneapolis, MN 55455, USA',
        city: 'Minneapolis',
        zip: '55455',
        avatar: '/path/to/avatar3.jpg'
    },
    {
        id: 4,
        fullName: 'Rashid Behram',
        pmi: '45127216',
        clientCode: '124152530',
        dob: '12/06/1992',
        address: '1609 SD 8th St, Minneapolis, MN 55455, USA',
        city: 'Minneapolis',
        zip: '55455',
        avatar: '/path/to/avatar4.jpg'
    },
    {
        id: 5,
        fullName: 'Tajmul Hossien',
        pmi: '45127217',
        clientCode: '124152531',
        dob: '07/21/1994',
        address: '1610 SD 8th St, Minneapolis, MN 55455, USA',
        city: 'Minneapolis',
        zip: '55455',
        avatar: '/path/to/avatar5.jpg'
    },
    {
        id: 6,
        fullName: 'Stacy Moore',
        pmi: '45127218',
        clientCode: '124152532',
        dob: '09/30/1988',
        address: '1611 SD 8th St, Minneapolis, MN 55455, USA',
        city: 'Minneapolis',
        zip: '55455',
        avatar: '/path/to/avatar6.jpg'
    },
    {
        id: 7,
        fullName: 'Farah Yasmin',
        pmi: '45127219',
        clientCode: '124152533',
        dob: '11/17/1991',
        address: '1612 SD 8th St, Minneapolis, MN 55455, USA',
        city: 'Minneapolis',
        zip: '55455',
        avatar: '/path/to/avatar7.jpg'
    },
    {
        id: 8,
        fullName: 'Imran Khalid',
        pmi: '45127220',
        clientCode: '124152534',
        dob: '06/12/1987',
        address: '1613 SD 8th St, Minneapolis, MN 55455, USA',
        city: 'Minneapolis',
        zip: '55455',
        avatar: '/path/to/avatar8.jpg'
    },
    {
        id: 9,
        fullName: 'Sarah Connor',
        pmi: '45127221',
        clientCode: '124152535',
        dob: '10/15/1989',
        address: '1614 SD 8th St, Minneapolis, MN 55455, USA',
        city: 'Minneapolis',
        zip: '55455',
        avatar: '/path/to/avatar9.jpg'
    },
    {
        id: 10,
        fullName: 'David Smith',
        pmi: '45127222',
        clientCode: '124152536',
        dob: '01/05/1990',
        address: '1615 SD 8th St, Minneapolis, MN 55455, USA',
        city: 'Minneapolis',
        zip: '55455',
        avatar: '/path/to/avatar10.jpg'
    }
];


// Column Definitions
const columnHelper = createColumnHelper<Caregiver>()

const columns = [
    columnHelper.accessor('id', {
        cell: info => <span>{info.getValue()}</span>,
        header: '#'
    }),
    columnHelper.accessor('fullName', {
        cell: info => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar alt={info.row.original.fullName} src={info.row.original.avatar} />
                <div>
                    <strong>{info.getValue()}</strong>
                    <br />
                    <span style={{ fontSize: '12px', color: '#757575' }}>Cell</span>
                </div>
            </div>
        ),
        header: 'CAREGIVER NAME'
    }),
    columnHelper.accessor('pmi', {
        cell: info => info.getValue(),
        header: 'PMI'
    }),
    columnHelper.accessor('clientCode', {
        cell: info => info.getValue(),
        header: 'CLIENT CODE'
    }),
    columnHelper.accessor('dob', {
        cell: info => info.getValue(),
        header: 'DOB'
    }),
    columnHelper.accessor('address', {
        cell: info => info.getValue(),
        header: 'ADDRESS'
    }),
    columnHelper.accessor('city', {
        cell: info => info.getValue(),
        header: 'CITY'
    }),
    columnHelper.accessor('zip', {
        cell: info => info.getValue(),
        header: 'ZIP'
    })
]

const CaregiverListTable = () => {
    // State
    const [data] = useState(() => [...defaultData])
    const [search, setSearch] = useState('')

    // Table Hook
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        filterFns: {
            fuzzy: () => false
        }
    })

    return (
        <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
            {/* Search Bar and Export Buttons */}

            <Grid container spacing={2} alignItems="center" sx={{ mb: 2, p: 10 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        placeholder="Search name, phone number, pmi number"
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <span style={{ color: '#757575', marginLeft: '8px', marginTop: 8 }}>
                                    <i className='bx-search' />
                                </span>
                            )
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: '#FFC107', color: '#fff', fontWeight: 'bold' }}
                    >
                        Export to CSV
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: '#4CAF50', color: '#fff', fontWeight: 'bold' }}
                    >
                        Export PDF
                    </Button>
                </Grid>
            </Grid>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table
                    className={styles.table}
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}
                >
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr
                                key={headerGroup.id}
                                style={{
                                    backgroundColor: '#f5f5f5',
                                    borderBottom: '1px solid #E0E0E0'
                                }}
                            >
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        style={{
                                            textAlign: 'left',
                                            padding: '12px 16px',
                                            fontSize: '14px',
                                            color: '#616161',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                style={{
                                    borderBottom: '1px solid #E0E0E0',
                                    backgroundColor: '#fff',
                                    textAlign: 'left',
                                    cursor: 'pointer'
                                }}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} style={{ padding: '12px 16px', fontSize: '14px' }}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}

export default CaregiverListTable

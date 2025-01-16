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
type Client = {
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
const newDataSet: Client[] = [
    {
        id: 1,
        fullName: 'Ayesha Khan',
        pmi: '45200123',
        clientCode: '125789234',
        dob: '04/10/1990',
        address: '123 Maple Ave, New York, NY 10001, USA',
        city: 'New York',
        zip: '10001',
        avatar: '/path/to/avatar1.jpg'
    },
    {
        id: 2,
        fullName: 'Zain Ul Haq',
        pmi: '45200124',
        clientCode: '125789235',
        dob: '06/15/1987',
        address: '456 Elm St, Chicago, IL 60614, USA',
        city: 'Chicago',
        zip: '60614',
        avatar: '/path/to/avatar2.jpg'
    },
    {
        id: 3,
        fullName: 'Sophia Williams',
        pmi: '45200125',
        clientCode: '125789236',
        dob: '03/20/1995',
        address: '789 Pine Dr, Los Angeles, CA 90001, USA',
        city: 'Los Angeles',
        zip: '90001',
        avatar: '/path/to/avatar3.jpg'
    },
    {
        id: 4,
        fullName: 'Michael Johnson',
        pmi: '45200126',
        clientCode: '125789237',
        dob: '11/02/1992',
        address: '101 Birch Rd, Austin, TX 73301, USA',
        city: 'Austin',
        zip: '73301',
        avatar: '/path/to/avatar4.jpg'
    },
    {
        id: 5,
        fullName: 'Emily Davis',
        pmi: '45200127',
        clientCode: '125789238',
        dob: '09/13/1988',
        address: '202 Cedar Ln, Seattle, WA 98101, USA',
        city: 'Seattle',
        zip: '98101',
        avatar: '/path/to/avatar5.jpg'
    },
    {
        id: 6,
        fullName: 'Ali Ahmed',
        pmi: '45200128',
        clientCode: '125789239',
        dob: '07/28/1989',
        address: '303 Spruce Ct, Miami, FL 33101, USA',
        city: 'Miami',
        zip: '33101',
        avatar: '/path/to/avatar6.jpg'
    },
    {
        id: 7,
        fullName: 'Hannah Brown',
        pmi: '45200129',
        clientCode: '125789240',
        dob: '05/06/1993',
        address: '404 Oak Dr, Denver, CO 80201, USA',
        city: 'Denver',
        zip: '80201',
        avatar: '/path/to/avatar7.jpg'
    }
];




// Column Definitions
const columnHelper = createColumnHelper<Client>()

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
        header: 'CLIENT NAME'
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

const ClientListTable = () => {
    // State
    const [data] = useState(() => [...newDataSet])
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

export default ClientListTable

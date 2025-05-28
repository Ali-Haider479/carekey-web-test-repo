'use client'

import { useEffect, useState } from 'react'
import type { ClientTypes } from '@/types/apps/clientTypes'
import Grid from '@mui/material/Grid2'
import { Avatar, Button, Card, Icon, MenuItem, TextField, Typography, CircularProgress } from '@mui/material'
import { useRouter } from 'next/navigation'
import ReactTable from '@/@core/components/mui/ReactTable'
import api from '@/utils/api'


interface ClientTableProps {
    data: ClientTypes[]
    isLoading: boolean
}

const ClientTable = ({ data, isLoading }: ClientTableProps) => {
    const router = useRouter()
    const [dataWithProfileImg, setDataWithProfileImg] = useState<ClientTypes[]>([])
    const [search, setSearch] = useState('')
    const [filteredData, setFilteredData] = useState<ClientTypes[]>([])

    const handleNext = (id: any) => {
        router.push(`/en/apps/client/${id}/detail`)
    }

    useEffect(() => {
        if (data?.length > 0) {
            fetchProfileImages()
        }
    }, [data])

    const getProfileImage = async (key: string) => {
        try {
            const res = await api.get(`/client/getProfileUrl/${key}`)
            return res.data
        } catch (err) {
            throw Error(`Error in fetching profile image url, ${err}`)
        }
    }

    const fetchProfileImages = async () => {
        if (data) {
            const dataWithPhotoUrls = await Promise.all(
                data?.map(async (item: any) => {
                    const profileImgUrl =
                        item?.profileImgUrl !== null ? await getProfileImage(item?.profileImgUrl) : item?.profileImgUrl
                    return {
                        ...item,
                        profileImgUrl: profileImgUrl
                    }
                })
            )
            setDataWithProfileImg(dataWithPhotoUrls)
            setFilteredData(dataWithPhotoUrls)
        }
    }

    useEffect(() => {
        if (!search) {
            setFilteredData(dataWithProfileImg)
            return
        }

        const filtered = dataWithProfileImg.filter(item => {
            const fullName = `${item.firstName} ${item.lastName}`.toLowerCase()
            return fullName.includes(search.toLowerCase())
        })

        setFilteredData(filtered)
    }, [search, dataWithProfileImg])


    const newColumns = [
        // {
        //   field: 'itemNumber',
        //   headerName: '#',
        //   flex: 0.5,
        //   renderCell: (params: GridRenderCellParams) => <span>{params.row.index + 1}</span>
        // },
        {
            id: 'id',
            label: 'ID',
            minWidth: 200,
            editable: true,
            sortable: true,
            render: (item: any) => {
                return (
                    <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
                        <Typography color='primary'>{item.id}</Typography>
                    </div>
                )
            }
        },
        {
            id: 'clientName',
            label: 'CLIENT NAME',
            minWidth: 200,
            editable: true,
            sortable: true,
            render: (item: any) => {
                return (
                    <div className='w-full h-full cursor-pointer'>
                        <div
                            style={{ height: '50px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}
                            onClick={() => handleNext(item?.id)}
                        >
                            <Avatar alt={item.firstName} src={item.profileImgUrl} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong>{`${item.firstName} ${item.lastName}`}</strong>
                            </div>
                        </div>
                    </div>
                )
            }
        },
        {
            id: 'firstName',
            label: 'FIRST NAME',
            minWidth: 200,
            editable: true,
            sortable: true,
            render: (item: any) => {
                return (
                    <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
                        <Typography color='primary'>{item?.firstName}</Typography>
                    </div>
                )
            }
        },
        {
            id: 'lastName',
            label: 'LAST NAME',
            minWidth: 200,
            editable: true,
            sortable: true,
            render: (item: any) => {
                return (
                    <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
                        <Typography color='primary'>{item?.lastName}</Typography>
                    </div>
                )
            }
        },
        {
            id: 'pmiNumber',
            label: 'PMI NUMBER',
            minWidth: 200,
            editable: true,
            sortable: true,
            render: (item: any) => {
                return (
                    <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
                        <Typography color='primary'>{item?.pmiNumber}</Typography>
                    </div>
                )
            }
        },
        {
            id: 'insuranceCode',
            label: 'INSURANCE CODE',
            minWidth: 200,
            editable: true,
            sortable: true,
            render: (item: any) => {
                return (
                    <div className='w-full cursor-pointer' onClick={() => handleNext(item?.id)}>
                        <Typography color='primary'>{item?.insuranceCode}</Typography>
                    </div>
                )
            }
        }
    ]
    return (

        <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: 1, boxShadow: 3, p: 0 }}>
                <Grid sx={{ p: 5 }}>
                    <div className='flex flex-row justify-between'>
                        <TextField
                            className='w-[50%]' // Ensures the input takes up most of the width
                            placeholder='Search name'
                            variant='outlined'
                            size='small'
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <span className='text-gray-500 ml-2 mt-2'>
                                        <i className='bx bx-search' />
                                    </span>
                                )
                            }}
                        />
                        <Button
                            variant='contained'
                            onClick={() => {
                                router.push('/en/apps/client/add-client')
                            }}
                        >
                            Add Client
                        </Button>
                    </div>
                </Grid>
                {isLoading ? (
                    <div className='flex items-center justify-center p-10'>
                        <CircularProgress />
                    </div>
                ) : !data.length ? ( // Changed from dataWithProfileImg to filteredData
                    <Card>
                        <div className='flex flex-col items-center justify-center p-10 gap-2'>
                            <Icon className='bx-folder-open text-6xl text-textSecondary' />
                            <Typography variant='h6'>No Data Available</Typography>
                            <Typography variant='body2' className='text-textSecondary'>
                                No records found. Click 'Add New Client' to create one.
                            </Typography>
                            <Button
                                variant='contained'
                                startIcon={<i className='bx-plus' />}
                                onClick={() => {
                                    router.push('/en/apps/client/add-client')
                                }}
                                className='mt-4'
                                sx={{ backgroundColor: '#4B0082' }}
                            >
                                Add New Client
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <ReactTable
                        columns={newColumns}
                        data={filteredData} // Changed from dataWithProfileImg to filteredData
                        keyExtractor={item => item.id.toString()}
                        enablePagination
                        pageSize={5}
                        stickyHeader
                        maxHeight={600}
                        containerStyle={{ borderRadius: 2 }}
                    />
                )}
            </Card>
        </Grid>
    )
}


export default ClientTable;

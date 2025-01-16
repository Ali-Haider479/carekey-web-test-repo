'use client'
// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import type { ButtonProps } from '@mui/material/Button'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import EditUserInfo from '@components/dialogs/edit-user-info'
import EditTenantInfo from '@/components/dialogs/edit-tenant-info'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import CustomAvatar from '@core/components/mui/Avatar'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios';

const TenantDetails = () => {
    const { id } = useParams();
    const [tenantData, setTenantData] = useState<any>([])
    // const currentTenant = useSelector((state: { tenantReducer: any }) => state.tenantReducer.currentViewTenant)

    // Vars
    const buttonProps = (children: string, color: ThemeColor, variant: ButtonProps['variant'], overRideColor?: string): ButtonProps => ({
        children,
        color,
        variant,
        sx: { backgroundColor: overRideColor }
    })

    useEffect(() => {
        // Define an async function inside useEffect
        const fetchTenantData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/tenant/${id}`
                );
                const data = response.data;

                // Optionally save the data to localStorage
                localStorage.setItem("view-tenant", JSON.stringify(data));

                // Update the state with fetched data
                setTenantData(data);
            } catch (error) {
                console.error("Error fetching tenant data:", error);
            }
        };

        // Call the async function
        fetchTenantData();
    }, [id]); // Re-run the effect if `id` changes

    console.log('CURRENT TENANT VIEW', tenantData)
    return (
        <>
            <Card>
                <CardContent className='flex flex-col pbs-12 gap-6'>
                    <div className='flex flex-col gap-6'>
                        <div className='flex items-center justify-center flex-col gap-4'>
                            <div className='flex flex-col items-center gap-4'>
                                <CustomAvatar alt='user-profile' src='/images/avatars/1.png' variant='rounded' size={120} />
                                <Typography variant='h5'>{tenantData.users && tenantData?.users[0]?.userName}</Typography>
                            </div>
                            <Chip label='Admin' color='error' size='small' variant='tonal' />
                        </div>
                        <div className='flex items-center justify-around flex-wrap gap-4'>
                            <div className='flex items-center gap-4'>
                                <CustomAvatar variant='rounded' color='primary' skin='light' sx={{ color: "#4B0082" }}>
                                    <i className='bx-check' />
                                </CustomAvatar>
                                <div>
                                    <Typography variant='h5'>1.23k</Typography>
                                    <Typography>Task Done</Typography>
                                </div>
                            </div>
                            <div className='flex items-center gap-4'>
                                <CustomAvatar variant='rounded' color='primary' skin='light' sx={{ color: "#4B0082" }}>
                                    <i className='bx-customize' />
                                </CustomAvatar>
                                <div>
                                    <Typography variant='h5'>568</Typography>
                                    <Typography>Project Done</Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Typography variant='h5'>Details</Typography>
                        <Divider className='mlb-4' />
                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center flex-wrap gap-x-1.5'>
                                <Typography variant='h6'>Tenant Name:</Typography>
                                <Typography>{tenantData.companyName}</Typography>
                            </div>
                            <div className='flex items-center flex-wrap gap-x-1.5'>
                                <Typography variant='h6'>Billing Email:</Typography>
                                <Typography>{tenantData.billingEmail}</Typography>
                            </div>
                            <div className='flex items-center flex-wrap gap-x-1.5'>
                                <Typography variant='h6'>Status</Typography>
                                <Typography color='text.primary'>{tenantData.status}</Typography>
                            </div>
                            <div className='flex items-center flex-wrap gap-x-1.5'>
                                <Typography variant='h6'>Tax ID:</Typography>
                                <Typography color='text.primary'>{tenantData.taxonomyNumber}</Typography>
                            </div>
                            <div className='flex items-center flex-wrap gap-x-1.5'>
                                <Typography variant='h6'>Contact:</Typography>
                                <Typography color='text.primary'>{tenantData.contactNumber}</Typography>
                            </div>
                            <div className='flex items-center flex-wrap gap-x-1.5'>
                                <Typography variant='h6'>FAX:</Typography>
                                <Typography color='text.primary'>{tenantData.faxNumber}</Typography>
                            </div>
                            <div className='flex items-center flex-wrap gap-x-1.5'>
                                <Typography variant='h6'>Address:</Typography>
                                <Typography color='text.primary'>{tenantData.address}</Typography>
                            </div>
                        </div>
                    </div>
                    <div className='flex gap-4 justify-center'>
                        <OpenDialogOnElementClick
                            element={Button}
                            elementProps={buttonProps('Edit', 'secondary', 'contained', '#4B0082')}
                            dialog={EditTenantInfo}
                            dialogProps={{ data: tenantData }}
                        />
                        <OpenDialogOnElementClick
                            element={Button}
                            elementProps={buttonProps('Suspend', 'error', 'tonal')}
                            dialog={ConfirmationDialog}
                            dialogProps={{ type: 'suspend-account' }}
                        />
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

export default TenantDetails

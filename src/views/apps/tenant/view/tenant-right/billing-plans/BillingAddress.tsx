'use client'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import type { ButtonProps } from '@mui/material/Button'

// Component Imports
import AddNewAddress from '@components/dialogs/add-edit-address'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'

const BillingAddress = () => {
  const { id } = useParams();
  const [tenantData, setTenantData] = useState<any>([])

  const buttonProps: ButtonProps = {
    variant: 'contained',
    children: 'Edit Address',
    size: 'small',
    startIcon: <i className='bx-plus' />,
    sx: { backgroundColor: '#4B0082' }
  }

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

  console.log('TENANT DATA BILLING', tenantData)
  return (
    <>
      <Card>
        <CardHeader
          title='Billing Address'
          action={
            <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps}
              dialog={AddNewAddress}
              dialogProps={{ tenantData }}
            />
          }
        />
        <CardContent>
          {tenantData?.billingDetails && (
            <Grid container>
              <Grid size={{ xs: 12, md: 6 }}>
                <table>
                  <tbody className='align-top'>
                    <tr>
                      <td className='p-1 pis-0 is-[150px]'>
                        <Typography variant='h6'>Company Name:</Typography>
                      </td>
                      <td className='p-1'>
                        <Typography>{tenantData?.billingDetails[0]?.contactName}</Typography>
                      </td>
                    </tr>
                    <tr>
                      <td className='p-1 pis-0 is-[150px]'>
                        <Typography variant='h6'>Billing Email:</Typography>
                      </td>
                      <td className='p-1'>
                        <Typography>{tenantData?.billingDetails[0]?.contactEmail}</Typography>
                      </td>
                    </tr>
                    <tr>
                      <td className='p-1 pis-0 is-[150px]'>
                        <Typography variant='h6'>Tax ID:</Typography>
                      </td>
                      <td className='p-1'>
                        <Typography>{tenantData?.billingDetails[0]?.taxId}</Typography>
                      </td>
                    </tr>
                    <tr>
                      <td className='p-1 pis-0 is-[150px]'>
                        <Typography variant='h6'>Billing Address:</Typography>
                      </td>
                      <td className='p-1'>
                        <Typography>{tenantData?.billingDetails[0]?.billingAddress}</Typography>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <table>
                  <tbody className='align-top'>
                    <tr>
                      <td className='p-1 pis-0 is-[150px]'>
                        <Typography variant='h6'>Token:</Typography>
                      </td>
                      <td className='p-1'>
                        <Typography>{tenantData?.billingDetails[0]?.token}</Typography>
                      </td>
                    </tr>
                    <tr>
                      <td className='p-1 pis-0 is-[150px]'>
                        <Typography variant='h6'>Country:</Typography>
                      </td>
                      <td className='p-1'>
                        <Typography>{tenantData?.billingDetails[0]?.country}</Typography>
                      </td>
                    </tr>
                    <tr>
                      <td className='p-1 pis-0 is-[150px]'>
                        <Typography variant='h6'>City:</Typography>
                      </td>
                      <td className='p-1'>
                        <Typography>{tenantData?.billingDetails[0]?.city}</Typography>
                      </td>
                    </tr>
                    <tr>
                      <td className='p-1 pis-0 is-[150px]'>
                        <Typography variant='h6'>Zip Code:</Typography>
                      </td>
                      <td className='p-1'>
                        <Typography>{tenantData?.billingDetails[0]?.zipCode}</Typography>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default BillingAddress

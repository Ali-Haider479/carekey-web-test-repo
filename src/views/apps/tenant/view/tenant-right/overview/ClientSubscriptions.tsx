'use client'
import { Done, Star, StarBorder, StarBorderOutlined } from '@mui/icons-material'
import { Card, Typography, Grid2 as Grid, Button, IconButton } from '@mui/material'
import React, { useState } from 'react'

const ClientSubscriptions = () => {
  const [subscribed, setSubscribed] = useState(false)
  const [favourite, setFavourite] = useState(false)

  const toggleSubscribed = () => {
    if (subscribed === true) {
      setSubscribed(false)
    } else {
      setSubscribed(true)
    }
  }

  const toggleFavourite = () => {
    if (favourite === true) {
      setFavourite(false)
    } else {
      setFavourite(true)
    }
  }

  return (
    <div>
      <Card className='p-5'>
        <Typography variant='h5' className='mb-3'>
          Client Subscriptions
        </Typography>
        <Grid container spacing={4}>
          <Grid size={{ sm: 6, md: 6 }}>
            <div className='border border-gray-300 rounded-sm p-2 w-full'>
              <div className='flex flex-row mt-2'>
                <div className='h-10 w-10 rounded-full flex items-center justify-center bg-[#ededff]'>
                  <i className='bx-money bg-[#4B0082]' />
                </div>
                <div className='ml-3'>
                  <Typography className='font-semibold text-sm'>RCM Subscriptions</Typography>
                  <Typography>Descriptions</Typography>
                </div>
              </div>
              <div className='mt-5'>
                <Typography variant='h4'>$99</Typography>
              </div>
              <div className='mt-3 flex flex-row justify-between'>
                <div className='flex flex-row'>
                  <Button
                    variant={subscribed ? 'outlined' : 'contained'}
                    onClick={toggleSubscribed}
                    startIcon={subscribed ? <Done className='text-[#4B0082] ml-1' /> : ''}
                    className='px-4'
                  >
                    {subscribed ? 'Subscribed' : 'Subscribe'}
                  </Button>
                  {subscribed && <Button className='ml-3 text-red-600 hover:bg-red-100'>Cancel</Button>}
                </div>
                <div>
                  <IconButton
                    onClick={() => {
                      toggleFavourite()
                    }}
                    // className='ml-32'
                  >
                    {favourite ? <Star className='text-yellow-500' /> : <StarBorder />}
                  </IconButton>
                </div>
              </div>
            </div>
          </Grid>
          <Grid size={{ sm: 6, md: 6 }}>
            <div className='border border-gray-300 rounded-sm p-2 w-full'>
              <div className='flex flex-row mt-2'>
                <div className='h-10 w-10 rounded-full flex items-center justify-center bg-[#ededff]'>
                  <i className='bx-money bg-[#4B0082]' />
                </div>
                <div className='ml-3'>
                  <Typography className='font-semibold text-sm'>RCM Subscriptions</Typography>
                  <Typography>Descriptions</Typography>
                </div>
              </div>
              <div className='mt-5'>
                <Typography variant='h4'>$99</Typography>
              </div>
              <div className='mt-3 flex flex-row justify-between'>
                <div className='flex flex-row'>
                  <Button
                    variant={subscribed ? 'outlined' : 'contained'}
                    onClick={toggleSubscribed}
                    startIcon={subscribed ? <Done className='text-[#4B0082] ml-1' /> : ''}
                    className='px-4'
                  >
                    {subscribed ? 'Subscribed' : 'Subscribe'}
                  </Button>
                  {subscribed && <Button className='ml-3 text-red-600 hover:bg-red-100'>Cancel</Button>}
                </div>
                <div>
                  <IconButton
                    onClick={() => {
                      toggleFavourite()
                    }}
                    // className='ml-32'
                  >
                    {favourite ? <Star className='text-yellow-500' /> : <StarBorder />}
                  </IconButton>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      </Card>
    </div>
  )
}

export default ClientSubscriptions

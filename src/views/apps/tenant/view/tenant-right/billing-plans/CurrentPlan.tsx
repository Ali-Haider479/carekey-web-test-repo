'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import LinearProgress from '@mui/material/LinearProgress'
import type { ButtonProps } from '@mui/material/Button'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { PricingPlanType } from '@/types/pages/pricingTypes'

// Component Imports
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import UpgradePlan from '@components/dialogs/upgrade-plan'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import { useEffect, useState } from 'react'
import { CircularProgress, Dialog } from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { useParams } from 'next/navigation'
import api from '@/utils/api'
import { useSession } from 'next-auth/react'
import { CheckCircle } from '@mui/icons-material'
import { planDetails } from '@/utils/constants'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'
import { useDispatch, useSelector } from 'react-redux'
import { clearPlan, selectPlan, setPlan } from '@/redux-store/slices/plan'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const CurrentPlan = ({ data }: { data?: PricingPlanType[] }) => {
  // Vars
  const buttonProps = (
    children: string,
    variant: ButtonProps['variant'],
    color: ThemeColor,
    overRideColor?: string
  ): ButtonProps => ({
    children,
    variant,
    color,
    sx: { backgroundColor: overRideColor }
  })

  const { data: session, update } = useSession()
  const { id } = useParams()
  const tenantId = id

  const dispatch = useDispatch()

  const plan = useSelector(selectPlan)

  console.log('Session Data in billing: ', session)

  const [subscriptionModalShow, setSubscriptionModalShow] = useState(false)
  const [cancelSubscriptionModal, setCancelSubscriptionModal] = useState(false)
  const [cancelButtonLoading, setCancelButtonLoading] = useState(false)
  const [loadingStates, setLoadingStates] = useState<any>({})
  const [tenantData, setTenantData] = useState<any>(session?.user?.tenant || null)

  const handleSubscriptionModalOpen = () => setSubscriptionModalShow(true)
  const handleSubscriptionModalClose = () => setSubscriptionModalShow(false)
  const handleCancelSubscriptionModalOpen = () => setCancelSubscriptionModal(true)
  const handleCancelSubscriptionModalClose = () => setCancelSubscriptionModal(false)

  const fetchTenantData = async () => {
    try {
      const response = await api.get(`/tenant/${tenantId}`)
      const data = response.data
      setTenantData(data)
    } catch (error) {
      console.error('Error fetching tenant data:', error)
    }
  }

  useEffect(() => {
    fetchTenantData()
  }, [])

  const handleSubscribe = async (priceId: string, tenantId: any, planId: any, planType: string) => {
    setLoadingStates((prev: any) => ({ ...prev, [planId]: true }))
    try {
      // Get the current active subscription ID, if any
      const currentSubscriptionId = sortedPayments?.length > 0 ? sortedPayments[0].stripeSubscriptionId : null

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/stripe/create-checkout-session`,
        {
          priceId,
          tenantId,
          currentSubscriptionId, // Send current subscription ID to cancel it
          planType
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      const { sessionId } = response.data
      const stripe = await stripePromise
      const res = await stripe?.redirectToCheckout({ sessionId })
      console.log('Tenant Payment Res', res)
    } catch (error: any) {
      console.error('Frontend error:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
      }
    } finally {
      setLoadingStates((prev: any) => ({ ...prev, [planId]: false }))
    }
  }

  // Sort stripePayments by createdAt descending and get the last active plan
  const sortedPayments = tenantData?.stripePayments
    ?.filter((payment: any) => payment.status === 'active')
    ?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const lastSubscribedPlan =
    sortedPayments?.length > 0 ? planDetails?.find(plan => plan?.stripePriceId === sortedPayments[0]?.planId) : null

  const activeStripePayment = tenantData?.stripePayments?.filter((payment: any) => payment.status === 'active')

  console.log('ACTIVE STRIPE PAYMENT---', activeStripePayment)

  const remainingDays = activeStripePayment
    ? Math.ceil(
        (new Date(activeStripePayment?.currentPeriodEnd).getTime() -
          new Date(activeStripePayment?.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0

  console.log('REMAINING DAYS---', remainingDays)

  // Get all active subscribed plan IDs
  const subscribedPlanIds = [plan?.planId]

  const currentPlan = plan || null

  const handleCancelSubscription = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setCancelButtonLoading(true)
      const response = await api.post(`/stripe/cancel-subscription`, { tenantId: tenantId })
      const updateSession = await update({
        user: {
          ...session?.user,
          subscribedPlan: null,
          accessToken: session?.user?.accessToken,
          refreshToken: session?.user?.refreshToken
        }
      })
      console.log('Session after cancelling subscription---', updateSession)
      dispatch(clearPlan())
      fetchTenantData()
      handleCancelSubscriptionModalClose()
    } catch (error) {
      console.error('Error cancelling subscription:', error)
    } finally {
      setCancelButtonLoading(false)
    }
  }

  return (
    <>
      {!plan?.id ? (
        <Grid size={{ xs: 12, md: 12, lg: 12 }}>
          <Card className='p-6 text-center mb-0 rounded-lg w-full'>
            <div className='text-center'>
              {/* <CloudOutlined className='mx-auto mb-4 text-[#666CFF]' style={{ fontSize: '64px' }} /> */}
              <Typography className='text-2xl font-bold text-gray-600 mb-3'>No Active Subscription</Typography>
              <Typography className='text-gray-600 mb-3'>
                It looks like your tenant does not have an active subscription plan. <br /> Please subscribe to a plan
                to access all the features.
              </Typography>
              <Button variant='contained' onClick={handleSubscriptionModalOpen}>
                View Plan Details
              </Button>
            </div>
          </Card>
        </Grid>
      ) : (
        <Card>
          <CardHeader title='Current Plan' />
          <CardContent>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, md: 6 }} className='flex flex-col gap-4'>
                <div>
                  <Typography variant='h6'>Your Current Plan is {currentPlan?.planName}</Typography>
                  {currentPlan?.planName === 'Enterprise' ? (
                    <Typography>A premium plan to access all features</Typography>
                  ) : (
                    <Typography>A simple start for everyone</Typography>
                  )}
                </div>
                <div>
                  <Typography variant='h6'>
                    Active until {activeStripePayment?.currentPeriodEnd?.split('T')[0]}
                  </Typography>
                  <Typography>We will send you a notification upon Subscription expiration</Typography>
                </div>
                <div className='flex flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <Typography variant='h6'>${currentPlan?.monthlyCost} Per Month</Typography>
                    {currentPlan?.planName === 'Standard' && (
                      <Chip
                        color='primary'
                        label='Popular'
                        size='small'
                        variant='tonal'
                        sx={{
                          '& .MuiChip-label': {
                            color: '#4B0082' // Set text color
                          }
                        }}
                      />
                    )}
                  </div>
                  {currentPlan?.planName === 'Enterprise' ? (
                    <Typography>Advanced plan for scaling businesses</Typography>
                  ) : (
                    <Typography>Standard plan for small to medium businesses</Typography>
                  )}
                  {/* <Typography></Typography> */}
                </div>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {!activeStripePayment?.id && (
                  <Alert icon={false} severity='warning' className='mbe-4'>
                    <AlertTitle>We need your attention!</AlertTitle>
                    Your plan requires update
                  </Alert>
                )}
                <div className='flex items-center justify-between'>
                  <Typography variant='h6'>Days</Typography>
                  <Typography variant='h6'>26 of 30 Days</Typography>
                </div>
                <LinearProgress
                  variant='determinate'
                  value={80}
                  className='mlb-1 bs-2.5'
                  sx={{
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4B0082' // Set the color of the progress bar
                    }
                  }}
                />
                <Typography variant='body2'>Your plan requires update</Typography>
              </Grid>
              <Grid size={{ xs: 12 }} className='flex gap-4 flex-wrap'>
                {/* <OpenDialogOnElementClick
                  element={Button}
                  elementProps={buttonProps('Upgrade plan', 'contained', 'primary', '#4B0082')}
                  dialog={UpgradePlan}
                  dialogProps={{ data: data }}
                /> */}
                <Button variant='contained' onClick={handleSubscriptionModalOpen}>
                  Upgrade Plan
                </Button>
                {/* <OpenDialogOnElementClick
              element={Button}
              elementProps={buttonProps('Cancel Subscription', 'tonal', 'error')}
              dialog={ConfirmationDialog}
              dialogProps={{ type: 'unsubscribe' }}
            /> */}
                <Button color='error' onClick={handleCancelSubscriptionModalOpen}>
                  Cancel Subscription
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      <Dialog
        open={cancelSubscriptionModal}
        onClose={handleCancelSubscriptionModalClose}
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        maxWidth='md'
      >
        <DialogCloseButton onClick={handleCancelSubscriptionModalClose} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <div className='flex items-center justify-center w-full px-5 flex-col'>
          <form onSubmit={handleCancelSubscription}>
            <div>
              <h2 className='text-xl font-semibold mt-5 mb-4'>Unsubscribe Current Plan</h2>
            </div>
            <div>
              <Typography className='mb-7'>
                Are you sure you want to unsubscribe the current tenant subscription plan?
              </Typography>
            </div>
            <div className='flex gap-4 justify-end mt-4 mb-4 w-full'>
              <Button variant='outlined' color='secondary' onClick={handleCancelSubscriptionModalClose}>
                NO
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={cancelButtonLoading}
                startIcon={cancelButtonLoading ? <CircularProgress size={20} color='inherit' /> : null}
              >
                YES
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      <Dialog
        open={subscriptionModalShow}
        onClose={handleSubscriptionModalClose}
        closeAfterTransition={false}
        // sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        sx={{
          '& .MuiDialog-paper': {
            overflow: 'visible', // Change to 'auto' for vertical scrolling if content exceeds height
            minHeight: '700px', // Increase min-height to fit content (adjust based on your needs; e.g., 550px accommodates taller cards)
            maxHeight: '90vh', // Optional: Limit to 90% of viewport height to prevent full-screen takeover, with scrolling
            // width: 'auto', // Let width adjust based on content
            maxWidth: '1100px', // Optional: Constrain width for the two cards (300px each + gap + padding)
            minWidth: '750px' // Optional: Ensure a minimum width to prevent excessive shrinking
          }
        }}
        maxWidth={false}
      >
        <DialogCloseButton onClick={handleSubscriptionModalClose} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <div className='flex items-center justify-center pt-[20px] pb-[20px] w-full px-[20px]'>
          <div className='flex flex-row gap-3'>
            {planDetails?.map((item: any) => {
              const isSubscribed = subscribedPlanIds.includes(item.stripePriceId)
              return (
                <div
                  key={item.id}
                  className='border-2 border-[#4B0082] shadow-primarySm p-5 rounded-md h-[700px] w-[350px]'
                >
                  <div className='bg-[#e3d5ea] rounded-sm p-1 flex justify-center'>
                    <Typography variant='h6' className='text-[#4B0082] text-lg'>
                      {item.plan}
                    </Typography>
                  </div>
                  <div className='flex flex-row mt-5'>
                    <Typography className='font-bold text-3xl'>${item.price}</Typography>
                    <Typography className='ml-1 mt-1 text-lg'>/mo</Typography>
                  </div>
                  <div className='mt-7'>
                    <Typography className='font-bold text-base'>Privileges: </Typography>
                    <div className='h-[220px]'>
                      {item.previledges.map((previledge: any) => (
                        <div key={previledge.id} className='flex flex-row items-center mt-1'>
                          <CheckCircle className='text-[#4B0082] text-base' />
                          <Typography className='ml-1 text-base'>{previledge.string}</Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className='mt-[250px] flex justify-center'>
                    <Button
                      variant='contained'
                      className='w-full'
                      onClick={() => !isSubscribed && handleSubscribe(item.stripePriceId, id, item.id, item.plan)}
                      disabled={loadingStates[item.id] || isSubscribed}
                    >
                      {loadingStates[item.id] ? 'Processing...' : isSubscribed ? 'Current Plan' : 'Upgrade Plan'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default CurrentPlan

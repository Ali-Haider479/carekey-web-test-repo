'use client'
// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { loadStripe } from '@stripe/stripe-js'
// Component Imports
import { Dialog, Grid2 as Grid } from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { useEffect, useState } from 'react'
import { CheckCircle } from '@mui/icons-material'
import { useParams } from 'next/navigation'
import axios from 'axios'
import api from '@/utils/api'
import { planDetails } from '@/utils/constants'
import { useSession } from 'next-auth/react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const TenantPlan = ({ tenantData }: any) => {
  const { id } = useParams()
  const { data: session } = useSession()
  const [loadingStates, setLoadingStates] = useState<any>({})
  const [planDetailsData, setPlanDetailsData] = useState<any>(null)
  const [isModalShow, setIsModalShow] = useState(false)

  const fetchPlanDetails = async () => {
    try {
      const response = await api.get(`/plan`)
      const data = response.data
      setPlanDetailsData(data)
    } catch (error) {
      console.error('Error fetching plan details:', error)
    }
  }

  useEffect(() => {
    fetchPlanDetails()
  }, [])

  // Sort stripePayments by createdAt descending and get the last active plan
  const sortedPayments = tenantData?.stripePayments
    ?.filter((payment: any) => payment.status === 'active')
    ?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const lastSubscribedPlan =
    sortedPayments?.length > 0 ? planDetails?.find(plan => plan.stripePriceId === sortedPayments[0].planId) : null

  // Get all active subscribed plan IDs
  const subscribedPlanIds = [session?.user?.subscribedPlan?.planId]

  const handleModalClose = () => {
    setIsModalShow(false)
  }

  const handleSubscribe = async (priceId: string, tenantId: any, planId: any, planType: string) => {
    setLoadingStates((prev: any) => ({ ...prev, [planId]: true }))
    try {
      // Get the current active subscription ID, if any
      const currentSubscriptionId = sortedPayments?.length > 0 ? sortedPayments[0]?.stripeSubscriptionId : null

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

  console.log('PLANS---', tenantData)

  return (
    <>
      <Card className='border-2 border-[#4B0082] shadow-primarySm'>
        <CardContent className='flex flex-col gap-6'>
          {session?.user?.subscribedPlan?.id ? (
            <div className='flex flex-col'>
              <Typography variant='h4' className='font-bold text-center'>
                Subscribed Plan
              </Typography>
              <Typography variant='h4' className='font-bold text-center'>
                {lastSubscribedPlan?.plan}
              </Typography>
              <ul className='list-disc pl-5'>
                {lastSubscribedPlan?.previledges.map((privilege: any) => (
                  <li key={privilege.id} className='text-base'>
                    {privilege.string}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <div className='flex justify-center'>
                <Chip label='Pricing' size='small' color='primary' variant='tonal' />
              </div>
              <div className='flex flex-col gap-2'>
                <Typography variant='h4' className='font-bold text-center text-[1rem] md:text-[2rem]'>
                  Choose the plan that fits your needs.
                </Typography>
                <Typography variant='body2' className='text-center text-[1rem]'>
                  Pricing details available below. Select a plan to unlock team management tools, scalable storage, and
                  dedicated support.
                </Typography>
              </div>
            </>
          )}
          <Button variant='contained' onClick={() => setIsModalShow(true)} className='w-full'>
            {lastSubscribedPlan ? 'Upgrade Plan' : 'View Plan Options'}
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={isModalShow}
        onClose={handleModalClose}
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
        <DialogCloseButton onClick={handleModalClose} disableRipple>
          <i className='bx-x' />
        </DialogCloseButton>
        <div className='flex items-center justify-center pt-[20px] pb-[20px] w-full px-[20px]'>
          <div className='flex flex-row gap-3'>
            {planDetails?.map((item: any) => {
              const isSubscribed = subscribedPlanIds?.includes(item.stripePriceId)
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

export default TenantPlan

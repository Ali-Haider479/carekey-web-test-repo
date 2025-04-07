// src/app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    // Log that the route is hit
    console.log('INSIDE POST request received at /api/create-checkout-session')

    // Log the raw request body
    const rawBody = await request.text()
    console.log('INSIDE Raw request body:', rawBody)

    // Parse the JSON body
    let body
    try {
      body = JSON.parse(rawBody)
    } catch (jsonError) {
      console.error('Failed to parse JSON:', jsonError)
      throw new Error('Invalid JSON in request body')
    }
    const { priceId, tenantId } = body
    console.log('Parsed priceId:', priceId)

    // Validate priceId
    if (!priceId || typeof priceId !== 'string') {
      throw new Error('priceId is missing or invalid')
    }

    // Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
    }
    console.log('STRIPE_SECRET_KEY is set')

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.warn('NEXT_PUBLIC_BASE_URL not set, using default')
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia'
    })
    console.log('INSIDE Stripe initialized successfully')

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/en/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cancel`,
      metadata: { tenantId }, // Add tenantId to Checkout Session metadata
      subscription_data: {
        metadata: { tenantId } // Add tenantId to subscription metadata
      }
    })
    console.log('Checkout session created:', session.id)

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error in /api/create-checkout-session:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Optional: Export config if needed (e.g., for runtime settings)
export const config = {
  runtime: 'nodejs' // Ensure Node.js runtime
}

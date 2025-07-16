import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handleSuccessfulPayment(paymentIntent)
      break
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent
      await handleFailedPayment(failedPayment)
      break
    
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId

    if (orderId && orderId !== 'pending') {
      // Update order payment status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          status: 'PROCESSING'
        }
      })

      console.log(`Payment successful for order ${orderId}`)
      
      // Here you could also:
      // - Send confirmation email
      // - Update inventory
      // - Trigger fulfillment process
    }
  } catch (error) {
    console.error('Error handling successful payment:', error)
  }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId

    if (orderId && orderId !== 'pending') {
      // Update order payment status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'failed'
        }
      })

      console.log(`Payment failed for order ${orderId}`)
    }
  } catch (error) {
    console.error('Error handling failed payment:', error)
  }
}
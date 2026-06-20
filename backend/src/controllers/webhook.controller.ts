import type { RequestHandler } from 'express'
import Stripe from 'stripe'
import { env } from '../config/env'
import { OrderService } from '../services/order.service'

const stripe = new Stripe(env.STRIPE_SECRET_KEY)
const orderService = new OrderService()

export const stripeWebhook: RequestHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    res.status(400).send('Webhook signature invalid')
    return
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    const orderId = intent.metadata?.orderId
    if (orderId) {
      try {
        await orderService.markPaid(orderId, intent.id)
      } catch (err) {
        console.error('Failed to mark order paid:', err)
        res.status(500).json({ error: 'Failed to process payment' })
        return
      }
    }
  }

  res.json({ received: true })
}

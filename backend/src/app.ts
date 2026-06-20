import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { env } from './config/env'
import { errorHandler } from './middleware/error.middleware'
import authRoutes from './routes/auth.routes'
import productRoutes from './routes/product.routes'
import orderRoutes from './routes/order.routes'
import cartRoutes from './routes/cart.routes'
import accountRoutes from './routes/account.routes'
import webhookRoutes from './routes/webhook.routes'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
  app.use(cookieParser())

  // Stripe webhook needs raw body — must be registered before express.json()
  app.use('/api/webhooks', webhookRoutes)

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  const authLimiter = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false })

  app.use('/api/auth', authLimiter, authRoutes)
  app.use('/api/products', productRoutes)
  app.use('/api/orders', orderRoutes)
  app.use('/api/cart', cartRoutes)
  app.use('/api/account', accountRoutes)

  app.get('/api/health', (_req, res) => res.json({ ok: true }))

  app.use(errorHandler)

  return app
}

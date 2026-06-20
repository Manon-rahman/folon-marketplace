# BACKEND.md — Express + TypeScript Conventions

## Setup

```bash
cd backend
npm install
npm run dev     # ts-node-dev, hot-reload, :4000
npm run build   # tsc → dist/
npm start       # node dist/index.js
```

---

## Project Layout

```
backend/src/
├── index.ts              # Server bootstrap
├── app.ts                # Express app factory (no listen here)
├── config/
│   └── env.ts            # Zod-validated env
├── db/
│   ├── pool.ts           # Singleton pg.Pool
│   └── migrations/       # 001_initial.sql, 002_add_orders.sql …
├── routes/
│   ├── auth.routes.ts
│   ├── product.routes.ts
│   ├── order.routes.ts
│   └── webhook.routes.ts
├── controllers/          # Thin: parse → call service → respond
├── services/             # Business logic
├── repositories/         # All SQL lives here
├── middleware/
│   ├── auth.middleware.ts
│   ├── validate.middleware.ts
│   └── error.middleware.ts
└── types/
    └── index.ts
```

---

## Environment Validation (`config/env.ts`)

```ts
import { z } from 'zod'

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  FRONTEND_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export const env = schema.parse(process.env)
```

---

## API Response Envelope

**Every** API response uses this shape:

```ts
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string } }
```

Use these helpers in `types/index.ts`:

```ts
export const ok = <T>(res: Response, data: T, status = 200) =>
  res.status(status).json({ success: true, data })

export const fail = (res: Response, code: string, message: string, status = 400) =>
  res.status(status).json({ success: false, error: { code, message } })
```

---

## Route → Controller → Service → Repository Pattern

### Route (`routes/product.routes.ts`)

```ts
import { Router } from 'express'
import { listProducts, getProduct } from '../controllers/product.controller'

const router = Router()
router.get('/', listProducts)
router.get('/:slug', getProduct)
export default router
```

### Controller (`controllers/product.controller.ts`)

```ts
import { RequestHandler } from 'express'
import { ProductService } from '../services/product.service'
import { ok, fail } from '../types'

const productService = new ProductService()

export const listProducts: RequestHandler = async (req, res, next) => {
  try {
    const products = await productService.list()
    ok(res, products)
  } catch (err) { next(err) }
}

export const getProduct: RequestHandler = async (req, res, next) => {
  try {
    const product = await productService.findBySlug(req.params.slug)
    if (!product) return fail(res, 'NOT_FOUND', 'Product not found', 404)
    ok(res, product)
  } catch (err) { next(err) }
}
```

### Service (`services/product.service.ts`)

```ts
import { ProductRepository } from '../repositories/product.repository'
import type { Product } from '../types'

export class ProductService {
  private repo = new ProductRepository()

  async list(): Promise<Product[]> {
    return this.repo.findAll()
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.repo.findBySlug(slug)
  }
}
```

### Repository (`repositories/product.repository.ts`)

```ts
import { pool } from '../db/pool'
import type { Product } from '../types'

export class ProductRepository {
  async findAll(): Promise<Product[]> {
    const { rows } = await pool.query<Product>(
      `SELECT id, name, slug, description, price, images, stock, metadata
       FROM products WHERE active = true ORDER BY created_at DESC`
    )
    return rows
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const { rows } = await pool.query<Product>(
      `SELECT * FROM products WHERE slug = $1 AND active = true`, [slug]
    )
    return rows[0] ?? null
  }
}
```

---

## Validation Middleware

```ts
// middleware/validate.middleware.ts
import { ZodSchema } from 'zod'
import { RequestHandler } from 'express'

export const validate = (schema: ZodSchema): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success)
      return res.status(422).json({ success: false, error: { code: 'VALIDATION', message: result.error.format() } })
    req.body = result.data
    next()
  }
```

Usage in routes:

```ts
import { validate } from '../middleware/validate.middleware'
import { z } from 'zod'

const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1) })),
  shippingAddress: z.object({ ... }),
})

router.post('/', authGuard, validate(createOrderSchema), createOrder)
```

---

## Auth Middleware

```ts
// middleware/auth.middleware.ts
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export const authGuard: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } })
  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    next()
  } catch {
    res.status(401).json({ success: false, error: { code: 'TOKEN_EXPIRED' } })
  }
}
```

---

## Global Error Middleware (must be last)

```ts
// middleware/error.middleware.ts
import { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  console.error(err)
  res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'Internal server error' } })
}
```

---

## Stripe Webhook Route (IMPORTANT)

Must use raw body — register **before** `express.json()` for this route only:

```ts
// app.ts
app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),  // ← raw body
  webhookHandler
)
app.use(express.json())  // all other routes get JSON parsing
```

```ts
// controllers/webhook.controller.ts
export const webhookHandler: RequestHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return res.status(400).send('Webhook signature invalid')
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    await orderService.markPaid(intent.metadata.orderId)
  }

  res.json({ received: true })
}
```

---

## TypeScript Shared Types (`types/index.ts`)

```ts
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number           // stored in cents
  images: string[]
  stock: number
  metadata: Record<string, unknown>
  active: boolean
  createdAt: Date
}

export interface Order {
  id: string
  userId: string | null
  status: 'pending' | 'paid' | 'shipped' | 'cancelled'
  items: OrderItem[]
  shippingAddress: Address
  stripePaymentIntentId: string
  totalAmount: number
  createdAt: Date
}

export interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
}

export interface Address {
  line1: string
  line2?: string
  city: string
  postalCode: string
  country: string
}

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: 'user' | 'admin' }
    }
  }
}
```

# ARCHITECTURE.md — System Design

## High-Level Diagram

```
┌─────────────────────────────────────────────────────┐
│                      Browser                        │
│              Nuxt 4 (SSR + SPA hybrid)              │
└───────────────────────┬─────────────────────────────┘
                        │ REST (JSON)
                        ▼
┌─────────────────────────────────────────────────────┐
│           Express + TypeScript  :4000               │
│                                                     │
│  ┌─────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Auth   │  │ Products │  │  Orders / Checkout │ │
│  │ Router  │  │  Router  │  │      Router        │ │
│  └────┬────┘  └────┬─────┘  └────────┬───────────┘ │
│       └────────────┴─────────────────┘             │
│                    │                               │
│              Service Layer                         │
│  ┌──────────────────────────────────────────────┐  │
│  │  AuthService │ ProductService │ OrderService │  │
│  └─────────────────────┬────────────────────────┘  │
│                        │                           │
│              Repository Layer (pg)                 │
└───────────────────────┬─────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
  ┌──────────────┐           ┌──────────────────┐
  │  PostgreSQL  │           │  Stripe API      │
  │  :5432       │           │  (external)      │
  └──────────────┘           └──────────────────┘
```

---

## Request Lifecycle

```
Browser → Nuxt Page (SSR fetch on server) → Express Route
       → Zod validation → Service → Repository → Postgres
       ← JSON response ← Service ← Repository
← Nuxt renders HTML with data
```

### Payment Flow (Stripe)

```
1. User clicks "Pay"
2. Frontend calls POST /api/orders  (creates order in DB, status=pending)
3. Backend calls Stripe: createPaymentIntent → returns client_secret
4. Frontend mounts Stripe Elements with client_secret
5. User submits card → Stripe processes
6. Stripe sends webhook → POST /api/webhooks/stripe
7. Backend: payment_intent.succeeded → order status=paid, stock--
8. Frontend polls GET /api/orders/:id until status=paid → show success
```

---

## Auth Flow (JWT)

```
POST /api/auth/register or /api/auth/login
  → returns { accessToken (15m), refreshToken (7d) }

accessToken stored in memory (Pinia store)
refreshToken stored in httpOnly cookie

Silent refresh: axios interceptor on 401 calls POST /api/auth/refresh
```

---

## Folder Conventions

### Frontend `frontend/`

```
frontend/
├── app.vue
├── nuxt.config.ts
├── pages/              # File-based routing
│   ├── index.vue       # Landing / product listing
│   ├── products/
│   │   └── [slug].vue  # Product detail
│   ├── cart.vue
│   └── checkout/
│       ├── index.vue   # Checkout form
│       └── success.vue # Order confirmation
├── components/
│   ├── ui/             # Generic design-system atoms (Button, Input…)
│   ├── product/        # ProductCard, ProductGrid, ProductGallery
│   ├── cart/           # CartDrawer, CartItem, CartSummary
│   └── checkout/       # CheckoutForm, PaymentElement, AddressForm
├── composables/
│   ├── useCart.ts
│   ├── useAuth.ts
│   ├── useProducts.ts
│   └── useCheckout.ts
├── stores/             # Pinia
│   ├── cart.ts
│   └── auth.ts
├── types/              # Shared TS interfaces (mirrors backend)
└── utils/
    ├── api.ts          # Typed axios instance
    └── format.ts       # Currency, date helpers
```

### Backend `backend/`

```
backend/
├── src/
│   ├── index.ts        # App entry + server bootstrap
│   ├── app.ts          # Express app factory
│   ├── config/
│   │   └── env.ts      # Validated env via zod
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── order.routes.ts
│   │   └── webhook.routes.ts
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   ├── db/
│   │   ├── pool.ts      # pg Pool singleton
│   │   └── migrations/
│   └── types/
│       └── index.ts
├── tests/
└── package.json
```

---

## Non-Functional Requirements

| Concern       | Decision                                     |
|---------------|----------------------------------------------|
| CORS          | Whitelist `FRONTEND_URL` only                |
| Rate limiting | `express-rate-limit` on auth routes (5/min)  |
| Logging       | `pino` structured JSON logs                  |
| Helmet        | `helmet` for HTTP security headers           |
| Transactions  | pg `BEGIN/COMMIT` for order + stock updates  |
| Idempotency   | Stripe `idempotencyKey` per order attempt    |

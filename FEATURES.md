# FEATURES.md — Product & Feature Specifications

## Pages & Routes

| Route                | Page                     | Auth Required |
|----------------------|--------------------------|---------------|
| `/`                  | Landing + Product Grid   | No            |
| `/products/:slug`    | Product Detail           | No            |
| `/cart`              | Cart Review              | No            |
| `/checkout`          | Checkout Form            | No (guest ok) |
| `/checkout/success`  | Order Confirmation       | No            |
| `/account`           | Orders History           | Yes           |
| `/account/login`     | Login / Register         | No            |

---

## Feature 1 — Product Listing (Landing Page)

**What:**
A full-width hero followed by a product grid for the single category.

**Components:**
- `HeroBanner` — headline, subheadline, CTA button linking to product grid.
- `ProductGrid` — responsive CSS grid (1→2→3→4 cols).
- `ProductCard` — image, name, price, "Add to Cart" button, quick stock badge.

**API:**
```
GET /api/products?categorySlug=sneakers&limit=20&offset=0
→ { success: true, data: { products: Product[], total: number } }
```

**Behaviour:**
- Infinite scroll or "Load More" pagination.
- Out-of-stock products are greyed out; CTA becomes "Notify Me".
- Filter by price (low→high, high→low) via query param `sort`.

---

## Feature 2 — Product Detail Page

**What:**
Full product detail with image gallery, size/variant selector, and add-to-cart.

**Components:**
- `ProductGallery` — thumbnail strip + zoomed main image.
- `VariantSelector` — e.g. size buttons; disables out-of-stock variants.
- `AddToCartForm` — quantity picker + "Add to Cart" + "Buy Now".
- `ProductDetails` — accordion tabs: Description, Sizing Guide, Shipping.

**API:**
```
GET /api/products/:slug
→ { success: true, data: Product }
```

**Behaviour:**
- `definePageMeta({ key: route => route.params.slug })` to force re-mount.
- "Buy Now" adds to cart then navigates directly to `/checkout`.
- Breadcrumb: Home → Sneakers → {Product Name}.

---

## Feature 3 — Cart

**What:**
Slide-in CartDrawer (desktop) and full `/cart` page (mobile).

**Components:**
- `CartDrawer` — overlays on right side, opens via cart icon click.
- `CartItem` — image, name, quantity stepper, remove button, subtotal.
- `CartSummary` — subtotal, estimated shipping, total, "Proceed to Checkout" CTA.

**State:**
- Cart lives in Pinia + persisted to `localStorage` (via `@pinia-plugin-persistedstate`).
- Before checkout, validate stock server-side: `POST /api/cart/validate`.

**API:**
```
POST /api/cart/validate
Body: { items: [{ productId, quantity }] }
→ { success: true, data: { valid: boolean, issues: CartIssue[] } }
```

---

## Feature 4 — Checkout

**What:**
Two-step checkout: (1) Contact + Shipping, (2) Payment via Stripe Elements.

**Components:**
- `CheckoutStepper` — visual step indicator.
- `AddressForm` — name, email, address fields with Zod client validation.
- `PaymentElement` — Stripe's hosted UI (card, Apple Pay, Google Pay).
- `OrderSummary` — sidebar recap of cart items + totals.

**Flow:**
1. User fills address → clicks "Continue to Payment".
2. `POST /api/orders` is called with cart + address.
3. Backend creates order (status=pending), creates Stripe PaymentIntent, returns `clientSecret`.
4. Stripe Elements is mounted with `clientSecret`.
5. User submits card → Stripe processes.
6. On success, frontend polls `GET /api/orders/:id` until `status === 'paid'` (max 10s).
7. Redirect to `/checkout/success?orderId=...`.

**API:**
```
POST /api/orders
Body: { items: OrderItem[], shippingAddress: Address, email: string }
→ { success: true, data: { orderId: string, clientSecret: string } }

GET /api/orders/:id
→ { success: true, data: Order }
```

---

## Feature 5 — Order Confirmation

**What:**
A clean success page showing order ID, items summary, and shipping info.

**Components:**
- `ConfirmationHero` — animated checkmark, "Order Confirmed!" headline.
- `OrderReceipt` — order ID, date, items, total, shipping address.
- CTAs: "Continue Shopping" (→ `/`) and "Track Order" (→ `/account`).

**API:**
```
GET /api/orders/:id
```

---

## Feature 6 — Auth (Optional / Guest Checkout)

**Guest flow:** Checkout works without an account. Email is stored on the order.

**Register/Login:**
```
POST /api/auth/register  { email, password, name }
POST /api/auth/login     { email, password }
→ { accessToken } + httpOnly refresh cookie

POST /api/auth/refresh   (uses cookie)
→ { accessToken }

POST /api/auth/logout
→ clears cookie + DB token
```

**Account page:**
```
GET /api/account/orders  (authGuard)
→ list of user's orders with status
```

---

## Feature 7 — Admin (Stretch Goal)

Basic product/order management at `/admin/*` protected by `role: 'admin'`.

```
GET    /api/admin/products
POST   /api/admin/products
PATCH  /api/admin/products/:id
DELETE /api/admin/products/:id   (soft-delete: active = false)

GET    /api/admin/orders
PATCH  /api/admin/orders/:id     { status: 'shipped' }
```

---

## Error UX Standards

| Scenario                  | UI Response                                          |
|---------------------------|------------------------------------------------------|
| Product out of stock      | Disable Add-to-Cart, show "Sold Out" badge           |
| Cart item stock mismatch  | Inline warning per item before checkout              |
| Payment declined          | Show Stripe error message, allow retry               |
| Network error             | Toast notification with retry button                 |
| Session expired           | Silent token refresh; if fails, redirect to login    |
| 404 page/product          | Friendly 404 with back-to-shop CTA                   |

---

## Acceptance Criteria Checklist

- [ ] Products load from DB, not hardcoded.
- [ ] Add to cart updates quantity if item already in cart.
- [ ] Cart persists across page refresh (localStorage).
- [ ] Checkout validates stock server-side before payment.
- [ ] Stripe webhook marks order `paid` and decrements stock atomically.
- [ ] Order confirmation page shows real order data.
- [ ] All forms have client-side AND server-side validation.
- [ ] Mobile layout works at 375 px.
- [ ] Page titles and OG meta set on every page.
- [ ] No console errors or TypeScript errors in production build.

# CLAUDE.md — E-Commerce Project Master Instructions

> This file is read automatically by Claude Code at the start of every session.
> It is the single source of truth for how to work on this codebase.

---

## 📦 Project Overview

A **single-product-category e-commerce storefront** with full checkout and payment flow.

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Nuxt 4 (Vue 3, Composition API)   |
| Backend   | Node.js + Express + TypeScript    |
| Database  | PostgreSQL                        |
| Payments  | Stripe (server-side intent flow)  |
| Auth      | JWT (access + refresh tokens)     |

---

## 🗂 Repository Structure

```
/
├── frontend/          # Nuxt 4 app  → see docs/FRONTEND.md
├── backend/           # Express API → see docs/BACKEND.md
├── db/                # Migrations, seeds → see docs/DATABASE.md
├── docs/              # All supplementary docs
│   ├── ARCHITECTURE.md
│   ├── FRONTEND.md
│   ├── BACKEND.md
│   ├── DATABASE.md
│   └── FEATURES.md
├── CLAUDE.md          ← you are here
└── docker-compose.yml
```

---

## ⚡ Quick Commands

```bash
# Full dev stack
docker-compose up -d          # Postgres + Redis
cd backend && npm run dev     # Express on :4000
cd frontend && npm run dev    # Nuxt on :3000

# Database
cd backend && npm run db:migrate   # Run pending migrations
cd backend && npm run db:seed      # Seed demo products
cd backend && npm run db:reset     # Drop + migrate + seed

# Tests
cd backend && npm test             # Jest unit + integration
cd frontend && npm run test        # Vitest component tests
npm run test:e2e                   # Playwright end-to-end

# Type checking
cd backend && npm run typecheck
cd frontend && npm run typecheck
```

---

## 🔑 Environment Variables

### backend/.env
```
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### frontend/.env
```
NUXT_PUBLIC_API_BASE=http://localhost:4000/api
NUXT_PUBLIC_STRIPE_PK=pk_test_...
```

---

## 🧠 Core Principles (Read Before Every Task)

1. **Always read the relevant `docs/*.md`** before touching a layer.
2. **TypeScript is mandatory** — no `any`, no `@ts-ignore` without a comment.
3. **Never expose secrets** to the frontend. All Stripe secret logic lives in `backend/`.
4. **DB changes = migration file first** — never mutate the schema manually.
5. **API responses follow the envelope format** — see `docs/BACKEND.md`.
6. **Zod validates every API input** — no raw `req.body` access.
7. **Components are small and composable** — max ~150 lines per file.
8. **Error states and loading states are always handled** — no silent failures.
9. **Mobile-first** — every UI component must work at 375 px wide.
10. **Accessibility** — semantic HTML, ARIA labels on interactive elements, keyboard navigation.

---

## 🚫 Hard Rules

- ❌ Do NOT put business logic in Vue components — use composables or the API.
- ❌ Do NOT write raw SQL strings — use the query builder (see `docs/DATABASE.md`).
- ❌ Do NOT commit `.env` files.
- ❌ Do NOT use `var` — only `const` / `let`.
- ❌ Do NOT skip input validation on any API route.
- ❌ Do NOT store card details — Stripe handles all PCI scope.

---

## 📚 Further Reading

| Topic           | File                    |
|-----------------|-------------------------|
| System design   | `docs/ARCHITECTURE.md`  |
| Nuxt 4 patterns | `docs/FRONTEND.md`      |
| Express API     | `docs/BACKEND.md`       |
| DB schema & ORM | `docs/DATABASE.md`      |
| Feature specs   | `docs/FEATURES.md`      |

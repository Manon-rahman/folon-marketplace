# DATABASE.md — PostgreSQL Schema & Conventions

## Connection (`db/pool.ts`)

```ts
import { Pool } from 'pg'
import { env } from '../config/env'

export const pool = new Pool({ connectionString: env.DATABASE_URL })

pool.on('error', (err) => {
  console.error('Unexpected DB error', err)
  process.exit(1)
})
```

---

## Migration Conventions

- Files live in `db/migrations/` named `NNN_description.sql` (e.g. `001_initial_schema.sql`).
- Run them in order with `npm run db:migrate` (uses a custom runner, see `scripts/migrate.ts`).
- **Never modify an existing migration** — add a new one instead.
- Always wrap migrations in a transaction (`BEGIN / COMMIT`).

### Migration runner (`scripts/migrate.ts`)

```ts
import fs from 'fs'
import path from 'path'
import { pool } from '../src/db/pool'

async function migrate() {
  await pool.query(`CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY, name TEXT UNIQUE, ran_at TIMESTAMPTZ DEFAULT now()
  )`)
  const { rows } = await pool.query<{ name: string }>('SELECT name FROM _migrations')
  const ran = new Set(rows.map(r => r.name))
  const dir = path.resolve(__dirname, '../db/migrations')
  const files = fs.readdirSync(dir).sort()
  for (const file of files) {
    if (ran.has(file)) continue
    console.log(`Running migration: ${file}`)
    const sql = fs.readFileSync(path.join(dir, file), 'utf8')
    await pool.query('BEGIN')
    await pool.query(sql)
    await pool.query('INSERT INTO _migrations(name) VALUES($1)', [file])
    await pool.query('COMMIT')
  }
  console.log('Migrations complete')
  await pool.end()
}
migrate().catch(e => { console.error(e); process.exit(1) })
```

---

## Schema (`001_initial_schema.sql`)

```sql
BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product category
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL CHECK (price >= 0),  -- cents
  images      TEXT[] NOT NULL DEFAULT '{}',
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  active      BOOLEAN NOT NULL DEFAULT true,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID REFERENCES users(id),
  status                   TEXT NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','paid','shipped','cancelled')),
  stripe_payment_intent_id TEXT,
  total_amount             INTEGER NOT NULL CHECK (total_amount > 0),  -- cents
  shipping_address         JSONB NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items (snapshot prices at time of purchase)
CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0)  -- cents, snapshot
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug     ON products(slug);
CREATE INDEX idx_orders_user       ON orders(user_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

COMMIT;
```

---

## Seed (`002_seed_demo.sql`)

```sql
BEGIN;

INSERT INTO categories(id, name, slug, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sneakers', 'sneakers', 'Premium footwear');

INSERT INTO products(category_id, name, slug, description, price, images, stock) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'Air Nova Pro', 'air-nova-pro',
   'Lightweight performance sneaker with responsive foam.',
   14999, ARRAY['https://cdn.example.com/air-nova-1.jpg'], 50),

  ('00000000-0000-0000-0000-000000000001',
   'Cloud Runner X', 'cloud-runner-x',
   'Ultra-cushion daily trainer built for long runs.',
   18999, ARRAY['https://cdn.example.com/cloud-runner-1.jpg'], 30);

COMMIT;
```

---

## Query Conventions

1. **Parameterized queries only** — never string interpolation.
   ```ts
   // ✅ Correct
   pool.query('SELECT * FROM products WHERE id = $1', [id])
   // ❌ Never
   pool.query(`SELECT * FROM products WHERE id = '${id}'`)
   ```

2. **Use transactions** for any multi-step write (order + stock update):
   ```ts
   const client = await pool.connect()
   try {
     await client.query('BEGIN')
     await client.query('INSERT INTO orders ...', [...])
     await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [qty, pid])
     await client.query('COMMIT')
   } catch (e) {
     await client.query('ROLLBACK')
     throw e
   } finally {
     client.release()
   }
   ```

3. **Row types** — always type the generic: `pool.query<Product>(...)`.

4. **`returning *`** — always return the created/updated row so the service layer doesn't need a second query.

---

## Useful Queries

```sql
-- Check stock before creating order item
SELECT stock FROM products WHERE id = $1 FOR UPDATE;

-- Decrement stock atomically (fails if stock < qty)
UPDATE products SET stock = stock - $1
WHERE id = $2 AND stock >= $1
RETURNING stock;

-- Mark order paid + set intent ID
UPDATE orders SET status = 'paid', stripe_payment_intent_id = $1, updated_at = now()
WHERE id = $2 RETURNING *;

-- Full order with items
SELECT o.*, json_agg(
  json_build_object(
    'productId', oi.product_id,
    'quantity', oi.quantity,
    'unitPrice', oi.unit_price,
    'name', p.name
  )
) AS items
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.id = $1
GROUP BY o.id;
```

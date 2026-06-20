-- Add pricing fields to products
ALTER TABLE "products" ADD COLUMN "compareAtPrice" INTEGER;
ALTER TABLE "products" ADD COLUMN "bundle5Price" INTEGER;
ALTER TABLE "products" ADD COLUMN "bundle10Price" INTEGER;

-- Add delivery fee to orders
ALTER TABLE "orders" ADD COLUMN "deliveryFee" INTEGER NOT NULL DEFAULT 0;

-- Create settings table with defaults
CREATE TABLE "settings" (
    "key"   TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

INSERT INTO "settings" ("key", "value") VALUES
  ('delivery_fee', '6000'),
  ('free_delivery_min_items', '2');

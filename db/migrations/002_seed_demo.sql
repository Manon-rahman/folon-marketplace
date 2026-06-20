BEGIN;

INSERT INTO categories(id, name, slug, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sneakers', 'sneakers', 'Premium footwear')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products(category_id, name, slug, description, price, images, stock) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Air Nova Pro',
    'air-nova-pro',
    'Lightweight performance sneaker with responsive foam. Engineered for speed, designed for all-day comfort. Features a breathable mesh upper and energy-return midsole.',
    14999,
    ARRAY[
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=60',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800'
    ],
    50
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Cloud Runner X',
    'cloud-runner-x',
    'Ultra-cushion daily trainer built for long runs. Maximum stack height meets minimal weight. Your feet will thank you at mile 20.',
    18999,
    ARRAY[
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=60',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800'
    ],
    30
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Stealth Court Mid',
    'stealth-court-mid',
    'Heritage basketball silhouette rebuilt for the streets. Premium suede upper, reinforced toe cap, and vintage gum sole.',
    12999,
    ARRAY[
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=60'
    ],
    20
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Terra Hike GTX',
    'terra-hike-gtx',
    'Waterproof trail runner with Gore-Tex lining. Aggressive outsole tackles any terrain. From your morning commute to weekend summits.',
    22999,
    ARRAY[
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=60'
    ],
    15
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Velocity Slide',
    'velocity-slide',
    'Post-workout recovery slide with anatomical footbed. Lightweight EVA construction. Available in 6 colorways.',
    5999,
    ARRAY[
      'https://images.unsplash.com/photo-1625048801682-2a2f3e5c5a2e?w=800'
    ],
    0
  )
ON CONFLICT (slug) DO NOTHING;

COMMIT;

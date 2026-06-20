'use client'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { addToCart, updateQuantity, getCart, CartItem } from '@/lib/cart/store'
import { useT } from '@/lib/i18n'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  stock: number
}

interface SimilarProductsProps {
  cartItems: CartItem[]
  onCartChange: () => void
}

export default function SimilarProducts({ cartItems, onCartChange }: SimilarProductsProps) {
  const { t } = useT()
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const cartIds = new Set(cartItems.map((i) => i.productId))

    fetch('/api/products')
      .then((r) => r.json())
      .then((all: Product[]) => {
        const filtered = all.filter((p) => !cartIds.has(p.id) && p.stock > 0).slice(0, 6)
        setSuggestions(filtered)
      })
      .catch(() => {})
  }, [cartItems])

  if (suggestions.length === 0) return null

  function toggle(product: Product) {
    const isChecked = !checked[product.id]
    setChecked((prev) => ({ ...prev, [product.id]: isChecked }))

    if (isChecked) {
      addToCart({ productId: product.id, name: product.name, price: product.price, originalPrice: product.price, image: product.images[0] ?? '' })
    } else {
      const currentCart = getCart()
      const existing = currentCart.find((i) => i.productId === product.id)
      if (existing) {
        updateQuantity(product.id, existing.quantity - 1)
      }
    }
    onCartChange()
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {t.youMightAlsoLike}
      </h2>
      <div className="flex flex-col gap-1.5">
        {suggestions.map((product) => (
          <label
            key={product.id}
            className={`flex items-center gap-2 p-2 rounded-xl border-2 cursor-pointer transition-all ${
              checked[product.id]
                ? 'border-[#4CA771] bg-[#e8f5ee]'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <input
              type="checkbox"
              checked={!!checked[product.id]}
              onChange={() => toggle(product)}
              className="w-4 h-4 accent-[#4CA771] flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1a1a1a] line-clamp-1">{product.name}</p>
              <p className="text-xs font-bold text-[#4CA771]">{formatPrice(product.price)}</p>
            </div>
            {checked[product.id] && (
              <span className="text-xs text-[#4CA771] font-medium flex-shrink-0">{t.addToOrder}</span>
            )}
          </label>
        ))}
      </div>
    </section>
  )
}

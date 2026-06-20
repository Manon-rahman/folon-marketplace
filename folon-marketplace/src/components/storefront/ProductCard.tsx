'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { addToCart } from '@/lib/cart/store'
import { useT } from '@/lib/i18n'
import { ShoppingCart, ShoppingBag, Check, Package } from 'lucide-react'
import { useState } from 'react'

interface Product {
  id: string
  name: string
  price: number
  compareAtPrice?: number | null
  bundle5Price?: number | null
  bundle10Price?: number | null
  images: string[]
  stock: number
  category?: { name: string; slug: string } | null
}

export default function ProductCard({ product }: { product: Product }) {
  const { t } = useT()
  const router = useRouter()
  const [added, setAdded] = useState(false)
  const inStock = product.stock > 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock) return
    addToCart({ productId: product.id, name: product.name, price: product.price, originalPrice: product.price, bundle5Price: product.bundle5Price ?? undefined, bundle10Price: product.bundle10Price ?? undefined, image: product.images[0] ?? '' })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock) return
    addToCart({ productId: product.id, name: product.name, price: product.price, originalPrice: product.price, bundle5Price: product.bundle5Price ?? undefined, bundle10Price: product.bundle10Price ?? undefined, image: product.images[0] ?? '' })
    router.push('/checkout')
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#4CA771]/30 hover:shadow-[0_8px_24px_rgba(76,167,113,0.12)] transition-all duration-300 h-full flex flex-col">

        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 480px) 50vw, 200px"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
              <Package className="w-8 h-8 text-gray-200" />
            </div>
          )}

          {/* Category chip */}
          {product.category && (
            <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-[#4CA771] px-2 py-0.5 rounded-full">
              {product.category.name}
            </span>
          )}

          {/* Floating cart button */}
          {inStock && (
            <button
              onClick={handleAddToCart}
              aria-label={t.addToCart}
              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
                added
                  ? 'bg-[#4CA771] text-white scale-110'
                  : 'bg-white text-gray-600 hover:bg-[#4CA771] hover:text-white hover:scale-110'
              }`}
            >
              {added
                ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                : <ShoppingCart className="w-3.5 h-3.5" />
              }
            </button>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-[11px] font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                {t.soldOut}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1 gap-2">
          <p className="text-[13px] font-medium text-gray-800 line-clamp-2 leading-snug flex-1">
            {product.name}
          </p>

          <div className="flex items-baseline gap-1.5">
            {product.compareAtPrice ? (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            ) : null}
            <span className="text-base font-bold text-[#4CA771] tracking-tight">{formatPrice(product.price)}</span>
          </div>

          {inStock ? (
            <button
              onClick={handleBuyNow}
              aria-label={t.buyNow}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#4CA771] text-white text-xs font-semibold hover:bg-[#3a8a5c] active:scale-95 transition-all duration-150"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {t.buyNow}
            </button>
          ) : (
            <div className="py-2 text-center text-[11px] font-medium text-gray-400 bg-gray-50 rounded-xl">
              {t.soldOut}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

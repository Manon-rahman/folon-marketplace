'use client'
import { useEffect, useState } from 'react'
import { getCart, updateQuantity, cartTotal, CartItem } from '@/lib/cart/store'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { useT } from '@/lib/i18n'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const { t } = useT()
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const update = () => setItems([...getCart()])
    update()
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">{t.emptyCart}</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">{t.emptyCartSub}</p>
        <Link href="/">
          <Button>{t.browseProducts}</Button>
        </Link>
      </div>
    )
  }

  const total = cartTotal(items)

  return (
    <div className="pb-32">
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-xl font-bold">{t.yourCart}</h1>
        <p className="text-sm text-gray-500">{items.reduce((s, i) => s + i.quantity, 0)} {t.items}</p>
      </div>

      <div className="flex flex-col gap-3 px-4">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3 bg-white rounded-2xl p-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1a1a1a] line-clamp-2">{item.name}</p>
              <p className="text-base font-bold text-[#4CA771] mt-1">{formatPrice(item.price)}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4CA771] transition-colors"
                    aria-label="Decrease"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-gray-400" /> : <Minus className="w-3.5 h-3.5" />}
                  </button>
                  <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4CA771] transition-colors"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">{t.subtotal}</span>
          <span className="text-lg font-bold">{formatPrice(total)}</span>
        </div>
        <Link href="/checkout">
          <Button size="lg" className="w-full">{t.proceedToCheckout}</Button>
        </Link>
      </div>
    </div>
  )
}

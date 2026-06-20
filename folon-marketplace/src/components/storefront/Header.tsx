'use client'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCart } from '@/lib/cart/store'
import { useT } from '@/lib/i18n'

export default function Header() {
  const { t, lang, toggle } = useT()
  const [count, setCount] = useState(0)

  useEffect(() => {
    const update = () => setCount(getCart().reduce((s, i) => s + i.quantity, 0))
    update()
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-[#1a1a1a] tracking-tight">
          {lang === 'en' ? (
            <>Folon <span className="text-[#4CA771]">Marketplace</span></>
          ) : (
            <>ফলন <span className="text-[#4CA771]">মার্কেটপ্লেস</span></>
          )}
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#4CA771] hover:text-[#4CA771] transition-colors"
            aria-label="Switch language"
          >
            {lang === 'en' ? 'বাং' : 'EN'}
          </button>

          <Link href="/cart" className="relative p-2 -mr-2" aria-label={t.yourCart}>
            <ShoppingBag className="w-6 h-6 text-gray-700" />
            {count > 0 && (
              <span className="absolute top-1 right-1 bg-[#4CA771] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}

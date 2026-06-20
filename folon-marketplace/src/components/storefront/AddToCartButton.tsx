'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addToCart } from '@/lib/cart/store'
import Button from '@/components/ui/Button'
import { useT } from '@/lib/i18n'
import { ShoppingCart, ShoppingBag, Check } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  bundle5Price?: number | null
  bundle10Price?: number | null
  image: string
  stock: number
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { t } = useT()
  const router = useRouter()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addToCart({ productId: product.id, name: product.name, price: product.price, originalPrice: product.price, bundle5Price: product.bundle5Price ?? undefined, bundle10Price: product.bundle10Price ?? undefined, image: product.image })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleBuyNow() {
    addToCart({ productId: product.id, name: product.name, price: product.price, originalPrice: product.price, bundle5Price: product.bundle5Price ?? undefined, bundle10Price: product.bundle10Price ?? undefined, image: product.image })
    router.push('/checkout')
  }

  if (product.stock === 0) {
    return (
      <Button disabled size="lg" variant="outline" className="w-full">
        {t.soldOut}
      </Button>
    )
  }

  return (
    <div className="flex gap-3">
      <Button onClick={handleAdd} size="lg" variant="outline" className="flex-1 gap-2 border-[#4CA771] text-[#4CA771] hover:bg-[#e8f5ee]">
        {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
        {added ? t.addedToCart : t.addToCart}
      </Button>
      <Button onClick={handleBuyNow} size="lg" className="flex-1 gap-2">
        <ShoppingBag className="w-5 h-5" />
        {t.buyNow}
      </Button>
    </div>
  )
}

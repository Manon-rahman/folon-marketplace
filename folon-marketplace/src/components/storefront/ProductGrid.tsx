'use client'
import ProductCard from './ProductCard'
import { useT } from '@/lib/i18n'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  stock: number
  category?: { name: string; slug: string } | null
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const { t } = useT()
  return (
    <section className="px-4 pb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {t.productsHeading}
        </h2>
        <span className="text-xs text-gray-400">{products.length} {t.items}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

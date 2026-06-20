export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import AddToCartButton from '@/components/storefront/AddToCartButton'
import ProductStockBadge from '@/components/storefront/ProductStockBadge'
import BackLink from '@/components/storefront/BackLink'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id, visible: true },
    include: { category: { select: { name: true } } },
  })
  if (!product) notFound()

  return (
    <div className="pb-24">
      <div className="px-4 pt-4">
        <BackLink href="/" />
      </div>

      <div className="relative aspect-square bg-gray-50">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 480px) 100vw, 480px"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">📦</div>
        )}
      </div>

      <div className="px-4 pt-5">
        {product.category && (
          <span className="text-xs font-medium text-[#4CA771] uppercase tracking-wide">
            {product.category.name}
          </span>
        )}
        <h1 className="text-xl font-bold text-[#1a1a1a] mt-1 mb-2">{product.name}</h1>
        <div className="flex items-baseline gap-2 mb-4">
          {product.compareAtPrice ? (
            <span className="text-base text-gray-400 line-through">{formatPrice(Number(product.compareAtPrice))}</span>
          ) : null}
          <span className="text-2xl font-bold text-[#4CA771]">{formatPrice(Number(product.price))}</span>
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>
        )}

        <div className="flex items-center gap-2 mb-6">
          <ProductStockBadge inStock={product.stock > 0} />
        </div>

        <AddToCartButton product={{
          id: product.id,
          name: product.name,
          price: Number(product.price),
          bundle5Price: product.bundle5Price ? Number(product.bundle5Price) : null,
          bundle10Price: product.bundle10Price ? Number(product.bundle10Price) : null,
          image: product.images[0] ?? '',
          stock: product.stock,
        }} />

        {product.images.length > 1 && (
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            {product.images.slice(1).map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover" sizes="80px" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

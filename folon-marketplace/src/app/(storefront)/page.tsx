import { prisma } from '@/lib/db'
import { Prisma } from '@/generated/prisma/client'
import ProductGrid from '@/components/storefront/ProductGrid'
import CategoryTabs from '@/components/storefront/CategoryTabs'
import BannerCarousel from '@/components/storefront/BannerCarousel'
import FilterDrawer from '@/components/storefront/FilterDrawer'
import EmptyState from '@/components/storefront/EmptyState'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

type SearchParams = { category?: string; sort?: string; inStock?: string }

function sortToOrderBy(sort?: string): Prisma.ProductFindManyArgs['orderBy'] {
  switch (sort) {
    case 'price_asc':  return { price: 'asc' }
    case 'price_desc': return { price: 'desc' }
    case 'top':        return { orderItems: { _count: 'desc' } }
    default:           return { createdAt: 'desc' }
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { category, sort, inStock: inStockParam } = await searchParams
  const inStock = inStockParam === '1'
  const activeSort = sort ?? 'newest'

  const [banners, categories, products, marqueeSetting] = await Promise.all([
    prisma.banner.findMany({ where: { active: true }, orderBy: { displayOrder: 'asc' } }),
    prisma.category.findMany({ where: { visible: true }, orderBy: { displayOrder: 'asc' } }),
    prisma.product.findMany({
      where: {
        visible: true,
        ...(category && category !== 'all' ? { category: { slug: category } } : {}),
        ...(inStock ? { stock: { gt: 0 } } : {}),
      },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: sortToOrderBy(sort),
    }),
    prisma.setting.findUnique({ where: { key: 'marquee_text' } }),
  ])
  const marqueeText = marqueeSetting?.value || '🚚 হোম ডেলিভারি ২ দিনের মধ্যে'

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white">
        <BannerCarousel banners={banners} />
        <div className="flex items-center border-b border-gray-100 pr-1">
          <div className="flex-1 overflow-hidden pl-4 py-2.5">
            <CategoryTabs categories={categories} activeSlug={category ?? 'all'} />
          </div>
          <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />
          <Suspense>
            <FilterDrawer activeSort={activeSort} inStock={inStock} />
          </Suspense>
        </div>
      </div>
      <div className="pt-3">
        {products.length === 0 ? (
          <EmptyState filtered={!!(sort || inStock || category)} />
        ) : (
          <ProductGrid products={products} />
        )}
      </div>

      {/* Sticky bottom ad bar — homepage only */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-[#4CA771] h-9 flex items-center overflow-hidden">
        <div className="animate-marquee flex shrink-0" style={{ width: '200vw' }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center justify-around shrink-0" style={{ width: '100vw' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="text-white text-sm font-semibold px-6 whitespace-nowrap">
                  {marqueeText}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
}

export default function CategoryTabs({ categories, activeSlug }: { categories: Category[]; activeSlug: string }) {
  if (categories.length === 0) return null

  const tabs = [{ id: 'all', name: 'All', slug: 'all' }, ...categories]

  return (
    <div
      className="flex gap-2 overflow-x-auto"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {tabs.map((cat) => (
        <Link
          key={cat.id}
          href={cat.slug === 'all' ? '/' : `/?category=${cat.slug}`}
          className={cn(
            'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap border',
            activeSlug === cat.slug
              ? 'bg-[#4CA771] text-white border-[#4CA771] shadow-[0_2px_8px_rgba(76,167,113,0.35)]'
              : 'bg-white text-gray-500 border-gray-200 hover:border-[#4CA771] hover:text-[#4CA771]'
          )}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  )
}

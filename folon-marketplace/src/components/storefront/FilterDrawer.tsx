'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, TrendingUp, Clock, ArrowUp, ArrowDown, PackageCheck, Check } from 'lucide-react'
import { useT } from '@/lib/i18n'

type SortKey = 'newest' | 'top' | 'price_asc' | 'price_desc'

export default function FilterDrawer({ activeSort, inStock }: { activeSort: string; inStock: boolean }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useT()

  const SORTS: { key: SortKey; label: string; icon: React.ElementType }[] = [
    { key: 'newest',     label: t.filterNewest,     icon: Clock },
    { key: 'top',        label: t.filterTopSelling, icon: TrendingUp },
    { key: 'price_asc',  label: t.filterPriceLow,   icon: ArrowUp },
    { key: 'price_desc', label: t.filterPriceHigh,  icon: ArrowDown },
  ]

  function applySort(key: SortKey) {
    const params = new URLSearchParams(searchParams.toString())
    if (activeSort === key) params.delete('sort')
    else params.set('sort', key)
    router.push(`/?${params.toString()}`, { scroll: false })
    setOpen(false)
  }

  function toggleInStock() {
    const params = new URLSearchParams(searchParams.toString())
    if (inStock) params.delete('inStock')
    else params.set('inStock', '1')
    router.push(`/?${params.toString()}`, { scroll: false })
    setOpen(false)
  }

  const hasActive = activeSort !== 'newest' || inStock

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open filters"
        className="relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-gray-600 flex-shrink-0 hover:text-[#4CA771] transition-colors"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        {t.filterButton}
        {hasActive && (
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#4CA771]" />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white rounded-t-2xl z-50 px-5 pt-4 pb-8">
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t.sortBy}</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {SORTS.map(({ key, label, icon: Icon }) => {
                const active = activeSort === key
                return (
                  <button
                    key={key}
                    onClick={() => applySort(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 whitespace-nowrap ${
                      active
                        ? 'bg-[#4CA771] text-white border-[#4CA771] shadow-[0_2px_8px_rgba(76,167,113,0.3)]'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-[#4CA771] hover:text-[#4CA771]'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="h-px bg-gray-100 mb-4" />

            <button
              onClick={toggleInStock}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
                inStock
                  ? 'bg-[#4CA771]/10 border-[#4CA771] text-[#4CA771]'
                  : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <PackageCheck className="w-4 h-4" />
                {t.filterInStock}
              </span>
              {inStock && <Check className="w-4 h-4" />}
            </button>
          </div>
        </>
      )}
    </>
  )
}

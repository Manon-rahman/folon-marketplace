'use client'
import { useT } from '@/lib/i18n'

export default function ProductStockBadge({ inStock }: { inStock: boolean }) {
  const { t } = useT()
  return inStock ? (
    <span className="text-sm text-[#4CA771] font-medium">{t.inStock}</span>
  ) : (
    <span className="text-sm text-gray-400">{t.outOfStock}</span>
  )
}

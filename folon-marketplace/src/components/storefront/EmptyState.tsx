'use client'
import { useT } from '@/lib/i18n'

export default function EmptyState({ filtered }: { filtered: boolean }) {
  const { t } = useT()
  return (
    <div className="text-center py-20 text-gray-400 bg-gray-50">
      <p className="text-lg font-medium">{filtered ? t.noProductsMatch : t.noProducts}</p>
      <p className="text-sm mt-1">{filtered ? t.tryRemovingFilter : t.noProductsSub}</p>
    </div>
  )
}

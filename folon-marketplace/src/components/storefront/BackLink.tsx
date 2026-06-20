'use client'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { useT } from '@/lib/i18n'

export default function BackLink({ href }: { href: string }) {
  const { t } = useT()
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#4CA771] transition-colors mb-4">
      <ChevronLeft className="w-4 h-4" /> {t.back}
    </Link>
  )
}

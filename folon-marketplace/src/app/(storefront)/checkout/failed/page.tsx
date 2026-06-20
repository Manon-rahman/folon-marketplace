'use client'
import Link from 'next/link'
import { useT } from '@/lib/i18n'

export default function PaymentFailedPage() {
  const { t } = useT()
  return (
    <div className="px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">❌</span>
      </div>
      <h1 className="text-xl font-bold mb-2">{t.paymentFailed}</h1>
      <p className="text-sm text-gray-500 mb-8">{t.paymentFailedSub}</p>
      <Link href="/checkout" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#4CA771] text-white font-medium hover:bg-[#3a8a5c] transition-colors">
        {t.tryAgain}
      </Link>
    </div>
  )
}

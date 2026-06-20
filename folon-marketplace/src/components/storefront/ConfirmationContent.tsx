'use client'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { useT } from '@/lib/i18n'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Props {
  orderId: string
  isCod: boolean
  items: OrderItem[]
  discountAmount: number
  total: number
  customerName: string
  customerPhone: string
  customerArea: string
}

export default function ConfirmationContent({ orderId, isCod, items, discountAmount, total, customerName, customerPhone, customerArea }: Props) {
  const { t } = useT()

  return (
    <div className="px-4 py-8 text-center">
      <div className="w-16 h-16 rounded-full bg-[#e8f5ee] flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">{isCod ? '📦' : '✅'}</span>
      </div>
      <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">
        {isCod ? t.orderPlaced : t.paymentConfirmed}
      </h1>
      <p className="text-sm text-gray-500 mb-1">Order #{orderId.slice(-8).toUpperCase()}</p>
      <p className="text-sm text-gray-500 mb-6">
        {isCod ? t.codMessage : t.paymentSuccess}
      </p>

      <div className="bg-gray-50 rounded-2xl p-4 text-left mb-6">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Items</p>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1">
            <span className="text-gray-700">{item.name} × {item.quantity}</span>
            <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 mt-3 pt-3">
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-[#4CA771] mb-1">
              <span>{t.discount}</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold">
            <span>{t.total}</span>
            <span className="text-[#4CA771]">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 text-left mb-8">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">{t.deliveryTo}</p>
        <p className="text-sm font-medium">{customerName}</p>
        <p className="text-sm text-gray-500">{customerPhone}</p>
        <p className="text-sm text-gray-500">{customerArea}</p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#4CA771] text-white font-medium hover:bg-[#3a8a5c] transition-colors"
      >
        {t.continueShopping}
      </Link>
    </div>
  )
}

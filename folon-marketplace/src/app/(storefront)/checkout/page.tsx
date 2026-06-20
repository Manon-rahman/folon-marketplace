'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getCart, cartTotal, clearCart, updateCartItem, CartItem } from '@/lib/cart/store'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import SimilarProducts from '@/components/storefront/SimilarProducts'
import { useT } from '@/lib/i18n'
import { Tag, ChevronRight, ChevronLeft } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { t } = useT()
  const [items, setItems] = useState<CartItem[]>([])
  const [form, setForm] = useState({ name: '', phone: '', area: '' })
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null)
  const [promoError, setPromoError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'cod'>('bkash')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [settings, setSettings] = useState({ deliveryFee: 6000, freeMinItems: 2 })
  const [bundleSelections, setBundleSelections] = useState<Record<string, '1x' | '5x' | '10x'>>({})

  useEffect(() => {
    const cart = getCart()
    if (cart.length === 0) { router.replace('/'); return }
    setItems(cart)

    // Refresh bundle prices from server so stale localStorage doesn't show wrong prices
    fetch('/api/products')
      .then((r) => r.json())
      .then((fresh: Array<{ id: string; price: number; bundle5Price?: number | null; bundle10Price?: number | null }>) => {
        setItems((prev) =>
          prev.map((item) => {
            const fp = fresh.find((p) => p.id === item.productId)
            if (!fp) return item
            return {
              ...item,
              originalPrice: fp.price,
              bundle5Price: fp.bundle5Price ?? undefined,
              bundle10Price: fp.bundle10Price ?? undefined,
            }
          })
        )
      })
      .catch(() => {})
  }, [router])

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          deliveryFee: data.deliveryFee ?? 6000,
          freeMinItems: data.freeDeliveryMinItems ?? 2,
        })
      })
      .catch(() => {})
  }, [])

  const refreshCart = useCallback(() => {
    setItems([...getCart()])
  }, [])

  function selectBundle(productId: string, bundle: '1x' | '5x' | '10x') {
    const item = items.find((i) => i.productId === productId)
    if (!item) return
    const qty = bundle === '1x' ? 1 : bundle === '5x' ? 5 : 10
    const price =
      bundle === '5x' && item.bundle5Price
        ? item.bundle5Price
        : bundle === '10x' && item.bundle10Price
        ? item.bundle10Price
        : item.originalPrice
    updateCartItem(productId, { quantity: qty, price })
    setBundleSelections((prev) => ({ ...prev, [productId]: bundle }))
    setItems([...getCart()])
  }

  const subtotal = cartTotal(items)
  const discount = promo?.discount ?? 0
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const delivery = totalItems >= settings.freeMinItems ? 0 : settings.deliveryFee
  const total = subtotal - discount + delivery

  async function applyPromo() {
    setPromoError('')
    if (!promoInput.trim()) return
    const res = await fetch('/api/promos/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: promoInput.trim(), subtotal }),
    })
    const data = await res.json()
    if (!res.ok) { setPromoError(data.error); return }
    setPromo({ code: promoInput.trim().toUpperCase(), discount: data.discount })
    setPromoInput('')
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = t.nameRequired
    if (!form.phone.trim() || form.phone.length < 10) e.phone = t.phoneRequired
    if (!form.area.trim()) e.area = t.areaRequired
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          customerArea: form.area,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            bundle: bundleSelections[i.productId] ?? '1x',
          })),
          promoCode: promo?.code,
          paymentMethod,
          deliveryFee: delivery,
        }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error ?? 'Something went wrong'); return }

      if (paymentMethod === 'cod') {
        clearCart()
        router.push(`/orders/${data.orderId}/confirmation`)
      } else {
        window.location.href = data.bkashURL
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="pb-8 px-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors pt-4"
        aria-label="Go back"
      >
        <ChevronLeft className="w-4 h-4" />
        {t.back ?? 'Back'}
      </button>
      <h1 className="text-xl font-bold pt-3 pb-4">{t.checkout}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t.deliveryInfo}</h2>
          <div className="flex flex-col gap-3">
            <Input id="name" label={t.fullName} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.fullNamePlaceholder} error={errors.name} />
            <Input id="phone" label={t.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t.phonePlaceholder} type="tel" error={errors.phone} />
            <Input id="area" label={t.area} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder={t.areaPlaceholder} error={errors.area} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t.promoCode}</h2>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={promo ? `${promo.code} applied` : promoInput}
                onChange={(e) => { if (!promo) setPromoInput(e.target.value) }}
                placeholder={t.promoPlaceholder}
                readOnly={!!promo}
                className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/20"
              />
            </div>
            {promo ? (
              <button type="button" onClick={() => setPromo(null)} className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">{t.remove}</button>
            ) : (
              <button type="button" onClick={applyPromo} className="px-4 py-2 text-sm font-medium text-[#4CA771] border border-[#4CA771] rounded-xl hover:bg-[#e8f5ee] transition-colors">{t.apply}</button>
            )}
          </div>
          {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
          {promo && <p className="text-xs text-[#4CA771] mt-1">{t.youSave} {formatPrice(promo.discount)}</p>}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t.payment}</h2>
          <div className="flex gap-3">
            {(['bkash', 'cod'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${paymentMethod === method ? 'border-[#4CA771] bg-[#e8f5ee] text-[#2e7049]' : 'border-gray-200 text-gray-600'}`}
              >
                {method === 'bkash' ? '🟣 bKash' : '💵 Cash on Delivery'}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 rounded-2xl p-3">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">{t.orderSummary}</h2>
          {items.map((item) => {
            const hasBundle = !!(item.bundle5Price || item.bundle10Price)
            const activeBundle = bundleSelections[item.productId] ?? '1x'
            return (
              <div key={item.productId} className="py-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 truncate pr-2">{item.name} × {item.quantity}</span>
                  <span className="flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
                {hasBundle && (
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => selectBundle(item.productId, '1x')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${activeBundle === '1x' ? 'border-[#4CA771] bg-[#e8f5ee] text-[#2e7049]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      1×
                    </button>
                    {item.bundle5Price && (
                      <button
                        type="button"
                        onClick={() => selectBundle(item.productId, '5x')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${activeBundle === '5x' ? 'border-[#4CA771] bg-[#e8f5ee] text-[#2e7049]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        5× – {formatPrice(item.bundle5Price)}/ea
                      </button>
                    )}
                    {item.bundle10Price && (
                      <button
                        type="button"
                        onClick={() => selectBundle(item.productId, '10x')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${activeBundle === '10x' ? 'border-[#4CA771] bg-[#e8f5ee] text-[#2e7049]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        10× – {formatPrice(item.bundle10Price)}/ea
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          <div className="border-t border-gray-200 mt-3 pt-3 flex flex-col gap-1">
            <div className="flex justify-between text-sm"><span className="text-gray-500">{t.subtotal}</span><span>{formatPrice(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-sm text-[#4CA771]"><span>{t.discount}</span><span>-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              {delivery === 0
                ? <span className="text-[#4CA771] font-medium">FREE</span>
                : <span>{formatPrice(delivery)}</span>}
            </div>
            {delivery > 0 && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                Add {settings.freeMinItems - totalItems} more item(s) for free delivery
              </p>
            )}
            <div className="flex justify-between font-bold text-base mt-1"><span>{t.total}</span><span className="text-[#4CA771]">{formatPrice(total)}</span></div>
          </div>
        </section>

        <SimilarProducts cartItems={items} onCartChange={refreshCart} />

        <Button type="submit" size="lg" loading={submitting} className="w-full gap-2">
          {paymentMethod === 'bkash' ? t.payWithBkash : t.placeOrder}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}

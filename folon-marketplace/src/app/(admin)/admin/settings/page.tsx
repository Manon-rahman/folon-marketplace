'use client'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function AdminSettingsPage() {
  const [deliveryFee, setDeliveryFee] = useState('')
  const [freeMinItems, setFreeMinItems] = useState('')
  const [marqueeText, setMarqueeText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        setDeliveryFee(((parseInt(data.delivery_fee ?? '6000')) / 100).toString())
        setFreeMinItems(data.free_delivery_min_items ?? '2')
        setMarqueeText(data.marquee_text ?? '')
      })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        delivery_fee: Math.round(parseFloat(deliveryFee) * 100) || 0,
        free_delivery_min_items: parseInt(freeMinItems) || 2,
        marquee_text: marqueeText,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Settings</h1>
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5 max-w-md flex flex-col gap-4">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Delivery</h2>
        <Input
          id="delivery_fee"
          label="Delivery Fee (৳)"
          type="number"
          step="0.01"
          min="0"
          value={deliveryFee}
          onChange={(e) => setDeliveryFee(e.target.value)}
          placeholder="60"
        />
        <Input
          id="free_min_items"
          label="Free delivery when total quantity is at least"
          type="number"
          min="1"
          value={freeMinItems}
          onChange={(e) => setFreeMinItems(e.target.value)}
          placeholder="2"
        />
        <p className="text-xs text-gray-400">e.g. set to 2 → any order with 2+ items (total qty) gets free delivery</p>

        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide pt-2">Storefront</h2>
        <div className="flex flex-col gap-1">
          <label htmlFor="marquee_text" className="text-sm font-medium text-gray-700">Bottom Banner Text</label>
          <input
            id="marquee_text"
            value={marqueeText}
            onChange={(e) => setMarqueeText(e.target.value)}
            placeholder="🚚 হোম ডেলিভারি ২ দিনের মধ্যে"
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/20"
          />
          <p className="text-xs text-gray-400">Text shown in the scrolling banner at the bottom of the storefront</p>
        </div>

        <Button type="submit" loading={saving}>
          {saved ? 'Saved ✓' : 'Save Settings'}
        </Button>
      </form>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'

interface PromoCode {
  id: string
  code: string
  type: 'percent' | 'flat'
  value: number
  minOrderAmount: number
  maxUses: number | null
  usedCount: number
  active: boolean
  expiresAt: string | null
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', minOrderAmount: '', maxUses: '', expiresAt: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/admin/promos')
    if (res.ok) setPromos(await res.json())
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: form.type === 'flat' ? Math.round(parseFloat(form.value) * 100) : parseInt(form.value),
        minOrderAmount: form.minOrderAmount ? Math.round(parseFloat(form.minOrderAmount) * 100) : 0,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      }),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed'); setSaving(false); return }
    setForm({ code: '', type: 'percent', value: '', minOrderAmount: '', maxUses: '', expiresAt: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function toggleActive(promo: PromoCode) {
    await fetch(`/api/admin/promos/${promo.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !promo.active }) })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this promo code?')) return
    await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Promo Codes</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus className="w-4 h-4" /> New Code
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5 mb-6">
          <h2 className="font-semibold mb-4">Create Promo Code</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <Input id="pcode" label="Code *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE10" required />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4CA771] bg-white">
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (৳)</option>
              </select>
            </div>
            <Input id="pvalue" label={`Value (${form.type === 'percent' ? '%' : '৳'}) *`} type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'percent' ? '10' : '50'} required />
            <Input id="pmin" label="Min Order (৳)" type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="0" />
            <Input id="pmaxuses" label="Max Uses" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Unlimited" />
            <Input id="pexpires" label="Expires At" type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            {error && <p className="col-span-2 text-sm text-red-500">{error}</p>}
            <div className="col-span-2 flex gap-3">
              <Button type="submit" loading={saving}>Create Code</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        {promos.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">No promo codes yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {promos.map((promo) => (
              <div key={promo.id} className={`flex items-center gap-3 px-4 py-3 ${!promo.active ? 'opacity-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">{promo.code}</span>
                    <span className="text-xs bg-[#e8f5ee] text-[#2e7049] px-2 py-0.5 rounded-full">
                      {promo.type === 'percent' ? `${promo.value}%` : formatPrice(promo.value)} off
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Used {promo.usedCount}{promo.maxUses ? `/${promo.maxUses}` : ''} times
                    {promo.minOrderAmount > 0 && ` · Min ${formatPrice(promo.minOrderAmount)}`}
                    {promo.expiresAt && ` · Expires ${new Date(promo.expiresAt).toLocaleDateString('en-BD')}`}
                  </p>
                </div>
                <button onClick={() => toggleActive(promo)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  {promo.active ? <ToggleRight className="w-5 h-5 text-[#4CA771]" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                </button>
                <button onClick={() => handleDelete(promo.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

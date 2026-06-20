'use client'
import { useEffect, useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageUploader from '@/components/admin/ImageUploader'
import { X } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  compareAtPrice?: number | null
  bundle5Price?: number | null
  bundle10Price?: number | null
  stock: number
  visible: boolean
  images: string[]
  description?: string | null
  categoryId?: string | null
}

interface Category { id: string; name: string }

interface ProductFormProps {
  product?: Product | null
  onSave: () => void
  onCancel: () => void
}

function toTaka(paisa: number | null | undefined): string {
  if (!paisa) return ''
  return (paisa / 100).toString()
}

function toPaisa(val: string): number | null {
  const n = Math.round(parseFloat(val) * 100)
  return isNaN(n) || n <= 0 ? null : n
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product ? (product.price / 100).toString() : '',
    compareAtPrice: toTaka(product?.compareAtPrice),
    bundle5Price: toTaka(product?.bundle5Price),
    bundle10Price: toTaka(product?.bundle10Price),
    stock: product?.stock?.toString() ?? '0',
    categoryId: product?.categoryId ?? '',
    visible: product?.visible ?? true,
  })
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data) })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (images.length === 0) { setError('At least one image is required'); return }

    const priceInt = Math.round(parseFloat(form.price) * 100)
    if (isNaN(priceInt) || priceInt <= 0) { setError('Valid price required'); return }

    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        images,
        price: priceInt,
        compareAtPrice: toPaisa(form.compareAtPrice),
        bundle5Price: toPaisa(form.bundle5Price),
        bundle10Price: toPaisa(form.bundle10Price),
        stock: parseInt(form.stock) || 0,
        visible: form.visible,
        categoryId: form.categoryId || null,
      }
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to save'); return }
      onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">{product ? 'Edit Product' : 'New Product'}</h2>
        <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="pname" label="Product Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input id="pprice" label="Price (৳) *" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" required />
        <Input id="pcompare" label="Compare at price (৳) — shown crossed out" type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} placeholder="e.g. 120 (optional)" />
        <Input id="pstock" label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <Input id="pbundle5" label="Bundle 5x price (৳/unit)" type="number" step="0.01" value={form.bundle5Price} onChange={(e) => setForm({ ...form, bundle5Price: e.target.value })} placeholder="e.g. 90 (optional)" />
        <Input id="pbundle10" label="Bundle 10x price (৳/unit)" type="number" step="0.01" value={form.bundle10Price} onChange={(e) => setForm({ ...form, bundle10Price: e.target.value })} placeholder="e.g. 80 (optional)" />
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/20 bg-white">
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Product Images *</label>
          <ImageUploader images={images} onChange={setImages} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/20 resize-none" placeholder="Optional product description" />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="pvisible" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} className="w-4 h-4 accent-[#4CA771]" />
          <label htmlFor="pvisible" className="text-sm text-gray-700">Visible in storefront</label>
        </div>
        {error && <p className="sm:col-span-2 text-sm text-red-500">{error}</p>}
        <div className="sm:col-span-2 flex gap-3">
          <Button type="submit" loading={saving}>{product ? 'Save Changes' : 'Create Product'}</Button>
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import ProductForm from '@/components/admin/ProductForm'
import { Plus, Pencil, Eye, EyeOff, Trash2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  compareAtPrice?: number | null
  bundle5Price?: number | null
  bundle10Price?: number | null
  stock: number
  visible: boolean
  images: string[]
  categoryId?: string | null
  category?: { name: string } | null
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  async function load() {
    const res = await fetch('/api/admin/products')
    if (res.ok) setProducts(await res.json())
  }

  useEffect(() => { load() }, [])

  async function toggleVisible(product: Product) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !product.visible }),
    })
    load()
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Products</h1>
        <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {(showForm || editing) && (
        <ProductForm
          product={editing}
          onSave={() => { setShowForm(false); setEditing(null); load() }}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        {products.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">No products yet. Add your first product.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((p) => (
              <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${!p.visible ? 'opacity-50' : ''}`}>
                {p.images[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.category?.name ?? 'Uncategorized'} · Stock: {p.stock}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-[#4CA771]">{formatPrice(p.price)}</span>
                  <button onClick={() => { setEditing(p); setShowForm(false) }} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => toggleVisible(p)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    {p.visible ? <Eye className="w-4 h-4 text-gray-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </button>
                  <button onClick={() => deleteProduct(p)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

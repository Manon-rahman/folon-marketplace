'use client'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Plus, Trash2 } from 'lucide-react'

interface Category { id: string; name: string; slug: string; visible: boolean; displayOrder: number }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')

  async function load() {
    setLoadError('')
    const res = await fetch('/api/admin/categories')
    if (res.ok) {
      setCategories(await res.json())
    } else {
      setLoadError('Failed to load categories. Please refresh.')
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e?: React.FormEvent) {
    e?.preventDefault()
    if (!newName.trim()) {
      setError('Please enter a category name')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), displayOrder: categories.length }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to add category')
        return
      }
      setNewName('')
      load()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Products will become uncategorized.')) return
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    load()
  }

  async function toggleVisible(cat: Category) {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !cat.visible }),
    })
    load()
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Categories</h1>
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <Input
            id="catname"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Category name (e.g. Dairy, Snacks)"
          />
        </div>
        <Button type="button" onClick={() => handleCreate()} loading={saving} className="gap-1.5 flex-shrink-0">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>
      {error && <p className="text-sm text-red-500 -mt-2 mb-4">{error}</p>}

      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        {loadError ? (
          <p className="text-center text-sm text-red-400 py-12">{loadError}</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">No categories yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <div key={cat.id} className={`flex items-center gap-3 px-4 py-3 ${!cat.visible ? 'opacity-50' : ''}`}>
                <div className="flex-1">
                  <p className="text-sm font-medium">{cat.name}</p>
                  <p className="text-xs text-gray-400">/{cat.slug}</p>
                </div>
                <button onClick={() => toggleVisible(cat)} className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-50">
                  {cat.visible ? 'Visible' : 'Hidden'}
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
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

'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import ImageUploader from '@/components/admin/ImageUploader'
import Button from '@/components/ui/Button'
import { Plus, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'

interface Banner {
  id: string
  imageUrl: string
  linkUrl: string | null
  displayOrder: number
  active: boolean
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newImages, setNewImages] = useState<string[]>([])
  const [newLink, setNewLink] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await fetch('/api/admin/banners')
      const text = await res.text()
      let data: unknown
      try { data = JSON.parse(text) } catch {
        setLoadError('Server error loading banners. Try refreshing the page.')
        setLoading(false)
        return
      }
      if (res.status === 401) { setLoadError('Session expired. Please log in again.'); setLoading(false); return }
      if (!res.ok) { setLoadError((data as { error?: string })?.error ?? 'Failed to load banners'); setLoading(false); return }
      if (Array.isArray(data)) setBanners(data)
    } catch {
      setLoadError('Network error. Check your connection.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (newImages.length === 0) return
    setSaving(true)
    await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: newImages[0],
        linkUrl: newLink || null,
        displayOrder: banners.length,
        active: true,
      }),
    })
    setNewImages([])
    setNewLink('')
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function toggleActive(banner: Banner) {
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !banner.active }),
    })
    load()
  }

  async function updateOrder(banner: Banner, delta: number) {
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayOrder: banner.displayOrder + delta }),
    })
    load()
  }

  async function deleteBanner(id: string) {
    if (!confirm('Delete this banner?')) return
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Banners</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Banner
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5 mb-6">
          <h2 className="font-semibold mb-4">New Banner</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Banner Image <span className="text-gray-400 font-normal">(16:9 recommended)</span>
              </label>
              <ImageUploader images={newImages} onChange={setNewImages} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Link URL (optional)</label>
              <input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="e.g. /products or https://..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/20"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreate} loading={saving} disabled={newImages.length === 0}>
                Save Banner
              </Button>
              <Button variant="ghost" onClick={() => { setShowForm(false); setNewImages([]) }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 text-sm text-red-600">
          {loadError}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
      ) : banners.length === 0 && !loadError ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <p className="font-medium">No banners yet</p>
          <p className="text-sm mt-1">Add your first banner above</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {banners.map((banner, idx) => (
            <div key={banner.id} className={`bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden flex gap-4 p-3 items-center ${!banner.active ? 'opacity-50' : ''}`}>
              <div className="flex flex-col gap-1">
                <button onClick={() => updateOrder(banner, -1)} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30" aria-label="Move up">
                  <GripVertical className="w-4 h-4 text-gray-400 rotate-90" />
                </button>
                <button onClick={() => updateOrder(banner, 1)} disabled={idx === banners.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30" aria-label="Move down">
                  <GripVertical className="w-4 h-4 text-gray-400 -rotate-90" />
                </button>
              </div>

              <div className="relative w-32 aspect-video rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <Image src={banner.imageUrl} alt={`Banner ${idx + 1}`} fill className="object-cover" sizes="128px" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">{banner.linkUrl || 'No link'}</p>
                <p className="text-xs font-medium mt-0.5">{banner.active ? '● Active' : '○ Hidden'}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(banner)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label={banner.active ? 'Hide' : 'Show'}
                >
                  {banner.active ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
                <button
                  onClick={() => deleteBanner(banner.id)}
                  className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

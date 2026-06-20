'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError('')
    setUploading(true)

    const results: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const text = await res.text()
        let data: { url?: string; error?: string } = {}
        try { data = JSON.parse(text) } catch { setError('Server error — check console'); break }
        if (!res.ok) { setError(data.error ?? 'Upload failed'); break }
        if (data.url) results.push(data.url)
      } catch {
        setError('Network error — upload failed')
        break
      }
    }

    if (results.length > 0) onChange([...images, ...results])
    setUploading(false)
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    uploadFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
              <Image src={url} alt={`Product image ${i + 1}`} fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                aria-label="Remove image"
              >
                <X className="w-3 h-3 text-gray-700" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-black/40 text-white py-0.5">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition-colors ${
          dragOver
            ? 'border-[#4CA771] bg-[#e8f5ee]'
            : 'border-gray-200 hover:border-[#4CA771] hover:bg-gray-50'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-[#4CA771] animate-spin" />
        ) : (
          <Upload className="w-6 h-6 text-gray-400" />
        )}
        <p className="text-sm text-gray-500 text-center">
          {uploading
            ? 'Uploading…'
            : 'Click to upload or drag & drop'}
        </p>
        <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 400 })
  }

  // Use Vercel Blob when token is configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
    const { put } = await import('@vercel/blob')
    const blob = await put(`products/${filename}`, file, { access: 'public' })
    return NextResponse.json({ url: blob.url })
  }

  // Compress with sharp and store as base64 data URL in the database
  const buffer = Buffer.from(await file.arrayBuffer())
  const compressed = await sharp(buffer)
    .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer()
  const base64 = `data:image/jpeg;base64,${compressed.toString('base64')}`
  return NextResponse.json({ url: base64 })
}

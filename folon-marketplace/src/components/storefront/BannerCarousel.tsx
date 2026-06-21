'use client'
import { useEffect, useState } from 'react'
import SmartImage from '@/components/ui/SmartImage'
import Link from 'next/link'

interface Banner {
  id: string
  imageUrl: string
  linkUrl?: string | null
}

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)
  const [intervalKey, setIntervalKey] = useState(0)
  const touchStartX = { current: 0 }

  // setInterval with functional update — no stale closure, always advances correctly
  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => setCurrent(c => (c + 1) % banners.length), 3000)
    return () => clearInterval(id)
  }, [banners.length, intervalKey])

  if (banners.length === 0) return null

  function go(next: number) {
    setCurrent((next + banners.length) % banners.length)
    setIntervalKey(k => k + 1) // restart the interval so it doesn't fire immediately after a manual tap
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) go(current + (diff > 0 ? 1 : -1))
  }

  return (
    <div className="px-4 pt-3 pb-1">
      {/* Image */}
      <div
        className="relative w-full aspect-video overflow-hidden rounded-2xl bg-gray-100"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner, i) => {
          const slide = (
            <SmartImage
              key={banner.id}
              src={banner.imageUrl}
              alt={`Banner ${i + 1}`}
              fill
              className="object-cover"
              style={{
                opacity: i === current ? 1 : 0,
                transition: 'opacity 0.5s ease',
                zIndex: i === current ? 1 : 0,
              }}
              sizes="(max-width: 512px) 100vw, 512px"
              priority={i === 0}
            />
          )
          return banner.linkUrl ? (
            <Link key={banner.id} href={banner.linkUrl} style={{ position: 'absolute', inset: 0, zIndex: i === current ? 1 : 0 }}>
              {slide}
            </Link>
          ) : slide
        })}
      </div>

      {/* Dots — below the image, always visible */}
      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2.5 pb-1">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="transition-all duration-300"
              style={{
                width: i === current ? 20 : 8,
                height: 8,
                borderRadius: 9999,
                background: i === current ? '#4CA771' : '#4CA77140',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

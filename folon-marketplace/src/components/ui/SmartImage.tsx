'use client'
import Image, { ImageProps } from 'next/image'

type SmartImageProps = Omit<ImageProps, 'src'> & { src: string }

export default function SmartImage({ src, ...props }: SmartImageProps) {
  if (src.startsWith('data:')) {
    const { fill, width, height, sizes, priority, ...rest } = props
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={rest.alt ?? ''}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: (rest.className?.includes('object-cover') ? 'cover' : 'contain') }}
          className={rest.className}
        />
      )
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={rest.alt ?? ''} width={width} height={height} className={rest.className} />
    )
  }
  return <Image src={src} {...props} />
}

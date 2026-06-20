import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'brand'
  className?: string
}

export default function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-[#e8f5ee] text-[#2e7049]': variant === 'success' || variant === 'brand',
          'bg-amber-50 text-amber-700': variant === 'warning',
          'bg-red-50 text-red-700': variant === 'error',
          'bg-gray-100 text-gray-600': variant === 'neutral',
        },
        className
      )}
    >
      {children}
    </span>
  )
}

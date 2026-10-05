import type { ComponentProps } from 'react'
import { cn } from '@/shared/utils/utils'

// Shared width, gutter and centering. Pages override via className (e.g. `max-w-2xl`).
export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8', className)} {...props} />
}

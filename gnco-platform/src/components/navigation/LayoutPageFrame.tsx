'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const APP_PATH_PREFIXES = ['/dashboard', '/architect', '/operator', '/reports', '/intelligence', '/compare', '/marketplace', '/settings', '/tools', '/funds']

export function LayoutPageFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAppRoute = APP_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  return <div className={cn('pb-9', !isAppRoute && 'pt-24')}>{children}</div>
}

'use client'

import { usePathname } from 'next/navigation'
import { NavBar } from '@/components/navigation/NavBar'

const APP_PATH_PREFIXES = ['/dashboard', '/architect', '/operator', '/reports', '/intelligence', '/compare', '/marketplace', '/settings', '/tools', '/funds']

export function LayoutNavigation() {
  const pathname = usePathname()

  const isAppRoute = APP_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isAppRoute) {
    return null
  }

  return <NavBar />
}

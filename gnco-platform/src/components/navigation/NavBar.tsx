'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { cn } from '@/lib/utils'
import { MobileNav } from '@/components/navigation/MobileNav'

const navLinks = [
  { label: 'Platform', href: '/architect' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'Coverage', href: '/coverage' },
  { label: 'Methodology', href: '/methodology' },
  { label: 'Disclosures', href: '/disclosures' },
]

export function NavBar() {
  const pathname = usePathname()
  const scrollY = useScrollPosition()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAppRoute = ['/dashboard', '/architect', '/operator', '/reports'].some((prefix) =>
    pathname.startsWith(prefix)
  )

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-bg-border backdrop-blur-md transition-colors duration-200',
          scrollY > 50 ? 'bg-bg-primary/95' : 'bg-bg-primary/80'
        )}
      >
        {!isAppRoute && (
          <div className="border-b border-bg-border bg-bg-surface/90 px-6 py-2 text-center text-xs text-text-secondary">
            Currently in Open Beta — Free access for all users
          </div>
        )}

        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <Link href="/" aria-label="GNCO — Home" className="flex items-center gap-0">
            <span className="font-serif text-[20px] font-bold leading-none text-accent-gold">◆GNCO</span>
            <span
              aria-label="Beta version"
              style={{
                fontSize: '9px',
                letterSpacing: '1px',
                background: '#1f2937',
                color: '#6b7280',
                padding: '2px 5px',
                borderRadius: '3px',
                marginLeft: '4px',
                verticalAlign: 'super',
              }}
            >
              BETA
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative font-sans text-sm text-text-secondary transition hover:text-text-primary"
                >
                  {item.label}
                  <span
                    className={cn(
                      'absolute -bottom-1 left-0 h-0.5 w-full origin-left bg-accent-gold transition-transform duration-200',
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    )}
                  />
                </Link>
              )
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/signin"
              className="rounded-sm border border-bg-border px-4 py-2 text-sm text-text-secondary transition hover:border-accent-gold/50 hover:text-text-primary"
            >
              Sign In
            </Link>
            <Link
              href="/architect"
              className="rounded-sm bg-accent-gold px-5 py-2 text-sm font-semibold text-bg-primary transition hover:bg-accent-gold-light"
            >
              Start Free →
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-sm p-2 text-text-primary transition hover:bg-bg-elevated md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} navLinks={navLinks} />
    </>
  )
}

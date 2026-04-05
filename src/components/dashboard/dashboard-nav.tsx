'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Role = 'barber' | 'shop' | 'admin'

interface DashboardNavProps {
  role: Role
  displayName?: string | null
}

const navigationByRole = {
  barber: [
    { href: '/dashboard/barber', label: 'Dashboard' },
    { href: '/jobs', label: 'Vagas' },
    { href: '/dashboard/applications', label: 'Candidaturas' },
    { href: '/dashboard/invitations', label: 'Convites' },
    { href: '/dashboard/profile', label: 'Perfil' }
  ],
  shop: [
    { href: '/dashboard/shop', label: 'Dashboard' },
    { href: '/jobs', label: 'Mercado' },
    { href: '/dashboard/profile', label: 'Perfil' }
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Painel' },
    { href: '/jobs', label: 'Vagas' }
  ]
} as const satisfies Record<Role, ReadonlyArray<{ href: string; label: string }>>

function isActivePath(pathname: string, href: string) {
  if (href === '/jobs') {
    return pathname === '/jobs' || pathname.startsWith('/job/')
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardNav({ role, displayName }: DashboardNavProps) {
  const pathname = usePathname()
  const navigation = navigationByRole[role]
  const primaryAction: { href: '/dashboard/shop' | '/dashboard/admin' | '/jobs'; label: string } =
    role === 'shop'
      ? { href: '/dashboard/shop', label: 'Nova vaga' }
      : role === 'admin'
        ? { href: '/dashboard/admin', label: 'Painel admin' }
        : { href: '/jobs', label: 'Explorar vagas' }

  const roleLabel =
    role === 'shop' ? 'Area da barbearia' : role === 'admin' ? 'Area administrativa' : 'Area do barbeiro'

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-xl font-semibold tracking-wide text-white">
              Barber<span className="text-sky-400">Bridge</span>
            </Link>
            <p className="mt-1 text-sm text-slate-400">
              {roleLabel}
              {displayName ? ` • ${displayName}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="text-sm text-slate-300 transition hover:text-white">
              Voltar ao site
            </Link>
            <Link href={primaryAction.href} className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950">
              {primaryAction.label}
            </Link>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navigation.map((item) => {
            const active = isActivePath(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? 'bg-sky-500 text-slate-950'
                    : 'border border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

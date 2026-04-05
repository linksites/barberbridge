'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type DashboardHref = '/dashboard/barber' | '/dashboard/shop' | '/onboarding'

export function SiteHeader() {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [dashboardHref, setDashboardHref] = useState<DashboardHref>('/onboarding')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function loadSessionState() {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        setIsAuthenticated(false)
        setDashboardHref('/onboarding')
        return
      }

      setIsAuthenticated(true)

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      setDashboardHref(profile?.role === 'shop' ? '/dashboard/shop' : '/dashboard/barber')
    }

    loadSessionState()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      loadSessionState()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  async function handleSignOut() {
    setIsSigningOut(true)
    setIsMenuOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.assign('/')
  }

  const sharedLinks = (
    <>
      <Link href="/jobs">Vagas</Link>
      <Link href="/pricing">Planos</Link>
    </>
  )

  const sessionLinks = isAuthenticated ? (
    <>
      <Link href={dashboardHref}>Dashboard</Link>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="rounded-xl bg-sky-500 px-4 py-2 font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSigningOut ? 'Saindo...' : 'Sair'}
      </button>
    </>
  ) : (
    <>
      <Link href="/login">Entrar</Link>
      <Link href="/register" className="rounded-xl bg-sky-500 px-4 py-2 font-medium text-slate-950">
        Criar conta
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-semibold tracking-wide text-white">
            Barber<span className="text-sky-400">Bridge</span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
            {sharedLinks}
            {sessionLinks}
          </nav>

          <button
            type="button"
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-slate-200 md:hidden"
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {isMenuOpen ? (
          <div className="mt-4 grid gap-3 rounded-3xl border border-slate-800 bg-slate-900/95 p-4 text-sm text-slate-200 md:hidden">
            <Link href="/jobs" className="rounded-2xl border border-slate-800 px-4 py-3">
              Vagas
            </Link>
            <Link href="/pricing" className="rounded-2xl border border-slate-800 px-4 py-3">
              Planos
            </Link>
            {isAuthenticated ? (
              <>
                <Link href={dashboardHref} className="rounded-2xl border border-slate-800 px-4 py-3">
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSigningOut ? 'Saindo...' : 'Sair'}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-2xl border border-slate-800 px-4 py-3">
                  Entrar
                </Link>
                <Link href="/register" className="rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-slate-950">
                  Criar conta
                </Link>
              </>
            )}
          </div>
        ) : null}
      </div>
    </header>
  )
}

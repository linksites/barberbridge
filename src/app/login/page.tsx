'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SiteHeader } from '@/components/site-header'

export default function LoginPage() {
  const [role, setRole] = useState<'barber' | 'shop'>('barber')
  const [errorParam, setErrorParam] = useState<string | null>(null)
  const [nextPath, setNextPath] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const next = params.get('next')
    const inferredRole = next?.startsWith('/dashboard/shop')
      ? 'shop'
      : next?.startsWith('/dashboard/barber') ||
          next?.startsWith('/dashboard/portfolio') ||
          next?.startsWith('/dashboard/applications') ||
          next?.startsWith('/dashboard/invitations')
        ? 'barber'
        : params.get('role') === 'shop'
          ? 'shop'
          : 'barber'

    setRole(inferredRole)
    setErrorParam(params.get('error'))
    setNextPath(next)
  }, [])

  async function handleLogin() {
    const supabase = createClient()
    const next = nextPath ?? `/onboarding?role=${role}`
    const emailRedirectTo = `${window.location.origin}${next}`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo
      }
    })

    setMessage(error ? error.message : 'Link mágico enviado para seu e-mail.')
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-soft">
          <h1 className="text-3xl font-bold text-white">Entrar</h1>
          <p className="mt-2 text-slate-400">
            Use login por link mágico com Supabase para continuar como {role === 'shop' ? 'barbearia' : 'barbeiro'}.
          </p>
          <div className="mt-6 flex flex-col gap-4">
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleLogin} className="rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-slate-950">
              Enviar link de acesso
            </button>
            {errorParam === 'auth_confirm_failed' ? (
              <p className="text-sm text-rose-300">Não foi possível validar o link. Peça um novo acesso.</p>
            ) : null}
            {message ? <p className="text-sm text-slate-300">{message}</p> : null}
          </div>
        </div>
      </section>
    </main>
  )
}

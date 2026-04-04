'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SiteHeader } from '@/components/site-header'

export default function RegisterPage() {
  const [role, setRole] = useState<'barber' | 'shop'>('barber')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRole(params.get('role') === 'shop' ? 'shop' : 'barber')
  }, [])

  async function handleRegister() {
    if (!email) {
      setMessage('Informe seu e-mail para criar a conta.')
      return
    }

    if (password.length < 6) {
      setMessage('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('A confirmação de senha não confere.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const supabase = createClient()
      const next = `/onboarding?role=${role}`
      const emailRedirectTo = `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: {
            role
          }
        }
      })

      if (error) {
        setMessage(error.message)
        return
      }

      if (data.session) {
        window.location.assign(next)
        return
      }

      setMessage('Conta criada. Se a confirmação de e-mail estiver ativa no Supabase, confirme o e-mail antes de entrar.')
      window.location.assign(`/login?role=${role}&email=${encodeURIComponent(email)}`)
    } catch {
      setMessage('Não foi possível criar a conta agora.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-soft">
          <h1 className="text-3xl font-bold text-white">Criar conta</h1>
          <p className="mt-2 text-slate-400">
            Crie acesso com e-mail e senha. O magic link continua disponível apenas como alternativa.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              onClick={() => setRole('barber')}
              className={`rounded-2xl border p-5 text-left ${role === 'barber' ? 'border-sky-400 bg-sky-500/10' : 'border-slate-800 bg-slate-950/70'}`}
            >
              <h2 className="text-lg font-semibold text-white">Sou barbeiro</h2>
              <p className="mt-2 text-sm text-slate-400">Quero encontrar oportunidades e acompanhar candidaturas.</p>
            </button>
            <button
              onClick={() => setRole('shop')}
              className={`rounded-2xl border p-5 text-left ${role === 'shop' ? 'border-sky-400 bg-sky-500/10' : 'border-slate-800 bg-slate-950/70'}`}
            >
              <h2 className="text-lg font-semibold text-white">Sou barbearia</h2>
              <p className="mt-2 text-sm text-slate-400">Quero publicar vagas e organizar minha operação.</p>
            </button>
          </div>

          <div className="mt-8 grid gap-4">
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              type="password"
              placeholder="Crie uma senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <input
              type="password"
              placeholder="Confirme a senha"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={handleRegister}
              disabled={isSubmitting}
              className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta com senha'}
            </button>
            <Link href={`/login?role=${role}`} className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-white">
              Já tenho conta
            </Link>
          </div>

          {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
        </div>
      </section>
    </main>
  )
}

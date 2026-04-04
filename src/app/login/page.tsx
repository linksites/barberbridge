'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SiteHeader } from '@/components/site-header'

type AccessMode = 'password' | 'email'

export default function LoginPage() {
  const [role, setRole] = useState<'barber' | 'shop'>('barber')
  const [mode, setMode] = useState<AccessMode>('password')
  const [errorParam, setErrorParam] = useState<string | null>(null)
  const [nextPath, setNextPath] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [hasSentAccess, setHasSentAccess] = useState(false)

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
    setEmail(params.get('email') ?? '')
  }, [])

  async function handlePasswordLogin() {
    if (!email || !password) {
      setMessage('Informe e-mail e senha para entrar.')
      return
    }

    setIsSigningIn(true)
    setMessage('')

    try {
      const supabase = createClient()
      const next = nextPath ?? `/onboarding?role=${role}`
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setMessage(error.message)
        return
      }

      window.location.assign(next)
    } catch {
      setMessage('Nao foi possivel entrar agora.')
    } finally {
      setIsSigningIn(false)
    }
  }

  async function handleMagicLink() {
    if (!email) {
      setMessage('Informe seu e-mail para continuar.')
      return
    }

    setIsSending(true)
    setMessage('')
    const supabase = createClient()
    const next = nextPath ?? `/onboarding?role=${role}`
    const emailRedirectTo = `${window.location.origin}${next}`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo
      }
    })

    setIsSending(false)
    setHasSentAccess(!error)
    setMessage(
      error
        ? error.message
        : 'Link magico e codigo enviados para seu e-mail. Voce pode entrar pelo botao do e-mail ou digitando o codigo abaixo.'
    )
  }

  async function handleVerifyCode() {
    if (!email) {
      setMessage('Informe o mesmo e-mail usado para receber o codigo.')
      return
    }

    if (otpCode.length < 6) {
      setMessage('Digite o codigo de 6 digitos enviado por e-mail.')
      return
    }

    setIsVerifying(true)
    setMessage('')
    const supabase = createClient()
    const next = nextPath ?? `/onboarding?role=${role}`
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'email'
    })

    setIsVerifying(false)

    if (error) {
      setMessage(error.message)
      return
    }

    window.location.assign(next)
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-soft">
          <h1 className="text-3xl font-bold text-white">Entrar</h1>
          <p className="mt-2 text-slate-400">
            Entre com e-mail e senha. Se preferir, o magic link continua disponivel como acesso alternativo.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`rounded-full px-4 py-2 text-sm ${mode === 'password' ? 'bg-sky-500 font-semibold text-slate-950' : 'border border-slate-700 text-slate-300'}`}
            >
              E-mail e senha
            </button>
            <button
              type="button"
              onClick={() => setMode('email')}
              className={`rounded-full px-4 py-2 text-sm ${mode === 'email' ? 'bg-sky-500 font-semibold text-slate-950' : 'border border-slate-700 text-slate-300'}`}
            >
              Magic link e codigo
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {mode === 'password' ? (
              <>
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  onClick={handlePasswordLogin}
                  disabled={isSigningIn}
                  className="rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSigningIn ? 'Entrando...' : 'Entrar com senha'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleMagicLink}
                  disabled={isSending}
                  className="rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSending ? 'Enviando...' : 'Enviar link e codigo'}
                </button>
                {hasSentAccess ? (
                  <>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-sm text-slate-300">
                        Se o link magico falhar ou atrasar, use o codigo de 6 digitos que veio no mesmo e-mail.
                      </p>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Codigo de 6 digitos"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                    <button
                      onClick={handleVerifyCode}
                      disabled={isVerifying}
                      className="rounded-2xl border border-slate-700 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isVerifying ? 'Validando codigo...' : 'Entrar com codigo'}
                    </button>
                  </>
                ) : null}
              </>
            )}

            {errorParam === 'auth_confirm_failed' ? (
              <p className="text-sm text-rose-300">
                Nao foi possivel validar o link. Se voce recebeu o codigo no e-mail, tente entrar por ele abaixo.
              </p>
            ) : null}

            <p className="text-sm text-slate-400">
              Ainda nao tem conta?{' '}
              <Link href={`/register?role=${role}`} className="text-sky-300">
                Criar conta
              </Link>
            </p>

            {message ? <p className="text-sm text-slate-300">{message}</p> : null}
          </div>
        </div>
      </section>
    </main>
  )
}

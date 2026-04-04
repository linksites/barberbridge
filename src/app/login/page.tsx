'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SiteHeader } from '@/components/site-header'

export default function LoginPage() {
  const [role, setRole] = useState<'barber' | 'shop'>('barber')
  const [errorParam, setErrorParam] = useState<string | null>(null)
  const [nextPath, setNextPath] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
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
  }, [])

  async function handleLogin() {
    if (!email) {
      setMessage('Informe seu e-mail para continuar.')
      return
    }

    setIsSending(true)
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
            Use login por link magico com Supabase para continuar como {role === 'shop' ? 'barbearia' : 'barbeiro'}.
          </p>
          <div className="mt-6 flex flex-col gap-4">
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleLogin}
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
            {errorParam === 'auth_confirm_failed' ? (
              <p className="text-sm text-rose-300">
                Nao foi possivel validar o link. Se voce recebeu o codigo no e-mail, tente entrar por ele abaixo.
              </p>
            ) : null}
            {message ? <p className="text-sm text-slate-300">{message}</p> : null}
          </div>
        </div>
      </section>
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'

export default function OnboardingPage() {
  const router = useRouter()
  const [role, setRole] = useState<'barber' | 'shop'>('barber')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRole(params.get('role') === 'shop' ? 'shop' : 'barber')
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    const formData = new FormData(event.currentTarget)
    const payload = Object.fromEntries(formData.entries())

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, ...payload })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message ?? 'Não foi possível salvar o onboarding.')
        return
      }

      setMessage(data.message)
      router.push(data.redirectTo ?? `/dashboard/${role}`)
      router.refresh()
    } catch {
      setMessage('Não foi possível salvar o onboarding.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-soft">
          <h1 className="text-4xl font-bold text-white">Onboarding inicial</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Estrutura pronta para capturar dados importantes do primeiro acesso e direcionar cada perfil para a área correta do produto.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setRole('barber')}
              className={`rounded-2xl border p-5 text-left ${role === 'barber' ? 'border-sky-400 bg-sky-500/10' : 'border-slate-800 bg-slate-950/70'}`}
            >
              <h2 className="text-lg font-semibold text-white">Fluxo do barbeiro</h2>
              <p className="mt-2 text-sm text-slate-400">Captura especialidades, cidade, disponibilidade e presença digital.</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('shop')}
              className={`rounded-2xl border p-5 text-left ${role === 'shop' ? 'border-sky-400 bg-sky-500/10' : 'border-slate-800 bg-slate-950/70'}`}
            >
              <h2 className="text-lg font-semibold text-white">Fluxo da barbearia</h2>
              <p className="mt-2 text-sm text-slate-400">Captura nome da casa, localização e apresentação inicial da operação.</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
            <input name="full_name" placeholder={role === 'barber' ? 'Seu nome profissional' : 'Nome da barbearia'} />
            <input name="city" placeholder="Cidade" />
            <input name="state" placeholder="Estado" />
            <input name="phone" placeholder="WhatsApp" />
            <input name="instagram" placeholder="Instagram" />
            {role === 'barber' ? (
              <input name="specialties" placeholder="Especialidades separadas por vírgula" />
            ) : (
              <input name="neighborhood" placeholder="Bairro" />
            )}
            <textarea
              className="md:col-span-2"
              name="bio"
              placeholder={role === 'barber' ? 'Resumo profissional' : 'Descrição da barbearia'}
              rows={5}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar onboarding'}
            </button>
          </form>

          {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
        </div>
      </section>
    </main>
  )
}

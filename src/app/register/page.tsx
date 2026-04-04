'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<'barber' | 'shop'>('barber')

  function proceed() {
    router.push(`/login?role=${role}`)
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-soft">
          <h1 className="text-3xl font-bold text-white">Criar conta</h1>
          <p className="mt-2 text-slate-400">Escolha o perfil inicial do fluxo do produto.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              onClick={() => setRole('barber')}
              className={`rounded-2xl border p-5 text-left ${role === 'barber' ? 'border-sky-400 bg-sky-500/10' : 'border-slate-800 bg-slate-950/70'}`}
            >
              <h2 className="text-lg font-semibold text-white">Sou barbeiro</h2>
              <p className="mt-2 text-sm text-slate-400">Quero encontrar oportunidades e divulgar meu trabalho.</p>
            </button>
            <button
              onClick={() => setRole('shop')}
              className={`rounded-2xl border p-5 text-left ${role === 'shop' ? 'border-sky-400 bg-sky-500/10' : 'border-slate-800 bg-slate-950/70'}`}
            >
              <h2 className="text-lg font-semibold text-white">Sou barbearia</h2>
              <p className="mt-2 text-sm text-slate-400">Quero publicar vagas e encontrar profissionais.</p>
            </button>
          </div>
          <button onClick={proceed} className="mt-8 rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950">
            Continuar com e-mail
          </button>
        </div>
      </section>
    </main>
  )
}

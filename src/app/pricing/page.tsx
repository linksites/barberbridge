import { SiteHeader } from '@/components/site-header'
import { Footer } from '@/components/footer'

const plans = [
  {
    name: 'Starter',
    price: 'R$ 0',
    description: 'Validação inicial para entrar na plataforma.',
    items: ['Perfil básico', '1 vaga ativa', 'Candidaturas limitadas']
  },
  {
    name: 'Pro',
    price: 'R$ 49/mês',
    description: 'Mais visibilidade e operação para crescer.',
    items: ['Vagas ilimitadas', 'Destaque de perfil', 'Filtros avançados']
  },
  {
    name: 'Scale',
    price: 'R$ 99/mês',
    description: 'Para barbearias com operação mais intensa.',
    items: ['Equipe e histórico', 'Relatórios', 'Prioridade em suporte']
  }
]

export default function PricingPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-white">Planos</h1>
          <p className="mt-3 text-slate-300">Estrutura inicial de monetização para o SaaS.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-2xl font-semibold text-white">{plan.name}</h2>
              <p className="mt-3 text-3xl font-bold text-sky-300">{plan.price}</p>
              <p className="mt-3 text-sm text-slate-400">{plan.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-slate-300">
                {plan.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  )
}

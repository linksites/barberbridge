import { BriefcaseBusiness, Search, Star, Users } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/empty-state'
import { SectionCard } from '@/components/dashboard/section-card'
import { ShopJobForm } from '@/components/dashboard/shop-job-form'
import { StatCard } from '@/components/dashboard/stat-card'
import { StatusPill } from '@/components/dashboard/status-pill'
import { getCurrentShopJobs } from '@/services/jobs'
import { shopApplicants } from '@/services/mock-data'
import { currency } from '@/lib/utils'

const icons = [
  <BriefcaseBusiness key="1" className="size-5" />,
  <Users key="2" className="size-5" />,
  <Search key="3" className="size-5" />,
  <Star key="4" className="size-5" />
]

export default async function ShopDashboardPage() {
  const { shop, jobs } = await getCurrentShopJobs()
  const openJobs = jobs.filter((job) => job.status === 'open').length
  const closedJobs = jobs.filter((job) => job.status === 'closed').length
  const averageTicket = jobs.length > 0 ? jobs.reduce((sum, job) => sum + Number(job.amount), 0) / jobs.length : 0
  const stats = [
    { title: 'Vagas criadas', value: String(jobs.length), helper: shop ? `Operação de ${shop.shop_name}` : 'Complete o onboarding da barbearia' },
    { title: 'Vagas abertas', value: String(openJobs), helper: openJobs > 0 ? 'Demandas ativas agora' : 'Nenhuma vaga aberta no momento' },
    { title: 'Vagas fechadas', value: String(closedJobs), helper: closedJobs > 0 ? 'Histórico de contratações' : 'Sem vagas encerradas ainda' },
    { title: 'Ticket médio', value: jobs.length > 0 ? currency(averageTicket) : 'R$ 0,00', helper: 'Valor médio por vaga publicada' }
  ]

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Shop area</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Dashboard da barbearia</h1>
        <p className="mt-3 text-slate-300">
          {shop
            ? `Operação de vagas, shortlist e histórico da ${shop.shop_name}.`
            : 'Conclua o onboarding para publicar vagas e operar o marketplace.'}
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => (
          <StatCard key={item.title} title={item.title} value={item.value} helper={item.helper} icon={icons[index]} />
        ))}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr,1fr]">
        <SectionCard title="Nova vaga" description="Publicação real vinculada à sua shop_profile autenticada.">
          <ShopJobForm />
        </SectionCard>

        <SectionCard title="Playbook da operação" description="Ações rápidas para uma barbearia usar o produto com foco em contratação e retenção.">
          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">1. Publique a vaga com valor, agenda e modelo de trabalho.</div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">2. Convide barbeiros com bom rating e portfólio aderente.</div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">3. Registre feedback após teste, diária ou contratação.</div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">4. Use mensagens para alinhar detalhes e fechar mais rápido.</div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Minhas vagas" description="Dados reais da sua barbearia, já lidos do Supabase.">
          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{job.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {job.city}
                        {job.state ? ` • ${job.state}` : ''} • {job.work_type} • {job.payment_model}
                      </p>
                      <p className="mt-3 text-sm text-sky-300">{currency(Number(job.amount))}</p>
                    </div>
                    <StatusPill label={job.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Nenhuma vaga publicada" description="Use o formulário acima para criar a primeira vaga real da sua barbearia." />
          )}
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Shortlist de barbeiros" description="Base mockada por enquanto. O próximo passo natural é transformar esta área em busca real com filtros.">
          <div className="grid gap-4 md:grid-cols-3">
            {shopApplicants.map((person) => (
              <div key={person.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">{person.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{person.city}</p>
                  </div>
                  <StatusPill label={person.status} />
                </div>
                <p className="mt-3 text-sm text-slate-300">{person.specialty}</p>
                <p className="mt-3 text-sm font-semibold text-amber-300">★ {person.rating}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  )
}

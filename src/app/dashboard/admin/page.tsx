import { Shield, Users, BriefcaseBusiness, Mail, FileText } from 'lucide-react'
import { redirect } from 'next/navigation'
import { EmptyState } from '@/components/dashboard/empty-state'
import { JobEntryActions } from '@/components/dashboard/job-entry-actions'
import { SectionCard } from '@/components/dashboard/section-card'
import { ShopJobForm } from '@/components/dashboard/shop-job-form'
import { StatCard } from '@/components/dashboard/stat-card'
import { StatusPill } from '@/components/dashboard/status-pill'
import { currency } from '@/lib/utils'
import { getCurrentAdminDashboard } from '@/services/admin'

const icons = [
  <Users key="users" className="size-5" />,
  <BriefcaseBusiness key="jobs" className="size-5" />,
  <FileText key="applications" className="size-5" />,
  <Mail key="invitations" className="size-5" />
]

export default async function AdminDashboardPage() {
  const adminDashboard = await getCurrentAdminDashboard()

  if (!adminDashboard) {
    redirect('/login')
  }

  const stats = [
    {
      title: 'Usuarios',
      value: String(adminDashboard.counts.users),
      helper: 'Perfis cadastrados no marketplace'
    },
    {
      title: 'Vagas',
      value: String(adminDashboard.counts.jobs),
      helper: 'Vagas criadas na plataforma'
    },
    {
      title: 'Candidaturas',
      value: String(adminDashboard.counts.applications),
      helper: 'Fluxos ativos de candidatura'
    },
    {
      title: 'Convites',
      value: String(adminDashboard.counts.invitations),
      helper: 'Convites enviados por barbearias'
    }
  ]

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Area administrativa</p>
        <h1 className="mt-3 flex items-center gap-3 text-4xl font-bold text-white">
          <Shield className="size-9 text-sky-400" />
          Dashboard do administrador
        </h1>
        <p className="mt-3 text-slate-300">
          Visao central do produto com leitura global de usuarios, vagas e fluxos operacionais.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => (
          <StatCard key={item.title} title={item.title} value={item.value} helper={item.helper} icon={icons[index]} />
        ))}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <SectionCard
          title="Criar vaga"
          description="Publicacao administrativa de vagas em nome de uma barbearia existente."
        >
          {adminDashboard.shops.length > 0 ? (
            <ShopJobForm
              shopOptions={adminDashboard.shops.map((shop) => ({
                id: shop.id,
                label: shop.city ? `${shop.shop_name} - ${shop.city}` : shop.shop_name
              }))}
            />
          ) : (
            <EmptyState
              title="Nenhuma barbearia cadastrada"
              description="Crie ou conclua o onboarding de uma barbearia antes de publicar vagas pelo painel admin."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Usuarios recentes"
          description="Leitura administrativa de `user_profiles` para suporte, verificacao e acompanhamento."
        >
          {adminDashboard.recentUsers.length > 0 ? (
            <div className="space-y-4">
              {adminDashboard.recentUsers.map((user) => (
                <div key={user.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{user.full_name ?? user.username ?? 'Usuario sem nome'}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {user.username ? `@${user.username}` : 'Sem username'}
                        {user.city ? ` - ${user.city}` : ''}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <StatusPill label={user.role} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem usuarios recentes" description="Novos cadastros aparecerao aqui quando forem criados." />
          )}
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Vagas recentes"
          description="Criacao, edicao e exclusao de vagas com visao administrativa global."
        >
          {adminDashboard.recentJobs.length > 0 ? (
            <div className="space-y-4">
              {adminDashboard.recentJobs.map((job) => (
                <div key={job.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{job.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {job.shop_name ?? 'Barbearia sem nome'}
                        {job.city ? ` - ${job.city}` : ''}
                        {job.state ? ` / ${job.state}` : ''}
                      </p>
                      <p className="mt-2 text-sm text-sky-300">
                        {currency(Number(job.amount))} - {job.work_type} - {job.payment_model}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Criada em {new Date(job.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <JobEntryActions job={job} />
                    </div>
                    <StatusPill label={job.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem vagas recentes" description="As vagas publicadas aparecerao aqui." />
          )}
        </SectionCard>
      </div>
    </main>
  )
}

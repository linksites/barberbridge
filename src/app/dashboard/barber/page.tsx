import { CalendarDays, MessageSquareMore, Scissors, Star } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/dashboard/empty-state'
import { InvitationActions } from '@/components/dashboard/invitation-actions'
import { SectionCard } from '@/components/dashboard/section-card'
import { StatCard } from '@/components/dashboard/stat-card'
import { StatusPill } from '@/components/dashboard/status-pill'
import { getCurrentBarberDashboard } from '@/services/dashboard'

const icons = [
  <Scissors key="1" className="size-5" />,
  <CalendarDays key="2" className="size-5" />,
  <Star key="3" className="size-5" />,
  <MessageSquareMore key="4" className="size-5" />
]

export default async function BarberDashboardPage() {
  const { profile, applications, reviews, invitations } = await getCurrentBarberDashboard()
  const viewedApplications = applications.filter((item) => item.status === 'viewed').length
  const activeApplications = applications.filter((item) => ['pending', 'viewed'].includes(item.status)).length
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : Number(profile?.average_rating ?? 0)
  const stats = [
    {
      title: 'Especialidades',
      value: String(profile?.specialties?.length ?? 0),
      helper: profile?.specialties?.length ? profile.specialties.join(', ') : 'Adicione suas especialidades no perfil'
    },
    {
      title: 'Candidaturas ativas',
      value: String(activeApplications),
      helper: viewedApplications > 0 ? `${viewedApplications} visualizadas` : 'Nenhuma visualizada ainda'
    },
    {
      title: 'Avaliação média',
      value: averageRating > 0 ? averageRating.toFixed(1) : '0.0',
      helper: reviews.length > 0 ? `Baseado em ${reviews.length} reviews reais` : 'Sem avaliações ainda'
    },
    {
      title: 'Disponibilidade',
      value: profile?.availability_status ?? 'indefinida',
      helper: profile?.city ? `${profile.city}${profile.state ? `, ${profile.state}` : ''}` : 'Atualize sua cidade no perfil'
    }
  ]

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Barber area</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Dashboard do barbeiro</h1>
        <p className="mt-3 text-slate-300">
          {profile
            ? `Seu painel operacional com candidaturas reais, reputação e dados públicos do perfil ${profile.full_name}.`
            : 'Conclua o onboarding para liberar o fluxo do barbeiro no marketplace.'}
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => (
          <StatCard key={item.title} title={item.title} value={item.value} helper={item.helper} icon={icons[index]} />
        ))}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <SectionCard
          title="Perfil profissional"
          description="Resumo real do seu perfil persistido no Supabase."
          action={<Link href="/dashboard/profile" className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-white">Editar perfil</Link>}
        >
          {profile ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <h3 className="font-semibold text-white">{profile.full_name}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {profile.city}
                  {profile.state ? ` • ${profile.state}` : ''}
                </p>
                {profile.bio ? <p className="mt-3 text-sm text-slate-300">{profile.bio}</p> : null}
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <p className="text-sm text-slate-400">Especialidades</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.specialties.length > 0 ? (
                    profile.specialties.map((specialty: string) => (
                      <span key={specialty} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                        {specialty}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">Nenhuma especialidade cadastrada ainda.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState title="Perfil incompleto" description="Conclua o onboarding para habilitar sua área profissional." />
          )}
        </SectionCard>

        <SectionCard
          title="Mensagens"
          description="Essa área ainda está mockada. O próximo passo é ligá-la ao Realtime."
          action={<Link href="/dashboard/messages" className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-white">Abrir inbox</Link>}
        >
          <EmptyState title="Mensagens em preparação" description="A estrutura já existe no banco, mas a experiência em tempo real ainda será conectada." />
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Minhas candidaturas"
          description="Consulta real da job_applications com o contexto da vaga."
          action={<Link href="/dashboard/applications" className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-white">Ver todas</Link>}
        >
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{item.job?.title ?? 'Vaga indisponível'}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.job?.shop_name ?? 'Barbearia'} • {item.job?.city ?? 'Cidade não informada'}
                      </p>
                    </div>
                    <StatusPill label={item.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem candidaturas ainda" description="Assim que você aplicar para vagas, elas aparecerão aqui." />
          )}
        </SectionCard>

        <SectionCard
          title="Convites recebidos"
          description="Leitura real dos convites enviados por barbearias."
          action={<Link href="/dashboard/invitations" className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-white">Abrir área</Link>}
        >
          {invitations.length > 0 ? (
            <div className="space-y-4">
              {invitations.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{item.shop_name}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.role}
                        {item.city ? ` • ${item.city}` : ''}
                      </p>
                      {item.message ? <p className="mt-3 text-sm text-slate-300">{item.message}</p> : null}
                      <InvitationActions invitationId={item.id} currentStatus={item.status} />
                    </div>
                    <StatusPill label={item.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem convites ainda" description="Quando barbearias convidarem seu perfil, os convites aparecerão aqui." />
          )}
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Avaliações"
          description="Leitura real das reviews recebidas pelo seu usuário."
          action={<Link href="/dashboard/reviews" className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-white">Ver todas</Link>}
        >
          {reviews.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-white">{review.author}</h3>
                    <span className="text-sm font-semibold text-amber-300">{review.rating}/5</span>
                  </div>
                  {review.comment ? <p className="mt-3 text-sm text-slate-300">{review.comment}</p> : null}
                  <p className="mt-3 text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem avaliações ainda" description="Quando clientes ou barbearias avaliarem seu trabalho, elas aparecerão aqui." />
          )}
        </SectionCard>
      </div>
    </main>
  )
}

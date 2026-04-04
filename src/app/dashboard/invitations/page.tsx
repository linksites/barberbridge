import { EmptyState } from '@/components/dashboard/empty-state'
import { InvitationActions } from '@/components/dashboard/invitation-actions'
import { SectionCard } from '@/components/dashboard/section-card'
import { StatusPill } from '@/components/dashboard/status-pill'
import { getCurrentBarberDashboard } from '@/services/dashboard'

export default async function InvitationsPage() {
  const { invitations } = await getCurrentBarberDashboard()

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold text-white">Convites</h1>
      <p className="mt-3 text-slate-300">Funil real de convites recebidos para teste, diária e contratação.</p>
      <div className="mt-10">
        <SectionCard title="Convites ativos" description="Convites reais vinculados ao seu perfil de barbeiro.">
          {invitations.length > 0 ? (
            <div className="space-y-4">
              {invitations.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-white">{item.shop_name}</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.role}
                        {item.city ? ` • ${item.city}` : ''}
                      </p>
                      {item.message ? <p className="mt-3 text-sm text-slate-300">{item.message}</p> : null}
                      <p className="mt-3 text-xs text-slate-500">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <InvitationActions invitationId={item.id} currentStatus={item.status} />
                    </div>
                    <StatusPill label={item.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Nenhum convite ainda" description="Quando uma barbearia convidar você para uma vaga ou teste, isso aparecerá aqui." />
          )}
        </SectionCard>
      </div>
    </main>
  )
}

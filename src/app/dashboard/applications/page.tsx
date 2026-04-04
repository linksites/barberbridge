import { EmptyState } from '@/components/dashboard/empty-state'
import { SectionCard } from '@/components/dashboard/section-card'
import { StatusPill } from '@/components/dashboard/status-pill'
import { getCurrentBarberDashboard } from '@/services/dashboard'
import { currency } from '@/lib/utils'

export default async function ApplicationsPage() {
  const { applications } = await getCurrentBarberDashboard()

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold text-white">Candidaturas</h1>
      <p className="mt-3 text-slate-300">Acompanhe as oportunidades reais em andamento no marketplace.</p>
      <div className="mt-10">
        <SectionCard title="Minhas candidaturas" description="Leitura real da tabela job_applications com detalhes da vaga.">
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-white">{item.job?.title ?? 'Vaga indisponível'}</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.job?.shop_name ?? 'Barbearia'} • {item.job?.city ?? 'Cidade não informada'}
                      </p>
                      <p className="mt-3 text-sm text-sky-300">
                        {item.job ? `${currency(Number(item.job.amount))} • ${item.job.payment_model}` : 'Sem dados de pagamento'}
                      </p>
                      {item.message ? <p className="mt-3 text-sm text-slate-300">{item.message}</p> : null}
                    </div>
                    <StatusPill label={item.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Nenhuma candidatura ainda" description="Quando você se candidatar a vagas reais, elas aparecerão aqui." />
          )}
        </SectionCard>
      </div>
    </main>
  )
}

import { EmptyState } from '@/components/dashboard/empty-state'
import { SectionCard } from '@/components/dashboard/section-card'
import { getCurrentBarberDashboard } from '@/services/dashboard'

export default async function ReviewsPage() {
  const { reviews } = await getCurrentBarberDashboard()

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-bold text-white">Avaliações</h1>
      <p className="mt-3 text-slate-300">Histórico real de reputação recebida pelo seu perfil.</p>

      <div className="mt-10">
        <SectionCard title="Histórico de reviews" description="Apenas quem participou da relação profissional deve poder avaliar no produto final.">
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-white">{review.author}</h2>
                      <p className="mt-1 text-sm text-slate-500">{new Date(review.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className="text-sm font-semibold text-amber-300">{review.rating}/5</span>
                  </div>
                  {review.comment ? <p className="mt-3 text-slate-300">{review.comment}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem reviews ainda" description="Sua reputação aparecerá aqui quando as primeiras avaliações forem registradas." />
          )}
        </SectionCard>
      </div>
    </main>
  )
}

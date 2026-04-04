import { portfolioItems, reviewRows } from '@/services/mock-data'

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <p className="text-sm text-slate-400">Perfil público</p>
        <h1 className="mt-2 text-4xl font-bold text-white">@{username}</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Página pública preparada para exibir barbeiro ou barbearia, com SEO, portfólio, reputação e botões de contato.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
          <h2 className="text-2xl font-semibold text-white">Portfólio em destaque</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {portfolioItems.slice(0, 2).map((item) => (
              <div key={item.id} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70">
                <img src={item.image_url} alt={item.title} className="h-64 w-full object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
          <h2 className="text-2xl font-semibold text-white">Reputação</h2>
          <div className="mt-6 space-y-4">
            {reviewRows.slice(0, 2).map((review) => (
              <div key={review.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-white">{review.author}</h3>
                  <span className="text-sm font-semibold text-amber-300">{review.rating}/5</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{review.comment}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3">
            <button className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950">Chamar no WhatsApp</button>
            <button className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-white">Ver disponibilidade</button>
          </div>
        </section>
      </div>
    </main>
  )
}

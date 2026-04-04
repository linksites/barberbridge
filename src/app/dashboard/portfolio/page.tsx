import { SectionCard } from '@/components/dashboard/section-card'
import { portfolioItems } from '@/services/mock-data'

export default function PortfolioPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Portfólio</h1>
          <p className="mt-3 text-slate-300">Tela pronta para integrar com Supabase Storage e ordenar trabalhos por categoria.</p>
        </div>
        <button className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950">Adicionar item</button>
      </div>

      <div className="mt-10">
        <SectionCard title="Galeria de trabalhos" description="Cada item pode virar card público no perfil do barbeiro.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {portfolioItems.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70">
                <img src={item.image_url} alt={item.title} className="h-64 w-full object-cover" />
                <div className="p-4">
                  <h2 className="font-semibold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  )
}

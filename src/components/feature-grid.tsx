const features = [
  {
    title: 'Perfis profissionais',
    description: 'Barbeiros exibem especialidades, portfólio e disponibilidade.'
  },
  {
    title: 'Vagas e diárias',
    description: 'Barbearias publicam oportunidades fixas, temporárias e freelancer.'
  },
  {
    title: 'Candidaturas organizadas',
    description: 'Fluxo claro para acompanhar enviados, aceitos, recusados e contratados.'
  },
  {
    title: 'Evolução para gestão',
    description: 'Base pronta para agenda, comissão, avaliações e planos pagos.'
  }
]

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-3xl font-bold text-white">MVP pronto para validar mercado real</h2>
        <p className="mt-3 text-slate-300">
          Estrutura pensada para lançar rápido e crescer sem refazer tudo depois.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const items = [
  { label: 'Foco inicial', value: 'MVP local' },
  { label: 'Públicos', value: 'Barbeiro + Barbearia' },
  { label: 'Modelo', value: 'Marketplace + SaaS' },
  { label: 'Stack', value: 'Next + Supabase' }
]

export function StatsStrip() {
  return (
    <section className="border-y border-slate-800 bg-slate-950/60">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-8 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

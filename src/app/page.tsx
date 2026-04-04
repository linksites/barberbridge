import Link from 'next/link'
import { FeatureGrid } from '@/components/feature-grid'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'
import { SiteHeader } from '@/components/site-header'
import { StatsStrip } from '@/components/stats-strip'
import { JobCard } from '@/components/job-card'
import { getOpenJobs } from '@/services/jobs'

export default async function HomePage() {
  const jobs = await getOpenJobs()

  return (
    <main>
      <SiteHeader />
      <Hero />
      <StatsStrip />
      <FeatureGrid />

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Vagas em destaque</h2>
            <p className="mt-2 text-slate-300">Conexoes reais para validar o marketplace desde o comeco.</p>
          </div>
          <Link href="/jobs" className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white">
            Ver todas as vagas
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {jobs.length > 0 ? (
            jobs.slice(0, 6).map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-700 p-8 text-slate-400">
              Cadastre vagas no Supabase e elas aparecerao aqui.
            </div>
          )}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Como navegar no produto</h2>
          <p className="mt-2 max-w-3xl text-slate-300">
            Visitante explora vagas, escolhe o perfil e segue para login. Barbeiro entra para acompanhar vagas,
            candidaturas e convites. Barbearia entra para publicar vagas e operar o funil de contratação.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  )
}

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
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Vagas em destaque</h2>
            <p className="mt-2 text-slate-300">Conexões reais para validar o marketplace desde o começo.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {jobs.length > 0 ? (
            jobs.slice(0, 6).map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-700 p-8 text-slate-400">
              Cadastre vagas no Supabase e elas aparecerão aqui.
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}

import { Footer } from '@/components/footer'
import { JobCard } from '@/components/job-card'
import { SiteHeader } from '@/components/site-header'
import { getOpenJobs } from '@/services/jobs'

export default async function JobsPage() {
  const jobs = await getOpenJobs()

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-bold text-white">Vagas abertas</h1>
        <p className="mt-3 text-slate-300">Listagem inicial para o marketplace.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-700 p-8 text-slate-400">
              Nenhuma vaga cadastrada ainda.
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}

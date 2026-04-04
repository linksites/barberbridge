import Link from 'next/link'
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Vagas abertas</h1>
            <p className="mt-3 text-slate-300">
              Explore vagas e siga para cadastro quando encontrar uma oportunidade aderente.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register?role=barber" className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950">
              Criar conta como barbeiro
            </Link>
            <Link href="/register?role=shop" className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white">
              Publicar vaga
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-700 p-8 text-slate-400">
              Nenhuma vaga cadastrada ainda.
            </div>
          )}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Proximo passo</h2>
          <p className="mt-2 max-w-2xl text-slate-300">
            Se você é barbeiro, crie sua conta para concluir o onboarding e acompanhar candidaturas. Se você é
            barbearia, entre para publicar vagas e organizar sua operação.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  )
}

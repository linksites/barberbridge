import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { Footer } from '@/components/footer'
import { currency } from '@/lib/utils'
import { getJobById } from '@/services/jobs'

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await getJobById(id)

  if (!job) {
    notFound()
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-soft">
          <p className="text-sm text-slate-400">{job.shop_name ?? 'Barbearia parceira'}</p>
          <h1 className="mt-2 text-4xl font-bold text-white">{job.title}</h1>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-slate-700 px-3 py-1">{job.city}</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">{job.work_type}</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">{job.payment_model}</span>
          </div>
          <p className="mt-6 text-lg leading-8 text-slate-300">{job.description}</p>
          <p className="mt-6 text-2xl font-semibold text-sky-300">{currency(job.amount)}</p>
          <button className="mt-8 rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950">
            Candidatar-se
          </button>
        </div>
      </section>
      <Footer />
    </main>
  )
}

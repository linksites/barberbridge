import Link from 'next/link'
import { currency } from '@/lib/utils'

interface JobCardProps {
  job: {
    id: string
    title: string
    city: string
    amount: number
    payment_model: string
    shop_name?: string | null
  }
}

export function JobCard({ job }: JobCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-soft">
      <p className="text-sm text-slate-400">{job.shop_name ?? 'Barbearia parceira'}</p>
      <h3 className="mt-2 text-xl font-semibold text-white">{job.title}</h3>
      <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-300">
        <span className="rounded-full border border-slate-700 px-3 py-1">{job.city}</span>
        <span className="rounded-full border border-slate-700 px-3 py-1">{job.payment_model}</span>
      </div>
      <p className="mt-4 text-lg font-semibold text-sky-300">{currency(job.amount)}</p>
      <Link href={`/job/${job.id}`} className="mt-5 inline-flex rounded-xl bg-sky-500 px-4 py-2 font-medium text-slate-950">
        Ver vaga
      </Link>
    </div>
  )
}

import { ReactNode } from 'react'

export function StatCard({ title, value, helper, icon }: { title: string; value: string; helper?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          {helper ? <p className="mt-2 text-sm text-slate-400">{helper}</p> : null}
        </div>
        {icon ? <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-3 text-sky-300">{icon}</div> : null}
      </div>
    </div>
  )
}

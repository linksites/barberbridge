import { ReactNode } from 'react'

export function SectionCard({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-soft">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  )
}

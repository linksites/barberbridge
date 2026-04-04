export function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-300">
      {label}
    </span>
  )
}

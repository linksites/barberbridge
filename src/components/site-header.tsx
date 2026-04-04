import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold tracking-wide text-white">
          Barber<span className="text-sky-400">Bridge</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-slate-300">
          <Link href="/jobs">Vagas</Link>
          <Link href="/pricing">Planos</Link>
          <Link href="/login">Entrar</Link>
          <Link
            href="/register"
            className="rounded-xl bg-sky-500 px-4 py-2 font-medium text-slate-950"
          >
            Criar conta
          </Link>
        </nav>
      </div>
    </header>
  )
}

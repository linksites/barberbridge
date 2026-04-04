import Link from 'next/link'

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
      <div>
        <span className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-300">
          Ponte entre talento e oportunidade
        </span>
        <h1 className="mt-6 text-4xl font-bold leading-tight text-white lg:text-6xl">
          Conecte barbeiros e barbearias em um só ecossistema.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-slate-300">
          Publique vagas, encontre profissionais, organize candidaturas e transforme contratações informais em um fluxo profissional.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/register?role=barber" className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950">
            Sou barbeiro
          </Link>
          <Link href="/register?role=shop" className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-white">
            Sou barbearia
          </Link>
          <Link href="/jobs" className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-white">
            Explorar vagas
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Primeiro explore o mercado. Depois escolha seu perfil e siga para o dashboard certo.
        </p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-soft">
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">Barbearia</p>
            <h3 className="mt-2 text-lg font-semibold">Publicar vaga de barbeiro freelancer</h3>
            <p className="mt-2 text-sm text-slate-400">Belém • diária • comissão + fixo</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">Barbeiro</p>
            <h3 className="mt-2 text-lg font-semibold">Portfólio, agenda e disponibilidade</h3>
            <p className="mt-2 text-sm text-slate-400">Fade • navalhado • barba premium</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">Operação</p>
            <h3 className="mt-2 text-lg font-semibold">Candidaturas, matching e histórico</h3>
            <p className="mt-2 text-sm text-slate-400">Tudo preparado para evoluir para um SaaS completo</p>
          </div>
        </div>
      </div>
    </section>
  )
}

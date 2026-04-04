import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getInitials } from '@/lib/public-profiles'
import { getPublicProfileByUsername } from '@/services/profiles'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(amount)
}

function buildInstagramLink(handle: string | null) {
  if (!handle) {
    return null
  }

  const sanitizedHandle = handle.replace(/^@/, '').trim()
  return sanitizedHandle ? `https://instagram.com/${sanitizedHandle}` : null
}

function buildWhatsappLink(phone: string | null) {
  if (!phone) {
    return null
  }

  const sanitizedPhone = phone.replace(/\D/g, '')
  return sanitizedPhone ? `https://wa.me/${sanitizedPhone}` : null
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const profile = await getPublicProfileByUsername(username)

  if (!profile) {
    notFound()
  }

  const instagramLink = buildInstagramLink(profile.instagram)
  const whatsappLink = buildWhatsappLink(profile.whatsapp)

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`Foto de ${profile.display_name}`}
                className="h-28 w-28 rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-slate-800 text-3xl font-semibold text-white">
                {getInitials(profile.display_name)}
              </div>
            )}

            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">
                {profile.role === 'barber' ? 'Perfil de barbeiro' : 'Perfil de barbearia'}
              </p>
              <h1 className="mt-2 text-4xl font-bold text-white">{profile.display_name}</h1>
              <p className="mt-2 text-slate-300">@{profile.username}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                {profile.city || profile.state ? (
                  <span className="rounded-full border border-slate-700 px-3 py-1">
                    {[profile.city, profile.state].filter(Boolean).join(', ')}
                  </span>
                ) : null}
                <span className="rounded-full border border-slate-700 px-3 py-1">
                  Nota {profile.average_rating.toFixed(1)}
                </span>
                {profile.is_verified ? (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                    Perfil verificado
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:min-w-56">
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-sky-500 px-5 py-3 text-center font-semibold text-slate-950"
              >
                Chamar no WhatsApp
              </a>
            ) : null}
            {instagramLink ? (
              <a
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-slate-700 px-5 py-3 text-center font-semibold text-white"
              >
                Ver Instagram
              </a>
            ) : null}
            <Link href="/jobs" className="rounded-2xl border border-slate-700 px-5 py-3 text-center font-semibold text-white">
              Explorar vagas
            </Link>
          </div>
        </div>

        {profile.bio ? <p className="mt-6 max-w-3xl text-slate-300">{profile.bio}</p> : null}
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
          {profile.role === 'barber' ? (
            <>
              <h2 className="text-2xl font-semibold text-white">Especialidades e portfólio</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {profile.specialties.length > 0 ? (
                  profile.specialties.map((specialty) => (
                    <span key={specialty} className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
                      {specialty}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400">As especialidades ainda não foram cadastradas.</p>
                )}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {profile.portfolio_items.length > 0 ? (
                  profile.portfolio_items.map((item) => (
                    <div key={item.id} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70">
                      <img src={item.image_url} alt={item.title ?? 'Portfólio'} className="h-64 w-full object-cover" />
                      <div className="p-4">
                        <h3 className="font-semibold text-white">{item.title ?? 'Trabalho publicado'}</h3>
                        {item.description ? <p className="mt-2 text-sm text-slate-400">{item.description}</p> : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-700 p-6 text-slate-400">
                    Este barbeiro ainda não publicou itens de portfólio.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-white">Vagas publicadas</h2>
              <div className="mt-6 grid gap-4">
                {profile.open_jobs.length > 0 ? (
                  profile.open_jobs.map((job) => (
                    <article key={job.id} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                          <p className="mt-2 text-sm text-slate-400">
                            {job.city} - {job.work_type} - {job.payment_model}
                          </p>
                        </div>
                        <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
                          {formatCurrency(job.amount)}
                        </span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-700 p-6 text-slate-400">
                    Esta barbearia ainda não publicou vagas abertas.
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
          <h2 className="text-2xl font-semibold text-white">Reputação</h2>
          <div className="mt-6 space-y-4">
            {profile.reviews.length > 0 ? (
              profile.reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-white">{review.author_name}</h3>
                    <span className="text-sm font-semibold text-amber-300">{review.rating}/5</span>
                  </div>
                  {review.comment ? <p className="mt-2 text-sm text-slate-300">{review.comment}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-slate-400">Ainda não há avaliações públicas para este perfil.</p>
            )}
          </div>

          <div className="mt-6 grid gap-3 text-sm text-slate-300">
            {profile.role === 'barber' ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                Status atual: {profile.availability_status}
              </div>
            ) : null}
            {profile.role === 'shop' && profile.neighborhood ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                Bairro: {profile.neighborhood}
              </div>
            ) : null}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              Link público: {profile.public_path}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

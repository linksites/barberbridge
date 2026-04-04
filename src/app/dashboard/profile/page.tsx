import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/dashboard/profile-form'
import { getCurrentProfileSettings } from '@/services/dashboard'

export default async function ProfileSettingsPage() {
  const profileSettings = await getCurrentProfileSettings()

  if (!profileSettings) {
    redirect('/onboarding')
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold text-white">Perfil e configurações</h1>
      <p className="mt-3 text-slate-300">
        Edite seus dados públicos, links e informações operacionais em uma área persistida no Supabase.
      </p>
      {profileSettings.publicProfilePath ? (
        <div className="mt-4">
          <a
            href={profileSettings.publicProfilePath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Ver perfil público
          </a>
        </div>
      ) : null}
      <div className="mt-8">
        <ProfileForm role={profileSettings.role} initialValues={profileSettings.initialValues} />
      </div>
    </main>
  )
}

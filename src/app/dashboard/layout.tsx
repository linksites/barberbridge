import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.role || (profile.role !== 'barber' && profile.role !== 'shop' && profile.role !== 'admin')) {
    return children
  }

  return (
    <>
      <DashboardNav role={profile.role} displayName={profile.full_name} />
      {children}
    </>
  )
}

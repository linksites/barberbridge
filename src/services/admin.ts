import { createClient } from '@/lib/supabase/server'

type AdminCounts = {
  users: number
  jobs: number
  applications: number
  invitations: number
}

type RecentUser = {
  id: string
  full_name: string | null
  role: string
  city: string | null
  username: string | null
  created_at: string
}

type RecentJob = {
  id: string
  title: string
  city: string
  status: string
  created_at: string
  shop_id: string | null
}

export async function getCurrentAdminDashboard() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    return null
  }

  const [
    usersCountResult,
    jobsCountResult,
    applicationsCountResult,
    invitationsCountResult,
    recentUsersResult,
    recentJobsResult
  ] = await Promise.all([
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('job_applications').select('*', { count: 'exact', head: true }),
    supabase.from('invitations').select('*', { count: 'exact', head: true }),
    supabase
      .from('user_profiles')
      .select('id, full_name, role, city, username, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('jobs')
      .select('id, title, city, status, created_at, shop_id')
      .order('created_at', { ascending: false })
      .limit(6)
  ])

  const counts: AdminCounts = {
    users: usersCountResult.count ?? 0,
    jobs: jobsCountResult.count ?? 0,
    applications: applicationsCountResult.count ?? 0,
    invitations: invitationsCountResult.count ?? 0
  }

  return {
    profile,
    counts,
    recentUsers: (recentUsersResult.data ?? []) as RecentUser[],
    recentJobs: (recentJobsResult.data ?? []) as RecentJob[]
  }
}

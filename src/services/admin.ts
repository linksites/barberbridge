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

type ShopOption = {
  id: string
  shop_name: string
  city: string | null
}

type RecentJobRow = {
  id: string
  title: string
  description: string
  city: string
  state: string | null
  neighborhood: string | null
  status: string
  amount: number
  payment_model: string
  work_type: string
  created_at: string
  shop_id: string | null
}

type RecentJob = RecentJobRow & {
  shop_name: string | null
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
    recentJobsResult,
    shopsResult
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
      .select('id, title, description, city, state, neighborhood, status, amount, payment_model, work_type, created_at, shop_id')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('shop_profiles')
      .select('id, shop_name, city')
      .order('shop_name', { ascending: true })
  ])

  const shops = (shopsResult.data ?? []) as ShopOption[]
  const shopsById = new Map(shops.map((shop) => [shop.id, shop.shop_name]))
  const recentJobs = ((recentJobsResult.data ?? []) as RecentJobRow[]).map((job) => ({
    ...job,
    shop_name: job.shop_id ? shopsById.get(job.shop_id) ?? null : null
  }))

  const counts: AdminCounts = {
    users: usersCountResult.count ?? 0,
    jobs: jobsCountResult.count ?? 0,
    applications: applicationsCountResult.count ?? 0,
    invitations: invitationsCountResult.count ?? 0
  }

  return {
    profile,
    counts,
    shops,
    recentUsers: (recentUsersResult.data ?? []) as RecentUser[],
    recentJobs: recentJobs as RecentJob[]
  }
}

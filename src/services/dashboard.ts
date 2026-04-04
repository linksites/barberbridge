import { createClient } from '@/lib/supabase/server'
import { buildPublicProfilePath } from '@/lib/public-profiles'

type JobSummary = {
  id: string
  title: string
  city: string
  amount: number
  payment_model: string
  shop_name: string | null
}

type ApplicationSummary = {
  id: string
  status: string
  created_at: string
  message: string | null
  job: JobSummary | null
}

type ReviewSummary = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  author: string
}

type InvitationSummary = {
  id: string
  status: string
  message: string | null
  created_at: string
  shop_name: string
  city: string | null
  role: string
}

export async function getCurrentBarberDashboard() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      profile: null,
      applications: [] as ApplicationSummary[],
      reviews: [] as ReviewSummary[],
      invitations: [] as InvitationSummary[]
    }
  }

  const { data: profile } = await supabase
    .from('barber_profiles')
    .select('id, full_name, city, state, bio, specialties, availability_status, average_rating, instagram, whatsapp')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    return {
      profile: null,
      applications: [] as ApplicationSummary[],
      reviews: [] as ReviewSummary[],
      invitations: [] as InvitationSummary[]
    }
  }

  const { data: applicationRows, error: applicationError } = await supabase
    .from('job_applications')
    .select('id, job_id, status, created_at, message')
    .eq('barber_id', profile.id)
    .order('created_at', { ascending: false })

  const applicationsSource = applicationError ? [] : applicationRows ?? []
  const jobIds = applicationsSource.map((item) => item.job_id)

  let jobsById = new Map<string, JobSummary>()

  if (jobIds.length > 0) {
    const { data: jobs } = await supabase
      .from('jobs_with_shop')
      .select('id, title, city, amount, payment_model, shop_name')
      .in('id', jobIds)

    jobsById = new Map((jobs ?? []).map((job) => [job.id, job]))
  }

  const applications = applicationsSource.map((item) => ({
    id: item.id,
    status: item.status,
    created_at: item.created_at,
    message: item.message,
    job: jobsById.get(item.job_id) ?? null
  }))

  const { data: invitationRows, error: invitationError } = await supabase
    .from('invitations')
    .select('id, shop_id, job_id, status, message, created_at')
    .eq('barber_id', profile.id)
    .order('created_at', { ascending: false })

  const invitationsSource = invitationError ? [] : invitationRows ?? []
  const invitationShopIds = Array.from(new Set(invitationsSource.map((item) => item.shop_id)))
  const invitationJobIds = invitationsSource
    .map((item) => item.job_id)
    .filter((item): item is string => Boolean(item))

  let invitationShopsById = new Map<string, { shop_name: string; city: string | null }>()
  let invitationJobsById = new Map<string, { title: string; city: string }>()

  if (invitationShopIds.length > 0) {
    const { data: invitationShops } = await supabase
      .from('shop_profiles')
      .select('id, shop_name, city')
      .in('id', invitationShopIds)

    invitationShopsById = new Map(
      (invitationShops ?? []).map((shop) => [shop.id, { shop_name: shop.shop_name, city: shop.city }])
    )
  }

  if (invitationJobIds.length > 0) {
    const { data: invitationJobs } = await supabase
      .from('jobs')
      .select('id, title, city')
      .in('id', invitationJobIds)

    invitationJobsById = new Map(
      (invitationJobs ?? []).map((job) => [job.id, { title: job.title, city: job.city }])
    )
  }

  const invitations = invitationsSource.map((item) => {
    const shop = invitationShopsById.get(item.shop_id)
    const job = item.job_id ? invitationJobsById.get(item.job_id) : null

    return {
      id: item.id,
      status: item.status,
      message: item.message,
      created_at: item.created_at,
      shop_name: shop?.shop_name ?? 'Barbearia',
      city: job?.city ?? shop?.city ?? null,
      role: job?.title ?? 'Convite direto'
    }
  })

  const { data: reviewRows } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, reviewer_user_id')
    .eq('reviewed_user_id', user.id)
    .order('created_at', { ascending: false })

  const reviewerIds = Array.from(new Set((reviewRows ?? []).map((item) => item.reviewer_user_id)))
  let reviewerNames = new Map<string, string>()

  if (reviewerIds.length > 0) {
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .in('id', reviewerIds)

    reviewerNames = new Map((userProfiles ?? []).map((item) => [item.id, item.full_name ?? 'Usuário']))
  }

  const reviews = (reviewRows ?? []).map((item) => ({
    id: item.id,
    rating: item.rating,
    comment: item.comment,
    created_at: item.created_at,
    author: reviewerNames.get(item.reviewer_user_id) ?? 'Usuário'
  }))

  return {
    profile,
    applications,
    reviews,
    invitations
  }
}

export async function getCurrentProfileSettings() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role, full_name, city, state, phone, username, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  if (!userProfile) {
    return null
  }

  if (userProfile.role === 'shop') {
    const { data: shopProfile } = await supabase
      .from('shop_profiles')
      .select('description, instagram, neighborhood')
      .eq('user_id', user.id)
      .maybeSingle()

    return {
      role: 'shop' as const,
      publicProfilePath: userProfile.username ? buildPublicProfilePath(userProfile.username) : null,
      initialValues: {
        full_name: userProfile.full_name ?? '',
        username: userProfile.username ?? '',
        avatar_url: userProfile.avatar_url ?? '',
        city: userProfile.city ?? '',
        state: userProfile.state ?? '',
        phone: userProfile.phone ?? '',
        instagram: shopProfile?.instagram ?? '',
        bio: shopProfile?.description ?? '',
        neighborhood: shopProfile?.neighborhood ?? '',
        specialties: '',
        availability_status: 'available'
      }
    }
  }

  const { data: barberProfile } = await supabase
    .from('barber_profiles')
    .select('bio, instagram, neighborhood, specialties, availability_status')
    .eq('user_id', user.id)
    .maybeSingle()

  return {
    role: 'barber' as const,
    publicProfilePath: userProfile.username ? buildPublicProfilePath(userProfile.username) : null,
    initialValues: {
      full_name: userProfile.full_name ?? '',
      username: userProfile.username ?? '',
      avatar_url: userProfile.avatar_url ?? '',
      city: userProfile.city ?? '',
      state: userProfile.state ?? '',
      phone: userProfile.phone ?? '',
      instagram: barberProfile?.instagram ?? '',
      bio: barberProfile?.bio ?? '',
      neighborhood: barberProfile?.neighborhood ?? '',
      specialties: (barberProfile?.specialties ?? []).join(', '),
      availability_status: barberProfile?.availability_status ?? 'available'
    }
  }
}

import { createClient } from '@/lib/supabase/server'
import { buildPublicProfilePath, normalizeUsername } from '@/lib/public-profiles'

type PublicReview = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  author_name: string
}

type PublicBarberProfile = {
  role: 'barber'
  username: string
  public_path: string
  display_name: string
  avatar_url: string | null
  city: string | null
  state: string | null
  bio: string | null
  instagram: string | null
  whatsapp: string | null
  specialties: string[]
  availability_status: string
  average_rating: number
  is_verified: boolean
  portfolio_items: Array<{
    id: string
    image_url: string
    title: string | null
    description: string | null
  }>
  reviews: PublicReview[]
}

type PublicShopProfile = {
  role: 'shop'
  username: string
  public_path: string
  display_name: string
  avatar_url: string | null
  city: string | null
  state: string | null
  bio: string | null
  instagram: string | null
  whatsapp: string | null
  neighborhood: string | null
  average_rating: number
  is_verified: boolean
  open_jobs: Array<{
    id: string
    title: string
    city: string
    amount: number
    payment_model: string
    work_type: string
    status: string
  }>
  reviews: PublicReview[]
}

export type PublicProfile = PublicBarberProfile | PublicShopProfile

async function getPublicReviews(reviewedUserId: string) {
  const supabase = await createClient()
  const { data: reviewRows } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, reviewer_user_id')
    .eq('reviewed_user_id', reviewedUserId)
    .order('created_at', { ascending: false })
    .limit(8)

  const reviewerIds = Array.from(new Set((reviewRows ?? []).map((item) => item.reviewer_user_id)))
  let authorNames = new Map<string, string>()

  if (reviewerIds.length > 0) {
    const { data: reviewerProfiles } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .in('id', reviewerIds)

    authorNames = new Map((reviewerProfiles ?? []).map((item) => [item.id, item.full_name ?? 'Usuario']))
  }

  return (reviewRows ?? []).map((item) => ({
    id: item.id,
    rating: item.rating,
    comment: item.comment,
    created_at: item.created_at,
    author_name: authorNames.get(item.reviewer_user_id) ?? 'Usuario'
  }))
}

export async function getFeaturedBarbers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('barber_profiles')
    .select('id, user_id, full_name, city, specialties, availability_status, average_rating')
    .order('average_rating', { ascending: false })
    .limit(6)

  if (error) {
    console.error(error)
    return []
  }

  const userIds = (data ?? []).map((item) => item.user_id)
  let publicProfileShell = new Map<string, { username: string | null; avatar_url: string | null }>()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)

    publicProfileShell = new Map(
      (profiles ?? []).map((item) => [item.id, { username: item.username ?? null, avatar_url: item.avatar_url ?? null }])
    )
  }

  return (data ?? []).map((item) => ({
    ...item,
    username: publicProfileShell.get(item.user_id)?.username ?? null,
    avatar_url: publicProfileShell.get(item.user_id)?.avatar_url ?? null
  }))
}

export async function getPublicProfileByUsername(rawUsername: string): Promise<PublicProfile | null> {
  const supabase = await createClient()
  const username = normalizeUsername(rawUsername)

  if (!username) {
    return null
  }

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('id, role, username, full_name, city, state, avatar_url')
    .eq('username', username)
    .maybeSingle()

  if (!userProfile?.username || (userProfile.role !== 'barber' && userProfile.role !== 'shop')) {
    return null
  }

  const reviews = await getPublicReviews(userProfile.id)

  if (userProfile.role === 'barber') {
    const { data: barberProfile } = await supabase
      .from('barber_profiles')
      .select(
        'id, full_name, bio, city, state, instagram, whatsapp, specialties, availability_status, average_rating, is_verified'
      )
      .eq('user_id', userProfile.id)
      .maybeSingle()

    if (!barberProfile) {
      return null
    }

    const { data: portfolioItems } = await supabase
      .from('barber_portfolio_items')
      .select('id, image_url, title, description')
      .eq('barber_profile_id', barberProfile.id)
      .order('created_at', { ascending: false })
      .limit(6)

    return {
      role: 'barber',
      username: userProfile.username,
      public_path: buildPublicProfilePath(userProfile.username),
      display_name: barberProfile.full_name || userProfile.full_name || userProfile.username,
      avatar_url: userProfile.avatar_url,
      city: barberProfile.city || userProfile.city,
      state: barberProfile.state || userProfile.state,
      bio: barberProfile.bio,
      instagram: barberProfile.instagram,
      whatsapp: barberProfile.whatsapp,
      specialties: barberProfile.specialties ?? [],
      availability_status: barberProfile.availability_status,
      average_rating: Number(barberProfile.average_rating ?? 0),
      is_verified: barberProfile.is_verified,
      portfolio_items: portfolioItems ?? [],
      reviews
    }
  }

  const { data: shopProfile } = await supabase
    .from('shop_profiles')
    .select('id, shop_name, description, city, state, neighborhood, instagram, whatsapp, average_rating, is_verified')
    .eq('user_id', userProfile.id)
    .maybeSingle()

  if (!shopProfile) {
    return null
  }

  const { data: openJobs } = await supabase
    .from('jobs')
    .select('id, title, city, amount, payment_model, work_type, status')
    .eq('shop_id', shopProfile.id)
    .order('created_at', { ascending: false })
    .limit(6)

  return {
    role: 'shop',
    username: userProfile.username,
    public_path: buildPublicProfilePath(userProfile.username),
    display_name: shopProfile.shop_name || userProfile.full_name || userProfile.username,
    avatar_url: userProfile.avatar_url,
    city: shopProfile.city || userProfile.city,
    state: shopProfile.state || userProfile.state,
    bio: shopProfile.description,
    instagram: shopProfile.instagram,
    whatsapp: shopProfile.whatsapp,
    neighborhood: shopProfile.neighborhood,
    average_rating: Number(shopProfile.average_rating ?? 0),
    is_verified: shopProfile.is_verified,
    open_jobs: openJobs ?? [],
    reviews
  }
}

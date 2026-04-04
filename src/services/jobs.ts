import { createClient } from '@/lib/supabase/server'

export async function getOpenJobs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs_with_shop')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return data ?? []
}

export async function getJobById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs_with_shop')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data
}

export async function getCurrentShopJobs() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      shop: null,
      jobs: []
    }
  }

  const { data: shop } = await supabase
    .from('shop_profiles')
    .select('id, shop_name, city, state')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!shop) {
    return {
      shop: null,
      jobs: []
    }
  }

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, city, state, status, amount, payment_model, work_type, created_at')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return {
      shop,
      jobs: []
    }
  }

  return {
    shop,
    jobs: jobs ?? []
  }
}

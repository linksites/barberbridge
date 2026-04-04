import { createClient } from '@/lib/supabase/server'

export async function getFeaturedBarbers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('barber_profiles')
    .select('id, full_name, city, specialties, availability_status, average_rating')
    .order('average_rating', { ascending: false })
    .limit(6)

  if (error) {
    console.error(error)
    return []
  }

  return data ?? []
}

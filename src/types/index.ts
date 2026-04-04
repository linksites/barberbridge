export type UserRole = 'barber' | 'shop' | 'admin'

export interface Job {
  id: string
  title: string
  description: string
  city: string
  amount: number
  payment_model: string
  work_type: string
  status: 'open' | 'closed' | 'draft'
}

export interface BarberProfile {
  id: string
  full_name: string
  city: string
  bio: string | null
  specialties: string[]
  instagram: string | null
  whatsapp: string | null
  availability_status: string
}

export interface ShopProfile {
  id: string
  shop_name: string
  city: string
  neighborhood: string | null
  description: string | null
  instagram: string | null
  whatsapp: string | null
}

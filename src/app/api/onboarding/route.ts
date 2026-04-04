import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function parseSpecialties(value: unknown) {
  return asString(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Faça login antes de concluir o onboarding.'
      },
      { status: 401 }
    )
  }

  const body = await request.json()
  const role = body.role === 'shop' ? 'shop' : 'barber'
  const fullName = asString(body.full_name)
  const city = asString(body.city)
  const state = asString(body.state)
  const phone = asString(body.phone)
  const instagram = asString(body.instagram)
  const bio = asString(body.bio)
  const neighborhood = asString(body.neighborhood)
  const specialties = parseSpecialties(body.specialties)

  if (!fullName || !city) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Preencha pelo menos nome e cidade para continuar.'
      },
      { status: 400 }
    )
  }

  const { error: userProfileError } = await supabase.from('user_profiles').upsert(
    {
      id: user.id,
      role,
      full_name: fullName,
      phone,
      city,
      state
    },
    { onConflict: 'id' }
  )

  if (userProfileError) {
    return NextResponse.json(
      {
        ok: false,
        message: userProfileError.message
      },
      { status: 500 }
    )
  }

  if (role === 'barber') {
    const { error } = await supabase.from('barber_profiles').upsert(
      {
        user_id: user.id,
        full_name: fullName,
        bio: bio || null,
        city,
        state: state || null,
        neighborhood: neighborhood || null,
        specialties,
        instagram: instagram || null,
        whatsapp: phone || null
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message
        },
        { status: 500 }
      )
    }
  } else {
    const { error } = await supabase.from('shop_profiles').upsert(
      {
        user_id: user.id,
        shop_name: fullName,
        description: bio || null,
        city,
        state: state || null,
        neighborhood: neighborhood || null,
        instagram: instagram || null,
        whatsapp: phone || null
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message
        },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    ok: true,
    message: `Onboarding salvo para o perfil ${role === 'shop' ? 'barbearia' : 'barbeiro'}.`,
    redirectTo: `/dashboard/${role}`
  })
}

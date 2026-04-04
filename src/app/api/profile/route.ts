import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFallbackUsername, isValidHttpUrl, isValidUsername, normalizeUsername } from '@/lib/public-profiles'

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
        message: 'Faça login antes de atualizar o perfil.'
      },
      { status: 401 }
    )
  }

  const body = await request.json()
  const fullName = asString(body.full_name)
  const city = asString(body.city)
  const state = asString(body.state)
  const phone = asString(body.phone)
  const requestedUsername = normalizeUsername(asString(body.username))
  const avatarUrl = asString(body.avatar_url)
  const instagram = asString(body.instagram)
  const bio = asString(body.bio)
  const neighborhood = asString(body.neighborhood)
  const availabilityStatus = asString(body.availability_status) || 'available'
  const specialties = parseSpecialties(body.specialties)

  if (!fullName || !city) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Preencha pelo menos nome e cidade para salvar o perfil.'
      },
      { status: 400 }
    )
  }

  if (!requestedUsername || !isValidUsername(requestedUsername)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Escolha um username público com pelo menos 3 caracteres, usando letras, números e hífens.'
      },
      { status: 400 }
    )
  }

  if (avatarUrl && !isValidHttpUrl(avatarUrl)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'A foto precisa ser um link http ou https válido.'
      },
      { status: 400 }
    )
  }

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role, username')
    .eq('id', user.id)
    .maybeSingle()

  const role = userProfile?.role === 'shop' ? 'shop' : 'barber'
  const username = requestedUsername || userProfile?.username || createFallbackUsername(fullName || user.email || 'perfil', user.id)

  const { error: userProfileError } = await supabase.from('user_profiles').upsert(
    {
      id: user.id,
      role,
      full_name: fullName,
      username,
      avatar_url: avatarUrl || null,
      phone,
      city,
      state
    },
    { onConflict: 'id' }
  )

  if (userProfileError) {
    const isDuplicateUsername =
      userProfileError.code === '23505' || userProfileError.message.toLowerCase().includes('duplicate')

    return NextResponse.json(
      {
        ok: false,
        message: isDuplicateUsername ? 'Esse username já está em uso. Escolha outro para o perfil público.' : userProfileError.message
      },
      { status: isDuplicateUsername ? 409 : 500 }
    )
  }

  if (role === 'shop') {
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
  } else {
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
        whatsapp: phone || null,
        availability_status: availabilityStatus
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
    message: 'Perfil atualizado com sucesso.'
  })
}

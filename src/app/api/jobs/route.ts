import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asOptionalString(value: unknown) {
  const normalized = asString(value)
  return normalized || null
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
        message: 'Faca login antes de publicar uma vaga.'
      },
      { status: 401 }
    )
  }

  const body = await request.json()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role ?? null
  const isAdmin = role === 'admin'
  const isShop = role === 'shop'

  if (!isAdmin && !isShop) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Somente barbearias e admins podem publicar vagas.'
      },
      { status: 403 }
    )
  }

  const shopLookupColumn = isAdmin ? 'id' : 'user_id'
  const shopLookupValue = isAdmin ? asString(body.shop_id) : user.id

  if (isAdmin && !shopLookupValue) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Selecione a barbearia responsavel pela vaga.'
      },
      { status: 400 }
    )
  }

  const { data: shopProfile, error: shopError } = await supabase
    .from('shop_profiles')
    .select('id, shop_name')
    .eq(shopLookupColumn, shopLookupValue)
    .single()

  if (shopError || !shopProfile) {
    return NextResponse.json(
      {
        ok: false,
        message: isAdmin
          ? 'Selecione uma barbearia valida para publicar a vaga.'
          : 'Conclua o onboarding da barbearia antes de publicar vagas.'
      },
      { status: 400 }
    )
  }

  const title = asString(body.title)
  const description = asString(body.description)
  const city = asString(body.city)
  const state = asOptionalString(body.state)
  const neighborhood = asOptionalString(body.neighborhood)
  const workType = asString(body.work_type) || 'Freelancer'
  const paymentModel = asString(body.payment_model) || 'Diaria'
  const amount = Number(body.amount)

  if (!title || !description || !city) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Preencha titulo, descricao e cidade para publicar a vaga.'
      },
      { status: 400 }
    )
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Informe um valor valido para a vaga.'
      },
      { status: 400 }
    )
  }

  const jobsClient = isAdmin ? createAdminClient() : supabase
  const { data: job, error } = await jobsClient
    .from('jobs')
    .insert({
      shop_id: shopProfile.id,
      title,
      description,
      city,
      state,
      neighborhood,
      work_type: workType,
      payment_model: paymentModel,
      amount,
      status: 'open'
    })
    .select('id, title, city, amount, payment_model, work_type')
    .single()

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: `Vaga publicada com sucesso para ${shopProfile.shop_name}.`,
    job
  })
}

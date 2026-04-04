import { NextResponse } from 'next/server'
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
        message: 'Faça login antes de publicar uma vaga.'
      },
      { status: 401 }
    )
  }

  const { data: shopProfile, error: shopError } = await supabase
    .from('shop_profiles')
    .select('id, shop_name')
    .eq('user_id', user.id)
    .single()

  if (shopError || !shopProfile) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Conclua o onboarding da barbearia antes de publicar vagas.'
      },
      { status: 400 }
    )
  }

  const body = await request.json()
  const title = asString(body.title)
  const description = asString(body.description)
  const city = asString(body.city)
  const state = asOptionalString(body.state)
  const neighborhood = asOptionalString(body.neighborhood)
  const workType = asString(body.work_type) || 'Freelancer'
  const paymentModel = asString(body.payment_model) || 'Diária'
  const amount = Number(body.amount)

  if (!title || !description || !city) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Preencha título, descrição e cidade para publicar a vaga.'
      },
      { status: 400 }
    )
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Informe um valor válido para a vaga.'
      },
      { status: 400 }
    )
  }

  const { data: job, error } = await supabase
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

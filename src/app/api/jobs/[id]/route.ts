import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asOptionalString(value: unknown) {
  const normalized = asString(value)
  return normalized || null
}

async function getCurrentShop(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: shop } = await supabase
    .from('shop_profiles')
    .select('id, shop_name')
    .eq('user_id', user.id)
    .maybeSingle()

  return shop
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const shop = await getCurrentShop(supabase)

  if (!shop) {
    return NextResponse.json({ ok: false, message: 'Somente a barbearia dona da vaga pode editar esse registro.' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const title = asString(body.title)
  const description = asString(body.description)
  const city = asString(body.city)
  const state = asOptionalString(body.state)
  const neighborhood = asOptionalString(body.neighborhood)
  const workType = asString(body.work_type) || 'Freelancer'
  const paymentModel = asString(body.payment_model) || 'Diaria'
  const status = asString(body.status) || 'open'
  const amount = Number(body.amount)

  if (!title || !description || !city) {
    return NextResponse.json({ ok: false, message: 'Preencha título, descrição e cidade para salvar a vaga.' }, { status: 400 })
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, message: 'Informe um valor válido para a vaga.' }, { status: 400 })
  }

  if (!['draft', 'open', 'closed'].includes(status)) {
    return NextResponse.json({ ok: false, message: 'Status de vaga inválido.' }, { status: 400 })
  }

  const { data: existingJob } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', id)
    .eq('shop_id', shop.id)
    .maybeSingle()

  if (!existingJob) {
    return NextResponse.json({ ok: false, message: 'Vaga não encontrada para esta barbearia.' }, { status: 404 })
  }

  const { data: job, error } = await supabase
    .from('jobs')
    .update({
      title,
      description,
      city,
      state,
      neighborhood,
      work_type: workType,
      payment_model: paymentModel,
      amount,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('shop_id', shop.id)
    .select('id, title, city, amount, payment_model, work_type, status')
    .single()

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: 'Vaga atualizada com sucesso.', job })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const shop = await getCurrentShop(supabase)

  if (!shop) {
    return NextResponse.json({ ok: false, message: 'Somente a barbearia dona da vaga pode excluir esse registro.' }, { status: 401 })
  }

  const { id } = await params
  const { error } = await supabase.from('jobs').delete().eq('id', id).eq('shop_id', shop.id)

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: 'Vaga excluída com sucesso.' })
}

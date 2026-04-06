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

async function getCurrentActor(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    userId: user.id,
    role: profile?.role ?? null
  }
}

async function getCurrentShopByUserId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: shop } = await supabase
    .from('shop_profiles')
    .select('id, shop_name')
    .eq('user_id', userId)
    .maybeSingle()

  return shop
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const actor = await getCurrentActor(supabase)

  if (!actor) {
    return NextResponse.json({ ok: false, message: 'Faca login antes de editar uma vaga.' }, { status: 401 })
  }

  const isAdmin = actor.role === 'admin'

  if (!isAdmin && actor.role !== 'shop') {
    return NextResponse.json({ ok: false, message: 'Voce nao tem permissao para editar vagas.' }, { status: 403 })
  }

  const shop = isAdmin ? null : await getCurrentShopByUserId(supabase, actor.userId)

  if (!isAdmin && !shop) {
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
    return NextResponse.json({ ok: false, message: 'Preencha titulo, descricao e cidade para salvar a vaga.' }, { status: 400 })
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, message: 'Informe um valor valido para a vaga.' }, { status: 400 })
  }

  if (!['draft', 'open', 'closed'].includes(status)) {
    return NextResponse.json({ ok: false, message: 'Status de vaga invalido.' }, { status: 400 })
  }

  let existingJobQuery = supabase.from('jobs').select('id').eq('id', id)

  if (!isAdmin) {
    existingJobQuery = existingJobQuery.eq('shop_id', shop!.id)
  }

  const { data: existingJob } = await existingJobQuery.maybeSingle()

  if (!existingJob) {
    return NextResponse.json(
      { ok: false, message: isAdmin ? 'Vaga nao encontrada.' : 'Vaga nao encontrada para esta barbearia.' },
      { status: 404 }
    )
  }

  const jobsClient = isAdmin ? createAdminClient() : supabase
  let updateQuery = jobsClient
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
    .select('id, title, city, amount, payment_model, work_type, status')

  if (!isAdmin) {
    updateQuery = updateQuery.eq('shop_id', shop!.id)
  }

  const { data: job, error } = await updateQuery.single()

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
  const actor = await getCurrentActor(supabase)

  if (!actor) {
    return NextResponse.json({ ok: false, message: 'Faca login antes de excluir uma vaga.' }, { status: 401 })
  }

  const isAdmin = actor.role === 'admin'

  if (!isAdmin && actor.role !== 'shop') {
    return NextResponse.json({ ok: false, message: 'Voce nao tem permissao para excluir vagas.' }, { status: 403 })
  }

  const shop = isAdmin ? null : await getCurrentShopByUserId(supabase, actor.userId)

  if (!isAdmin && !shop) {
    return NextResponse.json({ ok: false, message: 'Somente a barbearia dona da vaga pode excluir esse registro.' }, { status: 401 })
  }

  const { id } = await params
  const jobsClient = isAdmin ? createAdminClient() : supabase
  let deleteQuery = jobsClient.from('jobs').delete().eq('id', id)

  if (!isAdmin) {
    deleteQuery = deleteQuery.eq('shop_id', shop!.id)
  }

  const { error } = await deleteQuery

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: 'Vaga excluida com sucesso.' })
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function asOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

async function getCurrentBarber(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: barber } = await supabase
    .from('barber_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  return barber
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const barber = await getCurrentBarber(supabase)

  if (!barber) {
    return NextResponse.json({ ok: false, message: 'Somente o barbeiro dono da candidatura pode editar esse registro.' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const message = asOptionalString(body.message)

  const { data: application } = await supabase
    .from('job_applications')
    .select('id, status')
    .eq('id', id)
    .eq('barber_id', barber.id)
    .maybeSingle()

  if (!application) {
    return NextResponse.json({ ok: false, message: 'Candidatura não encontrada para este barbeiro.' }, { status: 404 })
  }

  if (!['pending', 'viewed'].includes(application.status)) {
    return NextResponse.json({ ok: false, message: 'Só é possível editar candidaturas ainda em andamento.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('job_applications')
    .update({ message })
    .eq('id', id)
    .eq('barber_id', barber.id)

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: 'Candidatura atualizada com sucesso.' })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const barber = await getCurrentBarber(supabase)

  if (!barber) {
    return NextResponse.json({ ok: false, message: 'Somente o barbeiro dono da candidatura pode excluir esse registro.' }, { status: 401 })
  }

  const { id } = await params
  const { data: application } = await supabase
    .from('job_applications')
    .select('id, status')
    .eq('id', id)
    .eq('barber_id', barber.id)
    .maybeSingle()

  if (!application) {
    return NextResponse.json({ ok: false, message: 'Candidatura não encontrada para este barbeiro.' }, { status: 404 })
  }

  if (!['pending', 'viewed'].includes(application.status)) {
    return NextResponse.json({ ok: false, message: 'Só é possível excluir candidaturas ainda em andamento.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('id', id)
    .eq('barber_id', barber.id)

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  }

    return NextResponse.json({ ok: true, message: 'Candidatura excluída com sucesso.' })
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Faça login antes de atualizar convites.'
      },
      { status: 401 }
    )
  }

  const body = await request.json()
  const nextStatus =
    body.status === 'accepted' || body.status === 'declined' || body.status === 'viewed'
      ? body.status
      : null

  if (!nextStatus) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Status de convite inválido.'
      },
      { status: 400 }
    )
  }

  const { data: barberProfile } = await supabase
    .from('barber_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!barberProfile) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Perfil de barbeiro não encontrado.'
      },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('invitations')
    .update({ status: nextStatus })
    .eq('id', id)
    .eq('barber_id', barberProfile.id)

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
    message: 'Convite atualizado com sucesso.'
  })
}

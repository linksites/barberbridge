import { NextResponse } from 'next/server'
import { extractAvatarObjectPath } from '@/lib/profile-avatars'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Faca login antes de excluir a conta.'
      },
      { status: 401 }
    )
  }

  let adminClient

  try {
    adminClient = createAdminClient()
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: 'A exclusao de conta nao esta configurada no servidor.'
      },
      { status: 500 }
    )
  }

  const { data: userProfile, error: profileError } = await adminClient
    .from('user_profiles')
    .select('role, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json(
      {
        ok: false,
        message: profileError.message
      },
      { status: 500 }
    )
  }

  if (userProfile?.role === 'shop') {
    const { data: shopProfile, error: shopProfileError } = await adminClient
      .from('shop_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (shopProfileError) {
      return NextResponse.json(
        {
          ok: false,
          message: shopProfileError.message
        },
        { status: 500 }
      )
    }

    if (shopProfile?.id) {
      const { error: jobsDeleteError } = await adminClient.from('jobs').delete().eq('shop_id', shopProfile.id)

      if (jobsDeleteError) {
        return NextResponse.json(
          {
            ok: false,
            message: jobsDeleteError.message
          },
          { status: 500 }
        )
      }
    }
  }

  const avatarObjectPath = extractAvatarObjectPath(userProfile?.avatar_url)

  if (avatarObjectPath) {
    await adminClient.storage.from('profile-avatars').remove([avatarObjectPath])
  }

  if (user.email) {
    await adminClient.from('admin_emails').delete().eq('email', user.email)
  }

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user.id)

  if (deleteUserError) {
    return NextResponse.json(
      {
        ok: false,
        message: deleteUserError.message
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: 'Conta excluida com sucesso.'
  })
}

import type { EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function normalizeLocalPath(path: string | null) {
  if (!path) {
    return '/onboarding'
  }

  let normalized = path

  for (let index = 0; index < 2; index += 1) {
    try {
      const decoded = decodeURIComponent(normalized)

      if (decoded === normalized) {
        break
      }

      normalized = decoded
    } catch {
      break
    }
  }

  if (!normalized.startsWith('/')) {
    return '/onboarding'
  }

  return normalized
}

function getSafeRedirectTarget(request: NextRequest, redirectTo: string | null, next: string | null) {
  if (redirectTo) {
    try {
      const url = redirectTo.startsWith('/')
        ? new URL(redirectTo, request.nextUrl.origin)
        : new URL(redirectTo)

      if (url.origin === request.nextUrl.origin) {
        if (url.pathname === '/auth/confirm') {
          return normalizeLocalPath(url.searchParams.get('next'))
        }

        return `${url.pathname}${url.search}`
      }
    } catch {
      // Fall back to local path handling below.
    }
  }

  return normalizeLocalPath(next)
}

function getRoleFromNext(next: string) {
  const [, query = ''] = next.split('?')
  const params = new URLSearchParams(query)
  return params.get('role') === 'shop' ? 'shop' : 'barber'
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = getSafeRedirectTarget(
    request,
    searchParams.get('redirect_to'),
    searchParams.get('next')
  )

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.search = ''

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(redirectTo)
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash
    })

    if (!error) {
      return NextResponse.redirect(redirectTo)
    }
  }

  const fallback = request.nextUrl.clone()
  fallback.pathname = '/login'
  fallback.search = `?error=auth_confirm_failed&role=${getRoleFromNext(next)}`

  return NextResponse.redirect(fallback)
}

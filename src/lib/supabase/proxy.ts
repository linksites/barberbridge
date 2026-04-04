import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const AUTH_PAGES = new Set(['/login', '/register'])
const SHOP_ONLY_PATHS = ['/dashboard/shop']
const BARBER_ONLY_PATHS = ['/dashboard/barber', '/dashboard/portfolio', '/dashboard/applications', '/dashboard/invitations']

function isProtectedPath(pathname: string) {
  return pathname.startsWith('/dashboard') || pathname === '/onboarding'
}

function inferRoleFromPath(pathname: string) {
  if (SHOP_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    return 'shop'
  }

  if (BARBER_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    return 'barber'
  }

  return null
}

function buildRedirect(request: NextRequest, pathname: string, search?: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = search ?? ''
  return url
}

function redirectWithCookies(
  request: NextRequest,
  sourceResponse: NextResponse,
  pathname: string,
  search?: string
) {
  const redirectResponse = NextResponse.redirect(buildRedirect(request, pathname, search))

  sourceResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie)
  })

  redirectResponse.headers.set('Cache-Control', 'private, no-store')

  return redirectResponse
}

async function getUserRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
) {
  const { data } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  return data?.role ?? null
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

          response = NextResponse.next({
            request
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        }
      }
    }
  )

  const pathname = request.nextUrl.pathname
  const requestedRole = inferRoleFromPath(pathname)
  const nextPath = `${pathname}${request.nextUrl.search}`
  const loginSearch = `?next=${encodeURIComponent(nextPath)}${requestedRole ? `&role=${requestedRole}` : ''}`

  const claimsResult = await supabase.auth.getClaims()
  const claims = claimsResult.data?.claims

  if (!claims?.sub) {
    if (isProtectedPath(pathname)) {
      return redirectWithCookies(request, response, '/login', loginSearch)
    }

    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

  const role = await getUserRole(supabase, claims.sub)

  if (!role) {
    if (pathname !== '/onboarding') {
      return redirectWithCookies(request, response, '/onboarding')
    }

    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

  if (AUTH_PAGES.has(pathname) || pathname === '/onboarding') {
    return redirectWithCookies(request, response, `/dashboard/${role}`)
  }

  if (role === 'shop' && BARBER_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    return redirectWithCookies(request, response, '/dashboard/shop')
  }

  if (role === 'barber' && SHOP_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    return redirectWithCookies(request, response, '/dashboard/barber')
  }

  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

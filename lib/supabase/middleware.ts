import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes - accessible without authentication (SEO friendly)
  const publicPaths = ['/', '/cars', '/places', '/auth', '/setup', '/api']
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(`${path}/`)
  )

  // Protected routes that require authentication
  const protectedPaths = ['/rides', '/wishlist', '/profile', '/booking']
  const businessPaths = ['/business']
  const adminPaths = ['/admin']

  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isBusinessPath = businessPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isAdminPath = adminPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Redirect to login if accessing protected routes without auth
  if ((isProtectedPath || isBusinessPath || isAdminPath) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Check role-based access
  if (user) {
    const role = user.user_metadata?.role || 'user'

    // Business routes require business or admin role
    if (isBusinessPath && role !== 'business' && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Admin routes require admin role
    if (isAdminPath && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

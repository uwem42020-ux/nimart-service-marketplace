// middleware.ts - FIXED VERSION
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Allow static files
  const isStaticRoute = pathname.startsWith('/_next') || 
                       pathname.startsWith('/_vercel') ||
                       pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/i)

  if (isStaticRoute) {
    return response
  }

  // PUBLIC ROUTES - No authentication required (EXPAND THIS LIST!)
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/auth/reset-password',
    '/verify',
    '/auth/callback',
    '/marketplace',
    '/provider/register',
    '/provider/benefits',
    '/provider/terms',
    '/provider/how-it-works',
    '/providers/[id]',  // Provider profiles are PUBLIC
    '/services/[id]',   // Service pages are PUBLIC
    '/about',
    '/contact',
    '/help',
    '/privacy',
    '/terms',
    '/sitemap.xml',
    '/robots.txt',
    '/manifest.json',
    // ADD ALL LINK PAGES HERE:
    '/links/become-a-provider',
    '/links/marketplace',
    '/links/how-it-works',
    '/links/help-center',
    '/links/contact',
    '/links/provider-benefits',
    '/links/provider-support',
    '/links/terms-conditions',
    '/links/about',
    '/links/blog',
    '/links/careers',
    '/links/press',
    // ADD ALL API ROUTES:
    '/api/sitemap',
    '/api/health',
    '/api/providers',
    '/api/services',
    // Add any other public routes
  ]

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => {
    // Dynamic route patterns
    if (route === '/providers/[id]' && pathname.match(/^\/providers\/[^\/]+$/)) {
      return true
    }
    if (route === '/services/[id]' && pathname.match(/^\/services\/[^\/]+$/)) {
      return true
    }
    // Check exact match or starts with
    if (pathname === route) return true
    if (pathname.startsWith(route + '/')) return true
    // Check for link pages
    if (pathname.startsWith('/links/')) {
      const linkPath = pathname.replace('/links/', '')
      // Make ALL /links/* pages public
      return true
    }
    return false
  })

  // For now, ALLOW ALL REQUESTS without authentication
  // This disables the middleware's redirect functionality
  console.log(`✅ Middleware: Allowing access to ${pathname}`)
  return response
  
  // ⚠️ IMPORTANT: REMOVE THIS ENTIRE BLOCK ⚠️
  // The following code is what's causing the redirects:
  /*
  const isAuthenticated = request.cookies.get('is-authenticated')?.value === 'true'
  
  if (!isAuthenticated) {
    console.log(`🔒 Middleware: Redirecting to login from: ${pathname}`)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', encodeURIComponent(pathname))
    return NextResponse.redirect(loginUrl)
  }
  */
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|.*\\.(?:ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|json)$).*)',
  ],
}
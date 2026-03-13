import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname.startsWith('/admin/login')

  if (!isAdminPage || isLoginPage) {
    return NextResponse.next()
  }

  const adminAuth = request.cookies.get('admin_auth')?.value

  if (adminAuth === 'ok') {
    return NextResponse.next()
  }

  const loginUrl = new URL('/admin/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*'],
}
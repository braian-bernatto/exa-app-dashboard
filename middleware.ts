import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
      const url = new URL(req.url)
      url.pathname = '/login'
      return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher:  ['/', '/exas/:path*', '/torneos/:path*', '/equipos/:path*','/jugadores/:path*','/fixtures/:path*']
}
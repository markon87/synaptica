import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  
  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(new URL('/auth/signin?error=oauth_error', requestUrl.origin))
  }
  
  if (!code) {
    console.error('No OAuth code provided')
    return NextResponse.redirect(new URL('/auth/signin?error=no_code', requestUrl.origin))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  
  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth callback error:', error.message)
      return NextResponse.redirect(new URL('/auth/signin?error=session_error', requestUrl.origin))
    }
    
    // Success - redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    
  } catch (error) {
    console.error('Unexpected error during OAuth callback:', error)
    return NextResponse.redirect(new URL('/auth/signin?error=unexpected_error', requestUrl.origin))
  }
}
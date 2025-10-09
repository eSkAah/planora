import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

import type { Database } from '@/lib/database/types';
import { publicEnv } from '@/lib/env';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getUser() instead of getSession() for security
  // getSession() reads from cookies and may not be authentic
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const session = user && !authError ? { user } : null;

  const protectedRoutes = [
    '/dashboard',
    '/schedules',
    '/employees',
    '/settings',
    '/onboarding',
  ];
  const isProtectedRoute = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

  const isAuthRoute = req.nextUrl.pathname === '/';
  const isOnboardingRoute = req.nextUrl.pathname.startsWith('/onboarding');

  // Redirect to login if trying to access protected route without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Check onboarding completion for authenticated users
  if (session && !isOnboardingRoute) {
    try {
      // Get user's company
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', session.user.id)
        .single();

      if (userData?.company_id) {
        // Get company settings
        const { data: companyData } = await supabase
          .from('companies')
          .select('settings')
          .eq('id', userData.company_id)
          .single();

        const settings = companyData?.settings as Record<string, unknown> | null;
        const onboardingCompleted = settings?.onboarding_completed === true;

        // Redirect to onboarding if not completed
        if (!onboardingCompleted && !isAuthRoute) {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Continue with normal flow if there's an error
    }
  }

  // Redirect authenticated users from auth page to dashboard (if onboarding completed)
  if (isAuthRoute && session) {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', session.user.id)
        .single();

      if (userData?.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('settings')
          .eq('id', userData.company_id)
          .single();

        const settings = companyData?.settings as Record<string, unknown> | null;
        const onboardingCompleted = settings?.onboarding_completed === true;

        if (onboardingCompleted) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        } else {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status for auth redirect:', error);
      // Default to dashboard if there's an error
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

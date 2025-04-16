import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/']);

export default clerkMiddleware((auth, req) => {
  try {
    if (isProtectedRoute(req)) {
      auth.protect(); // Redirects to /sign-in if not authenticated
    }
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // Fallback to 404 or custom error page if redirect fails
    return new NextResponse('Not Found', { status: 404 });
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
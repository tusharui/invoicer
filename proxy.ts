import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Invoices (and the old dashboard) may only be reached by signed-in users.
// Sending someone to one of these routes while signed out makes Clerk
// redirect them to the sign-in page.
const isProtectedRoute = createRouteMatcher([
  '/invoices(.*)',
  '/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

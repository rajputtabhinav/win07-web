import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route matchers
const isPublicRoute = createRouteMatcher([
  '/',
  '/games(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/signup(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/faq(.*)',
  '/terms(.*)',
  '/privacy(.*)',
  '/responsible-gaming(.*)',
  '/api/public(.*)',
  '/api/chatbot(.*)', // Allow chatbot for all users
  '/test-secure-wallet(.*)' // Allow testing page
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Allow ALL API routes to handle their own authentication
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // For protected UI routes, check authentication
  const { userId } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    return auth().redirectToSignIn();
  }

  // Additional admin route protection
  if (isAdminRoute(req)) {
    // Let the route handler do the admin check since we have server-side admin validation
    return NextResponse.next();
  }

  // Allow all other authenticated routes
  return NextResponse.next();
});

export const config = {
  // avoid running on static assets and Next internals; run on app routes & API
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|favicon|icon).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};

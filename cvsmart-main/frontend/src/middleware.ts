import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the pathname
  const path = req.nextUrl.pathname;

  // Always allow access to auth callback route
  if (path.startsWith("/auth/callback")) {
    return res;
  }

  // Check auth condition
  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/update-password");

  // If accessing a protected route without being authenticated
  if (!session && !isAuthRoute && path !== "/") {
    const redirectUrl = new URL("/login", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If accessing auth routes while authenticated
  // Exception: Allow access to update-password even when authenticated
  if (session && isAuthRoute && !path.startsWith("/update-password")) {
    const redirectUrl = new URL("/", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_code = requestUrl.searchParams.get("error_code");
  const error_description = requestUrl.searchParams.get("error_description");

  // If there's an error, redirect to login with the error parameters
  if (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.hash = `error=${error}&error_code=${error_code}&error_description=${encodeURIComponent(
      error_description || ""
    )}`;
    return NextResponse.redirect(loginUrl);
  }

  // Check if this is a password reset flow
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // If this is a password reset, redirect to update-password
    if (type === "recovery") {
      return NextResponse.redirect(new URL("/update-password", request.url));
    }
  }

  // For other auth flows (signup, login), redirect to dashboard or specified next URL
  return NextResponse.redirect(new URL(next, request.url));
}

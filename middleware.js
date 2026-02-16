import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const requiresAdmin = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  if (!requiresAdmin) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (token?.role === "admin") {
    return NextResponse.next();
  }

  const signInUrl = new URL("/admin/login", req.url);
  signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};

import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/auth/v1/login",
  "/auth/v1/register",
  "/auth/v2/login",
  "/auth/v2/register",
  "/unauthorized",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const sessionToken = req.cookies.get("session_token")?.value;

  if (!sessionToken && !isPublic) {
    const loginUrl = new URL("/auth/v1/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionToken && isPublic) {
    return NextResponse.redirect(
      new URL("/dashboard/ticketing-analytics", req.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

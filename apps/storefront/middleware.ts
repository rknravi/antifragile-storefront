import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LEGACY_RAYS_PREFIX } from "@/lib/theme-paths";

/** Pass pathname to layouts; redirect legacy `/rays/*` URLs to root paths. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === LEGACY_RAYS_PREFIX || pathname.startsWith(`${LEGACY_RAYS_PREFIX}/`)) {
    const nextPath = pathname.slice(LEGACY_RAYS_PREFIX.length) || "/";
    const url = request.nextUrl.clone();
    url.pathname = nextPath;
    return NextResponse.redirect(url, 308);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

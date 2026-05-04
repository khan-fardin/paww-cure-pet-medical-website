import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/dashboard",
  "/book",
  "/consultation",
  "/consultations",
  "/documents",
  "/payments",
  "/pets",
  "/reminders",
] as const;

function isProtectedPath(pathname: string) {
  if (pathname.startsWith("/vets/")) {
    return true;
  }

  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const hasAccessToken = Boolean(request.cookies.get("access_token")?.value);

  if (hasAccessToken) {
    return NextResponse.next();
  }

  // const loginUrl = new URL("/login", request.url);
  // loginUrl.searchParams.set("returnUrl", `${pathname}${request.nextUrl.search}`);

  // return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/book/:path*",
    "/consultation/:path*",
    "/consultations/:path*",
    "/documents/:path*",
    "/payments/:path*",
    "/pets/:path*",
    "/reminders/:path*",
    "/vets/:path*",
  ],
};

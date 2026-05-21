import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

const PUBLIC_PATHS = [
  "/",
  "/vets", 
  "/login",
  "/register",
  "/apply-as-vet",
  "/forgot-password",
];

const SHARED_AUTHENTICATED = [
  "/consultation",
  "/settings",
  "/notifications",
  "/vets",
];

const ROLE_PREFIXES: Record<string, string[]> = {
  user: ["/dashboard", "/pets", "/book",
          "/consultations", "/documents", "/reminders", "/payments"],
  vet:   ["/vet"],
  mod:   ["/mod"],
  admin: ["/admin"],
};

const ROLE_HOME: Record<string, string> = {
  user: "/dashboard",
  vet:   "/vet/dashboard",
  mod:   "/mod/dashboard",
  admin: "/admin/dashboard",
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths, API routes, static files
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/articles") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await verifyToken(token);
    const role = payload.role;

    // Shared routes — any authenticated role can access
    if (SHARED_AUTHENTICATED.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    // Check role matches route prefix
    const allowed = ROLE_PREFIXES[role] ?? [];
    const isAllowed = allowed.some((p) => pathname.startsWith(p));

    if (!isAllowed) {
      return NextResponse.redirect(
        new URL(ROLE_HOME[role] ?? "/login", req.url)
      );
    }

    // Unverified vets can only access /vet/profile
    if (
      role === "vet" &&
      !payload.isVerified &&
      !pathname.startsWith("/vet/profile")
    ) {
      return NextResponse.redirect(new URL("/vet/profile", req.url));
    }

    return NextResponse.next();
  } catch {
    // Token expired or invalid — clear cookie and redirect
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("access_token");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};

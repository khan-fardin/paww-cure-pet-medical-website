import { NextResponse, type NextRequest } from "next/server";

import { signToken, verifyToken, type TokenPayload } from "@/lib/auth/jwt";

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

const ROLE_PREFIXES: Record<TokenPayload["role"], string[]> = {
  user: [
    "/dashboard",
    "/pets",
    "/book",
    "/consultations",
    "/documents",
    "/reminders",
    "/payments",
    "/support",
  ],
  vet: ["/vet"],
  mod: ["/mod"],
  admin: ["/admin"],
};

const ROLE_HOME: Record<TokenPayload["role"], string> = {
  user: "/dashboard",
  vet: "/vet/dashboard",
  mod: "/mod/dashboard",
  admin: "/admin/dashboard",
};

function loginRedirect(req: NextRequest) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("returnUrl", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function isAllowedPath(pathname: string, payload: TokenPayload) {
  if (SHARED_AUTHENTICATED.some((path) => pathname.startsWith(path))) {
    return true;
  }

  return ROLE_PREFIXES[payload.role].some((path) => pathname.startsWith(path));
}

function shouldRedirectUnverifiedVet(pathname: string, payload: TokenPayload) {
  return (
    payload.role === "vet" &&
    !payload.isVerified &&
    !pathname.startsWith("/vet/profile")
  );
}

async function nextWithRefreshedAccess(payload: TokenPayload) {
  const response = NextResponse.next();
  const accessToken = await signToken(
    {
      userId: payload.userId,
      role: payload.role,
      ...(payload.role === "vet"
        ? { isVerified: Boolean(payload.isVerified) }
        : {}),
    },
    "15m"
  );

  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/",
  });

  return response;
}

function redirectForPayload(req: NextRequest, payload: TokenPayload) {
  const { pathname } = req.nextUrl;

  if (!isAllowedPath(pathname, payload)) {
    return NextResponse.redirect(new URL(ROLE_HOME[payload.role], req.url));
  }

  if (shouldRedirectUnverifiedVet(pathname, payload)) {
    return NextResponse.redirect(new URL("/vet/profile", req.url));
  }

  return null;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/articles") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (accessToken) {
    try {
      const payload = await verifyToken(accessToken);
      return redirectForPayload(req, payload) ?? NextResponse.next();
    } catch {
      // Try the refresh token below.
    }
  }

  if (!refreshToken) {
    const response = loginRedirect(req);
    response.cookies.delete("access_token");
    return response;
  }

  try {
    const payload = await verifyToken(refreshToken);
    const redirectResponse = redirectForPayload(req, payload);

    if (redirectResponse) {
      return redirectResponse;
    }

    return nextWithRefreshedAccess(payload);
  } catch {
    const response = loginRedirect(req);
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};

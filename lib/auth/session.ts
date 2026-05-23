import { cookies } from "next/headers";
import { verifyToken, type TokenPayload } from "./jwt";

export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (token) {
      try {
        return await verifyToken(token);
      } catch {
        // Fall through to refresh token so server layouts do not log out users
        // just because the short access token expired.
      }
    }

    if (!refreshToken) return null;
    return await verifyToken(refreshToken);
  } catch {
    return null;
  }
}

export async function requireSession(
  allowedRoles?: string[]
): Promise<TokenPayload> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error("Forbidden");
  }
  return session;
}

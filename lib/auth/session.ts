import { cookies } from "next/headers";
import { verifyToken, type TokenPayload } from "./jwt";

export async function getSession(): Promise<TokenPayload | null> {
  try {
    // In Next.js 15+ cookies() is async
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;
    return await verifyToken(token);
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
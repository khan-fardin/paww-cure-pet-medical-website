import { jwtVerify, SignJWT, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface TokenPayload extends JWTPayload {
  userId: string;
  role: "user" | "vet" | "mod" | "admin";
  isVerified?: boolean;
}

export async function signToken(
  payload: TokenPayload,
  expiresIn = "15m"
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as TokenPayload;
}
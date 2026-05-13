import { jwtVerify, SignJWT, type JWTPayload } from "jose";

export interface TokenPayload extends JWTPayload {
  userId: string;
  role: "user" | "vet" | "mod" | "admin";
  isVerified?: boolean;
}

export async function signToken(
  payload: TokenPayload,
  expiresIn = "15m"
): Promise<string> {
  const secret = getJwtSecret();

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const secret = getJwtSecret();
  const { payload } = await jwtVerify(token, secret);
  return payload as TokenPayload;
}

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error(
      "JWT_SECRET is not configured. Add a 32+ character secret to the deployment environment."
    );
  }

  return new TextEncoder().encode(jwtSecret);
}

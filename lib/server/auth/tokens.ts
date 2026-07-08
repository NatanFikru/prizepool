import jwt from "jsonwebtoken";
import { getJwtSecret } from "./config";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  username: string;
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "object" &&
      typeof decoded.sub === "string" &&
      typeof decoded.email === "string" &&
      typeof decoded.username === "string"
    ) {
      return {
        sub: decoded.sub,
        email: decoded.email,
        username: decoded.username,
      };
    }

    return null;
  } catch {
    return null;
  }
}

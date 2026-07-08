export const AUTH_COOKIE_NAME = "prizepool_session";
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32 || secret.startsWith("replace-this")) {
    throw new Error("JWT_SECRET must be set to a secure value of at least 32 characters.");
  }

  return secret;
}

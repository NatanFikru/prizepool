import type { User } from "@/lib/generated/prisma/client";

export interface SafeAuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: null;
}

export function toSafeAuthUser(user: Pick<User, "id" | "email" | "username" | "displayName">): SafeAuthUser {
  const displayName = user.displayName?.trim() || null;
  const [firstName, ...lastNameParts] = displayName?.split(/\s+/) ?? [];

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName,
    firstName: firstName || null,
    lastName: lastNameParts.length > 0 ? lastNameParts.join(" ") : null,
    profileImageUrl: null,
  };
}

export function usernameFromEmail(email: string) {
  return email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24) || "user";
}

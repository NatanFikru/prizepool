// Shared TypeScript types for PrizePool.
// API types live in lib/api.ts.

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

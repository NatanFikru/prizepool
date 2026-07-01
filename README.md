# PrizePool — Next.js

Premium mobile-first football prediction rewards platform.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Stack

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **shadcn/ui** components (Radix UI primitives)
- **TanStack React Query v5**
- **Framer Motion** animations
- **Recharts** (Admin analytics)

## Project Structure

```
app/                  # Next.js App Router pages
  layout.tsx          # Root layout — providers, BottomNav
  page.tsx            # Home
  login/page.tsx
  signup/page.tsx
  wallet/page.tsx
  matches/
    page.tsx          # Match list
    [id]/page.tsx     # Match details + prediction submit
  picks/page.tsx      # My Picks (active & closed)
  results/page.tsx
  profile/page.tsx
  admin/page.tsx
components/
  layout/             # BottomNav, PageHeader
  ui/                 # shadcn + custom (MatchCard, OutcomeCard, StatBadge)
  providers.tsx       # Client-side providers wrapper
contexts/
  auth-context.tsx    # Auth context (useAppAuth hook)
hooks/
  use-auth.ts         # Fetches /api/auth/user
  use-toast.ts
  use-mobile.tsx
lib/
  api.ts              # API client hooks (useListMatches, useSubmitPick, etc.)
  utils.ts            # cn() utility
data/
  mockData.ts         # Mock data (fallback when API not connected)
```

## Connecting the Backend

The app ships with mock data as a fallback. To connect the real API server:

1. Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (defaults to same origin)
2. Run the Express API server (`artifacts/api-server` in the monorepo)
3. Set `DATABASE_URL` and `SESSION_SECRET` in the API server's env

Auth uses Replit OIDC — configure `REPLIT_DOMAINS`, `REPLIT_DEPLOYMENT`, and OIDC env vars in the API server.

// API client hooks — compatible with the Orval-generated @workspace/api-client-react interface.
// Each hook calls the Express API server. Falls back gracefully when the server is unavailable.
"use client";
import { useQuery, useMutation } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoffAt: string;
  boostActive: boolean;
  homePercent: number;
  drawPercent: number;
  awayPercent: number;
  homeLabel: string;
  drawLabel: string;
  awayLabel: string;
  status: "upcoming" | "live" | "completed";
  homeScore?: number | null;
  awayScore?: number | null;
  winningOutcome?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pick {
  id: string;
  userId: string;
  matchId: string;
  outcome: "home" | "draw" | "away";
  stakeAmount: number;
  status: "pending" | "won" | "lost";
  rewardAmount?: number | null;
  createdAt: string;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────
async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    const err = Object.assign(new Error((body.error as string) ?? res.statusText), {
      response: { data: body },
    });
    throw err;
  }
  return res.json() as Promise<T>;
}

// ─── Matches ──────────────────────────────────────────────────────────────────
export function useListMatches(options?: { query?: { enabled?: boolean } }) {
  return useQuery({
    queryKey: ["matches"],
    queryFn: () => fetchJson<{ matches: Match[] }>("/api/matches"),
    enabled: options?.query?.enabled !== false,
  });
}

export function useGetMatch(id: string, options?: { query?: { enabled?: boolean } }) {
  return useQuery({
    queryKey: ["matches", id],
    queryFn: () => fetchJson<{ match: Match }>(`/api/matches/${id}`),
    enabled: options?.query?.enabled !== false && !!id,
  });
}

// ─── Picks ────────────────────────────────────────────────────────────────────
export function useListMyPicks(options?: { query?: { enabled?: boolean } }) {
  return useQuery({
    queryKey: ["picks"],
    queryFn: () => fetchJson<{ picks: Pick[] }>("/api/picks"),
    enabled: options?.query?.enabled !== false,
  });
}

interface SubmitPickVars {
  data: {
    matchId: string;
    outcome: "home" | "draw" | "away";
    stakeAmount: 40 | 100 | 400;
  };
}

export function useSubmitPick(options?: {
  mutation?: {
    onSuccess?: (data: { pick: Pick }) => void;
    onError?: (err: unknown) => void;
  };
}) {
  return useMutation<{ pick: Pick }, unknown, SubmitPickVars>({
    mutationFn: ({ data }: SubmitPickVars) =>
      fetchJson<{ pick: Pick }>("/api/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: options?.mutation?.onSuccess,
    onError: options?.mutation?.onError,
  });
}

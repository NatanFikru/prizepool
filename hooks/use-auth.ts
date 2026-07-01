"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Auth Types ──────────────────────────────────────────────────────────────
// These mirror the AuthUser schema from the API server (lib/api-spec/openapi.yaml).
// When Codex connects the backend, this type will be automatically kept in sync
// via the generated @workspace/api-zod / @workspace/api-client-react packages.
export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

// ─── useAuth ─────────────────────────────────────────────────────────────────
// Fetches the current session from GET /api/auth/user (set by authMiddleware).
// login() → redirects to /api/login → Replit OIDC → /api/callback → session cookie.
// logout() → redirects to /api/logout → clears session → OIDC end-session.
export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/user", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ user: AuthUser | null }>;
      })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    const base = "/";
    window.location.href = `/api/login?returnTo=${encodeURIComponent(base)}`;
  }, []);

  const logout = useCallback(() => {
    window.location.href = "/api/logout";
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}

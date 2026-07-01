"use client";

import PageHeader from "@/components/layout/PageHeader";
import { MOCK_USER_STATS } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trophy, Target, Wallet, Edit2, LogOut, Shield, FileText, Lock, Bell } from "lucide-react";
import { useAppAuth } from "@/contexts/auth-context";

export default function Profile() {
  // useAppAuth() provides the real authenticated user and logout().
  // user is null when not authenticated — handled gracefully below.
  const { user, logout } = useAppAuth();

  const displayName =
    user
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "PrizePool User"
      : "PrizePool User";

  const displayEmail = user?.email ?? "—";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <PageHeader title="Profile" />

      <main className="p-4 space-y-8">
        {/* User Profile Header */}
        <div className="flex flex-col items-center pt-4">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 border-2 border-primary shadow-lg shadow-primary/20">
              {user?.profileImageUrl && (
                <AvatarImage src={user.profileImageUrl} alt={displayName} />
              )}
              <AvatarFallback className="bg-secondary text-2xl font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
              <Edit2 size={14} />
            </button>
          </div>
          <h2 className="text-xl font-bold">{displayName}</h2>
          <p className="text-muted-foreground text-sm">Member since Oct 2023</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1">
            <Target size={18} className="text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Total Picks</p>
            <p className="font-bold text-lg">{MOCK_USER_STATS.totalPicks}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1">
            <Trophy size={18} className="text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="font-bold text-lg text-primary">{MOCK_USER_STATS.winRate}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1">
            <Wallet size={18} className="text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Total Won</p>
            <p className="font-bold text-sm text-green-500">{MOCK_USER_STATS.totalWon}</p>
          </div>
        </div>

        {/* Personal Info */}
        <section className="space-y-4">
          <h3 className="font-bold text-lg">Personal Info</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              {/* TODO (Codex): wire to PATCH /api/users/me */}
              <Input
                defaultValue={displayName}
                className="bg-card border-border focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              {/* TODO (Codex): wire to PATCH /api/users/me */}
              <Input
                defaultValue={displayEmail}
                className="bg-card border-border focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">User ID</Label>
              <Input
                defaultValue={user?.id ?? "—"}
                disabled
                className="bg-secondary/50 border-border text-muted-foreground font-mono text-xs"
              />
            </div>
          </div>
        </section>

        {/* Settings */}
        <section className="space-y-4">
          <h3 className="font-bold text-lg">Settings</h3>
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-muted-foreground" />
                <span className="font-medium text-sm">Notifications</span>
              </div>
              <Switch defaultChecked />
            </div>
            <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-muted-foreground" />
                <span className="font-medium text-sm">Change Password</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-muted-foreground" />
                <span className="font-medium text-sm">Privacy Policy</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-muted-foreground" />
                <span className="font-medium text-sm">Terms of Service</span>
              </div>
            </button>
          </div>
        </section>

        {/* Sign Out — calls real logout() which clears the session and redirects */}
        <Button
          variant="ghost"
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-2 h-12"
          onClick={logout}
          data-testid="button-signout"
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </main>
    </div>
  );
}

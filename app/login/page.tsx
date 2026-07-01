"use client";

import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { useAppAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";

export default function Login() {
  // useAppAuth() gives access to the real login() from Replit Auth.
  // Calling login() redirects the browser to /api/login → Replit OIDC → /api/callback.
  // No custom form submission or password handling needed.
  const { login, isLoading } = useAppAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/10 blur-[80px] pointer-events-none" />

      <motion.div
        className="w-full max-w-sm space-y-8 relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-card border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Trophy size={40} className="text-primary" fill="currentColor" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight">PRIZEPOOL</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Predict football. Join Prize Pools. Win rewards.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-col gap-2">
          {[
            { icon: Shield, label: "Secure & trusted platform" },
            { icon: Zap, label: "Instant rewards on correct picks" },
            { icon: Trophy, label: "Premium prize pools daily" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
            >
              <Icon size={16} className="text-primary shrink-0" />
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA — triggers Replit OIDC */}
        <div className="space-y-3">
          <Button
            onClick={login}
            disabled={isLoading}
            className="w-full h-14 font-bold text-primary-foreground text-lg rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            data-testid="button-login"
          >
            {isLoading ? "Connecting..." : "Sign In to PrizePool"}
            {!isLoading && <ArrowRight size={20} />}
          </Button>

          <p className="text-center text-xs text-muted-foreground px-4">
            By signing in you agree to our{" "}
            <span className="text-primary underline cursor-pointer">Terms</span>{" "}
            and{" "}
            <span className="text-primary underline cursor-pointer">
              Privacy Policy
            </span>
          </p>
        </div>

        {/* Signup link */}
        <div className="text-center text-sm border-t border-border pt-4">
          <span className="text-muted-foreground">New to PrizePool? </span>
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Learn more
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

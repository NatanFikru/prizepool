"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background">
      <PageHeader title="404" showBack />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-card border-border">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

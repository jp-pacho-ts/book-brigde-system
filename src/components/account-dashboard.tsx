"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  Crown,
  LibraryBig,
  LogIn,
  ShieldCheck,
  Sparkles,
  XCircle
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AccountStats = {
  total: number;
  premium: number;
  free: number;
};

export function AccountDashboard({ stats }: { stats: AccountStats }) {
  const { user, isReady, isSubscribed, cancelSubscription } = useAuth();

  if (!isReady) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-muted-foreground">Loading account...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="surface-line">
        <section className="mx-auto max-w-4xl px-4 py-14">
          <Card className="p-8 text-center shadow-soft">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-primary/10 text-primary">
              <LogIn size={30} aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-3xl font-semibold text-foreground">Login required</h1>
            <p className="mt-2 text-muted-foreground">Sign in to view your subscription status.</p>
            <Link href="/login" className="mt-6 inline-flex">
              <Button>Go to sign in</Button>
            </Link>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="surface-line">
      <section className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge variant="secondary" className="gap-2 rounded-full px-3 py-1">
                <ShieldCheck size={14} aria-hidden="true" />
                Account dashboard
              </Badge>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                {user.name}
              </h1>
              <p className="mt-2 text-base font-medium text-muted-foreground">{user.email}</p>
            </div>

            <Card
              className={cn(
                "px-5 py-4 shadow-sm",
                isSubscribed ? "border-primary/20 bg-primary/10 text-primary" : "bg-muted"
              )}
            >
              <div className="flex items-center gap-2">
                {isSubscribed ? (
                  <BadgeCheck size={22} aria-hidden="true" />
                ) : (
                  <XCircle size={22} aria-hidden="true" />
                )}
                <span className="text-lg font-semibold">{isSubscribed ? "Premium Active" : "Free Account"}</span>
              </div>
              <p className="mt-1 text-sm font-medium opacity-80">
                {isSubscribed
                  ? `Access until ${user.subscriptionEndsAt ?? "end date"}`
                  : "Premium ebooks are locked."}
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-3">
          <AccountMetric
            icon={<LibraryBig size={24} aria-hidden="true" />}
            label="Total ebooks"
            value={stats.total.toString()}
          />
          <AccountMetric
            icon={<Crown size={24} aria-hidden="true" />}
            label="Premium titles"
            value={stats.premium.toString()}
          />
          <AccountMetric
            icon={<BookOpen size={24} aria-hidden="true" />}
            label="Free titles"
            value={stats.free.toString()}
          />
        </div>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
                <Sparkles size={24} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Reading access</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Manage your library access and continue reading from the catalog.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/">
                <Button>Browse ebooks</Button>
              </Link>
              {isSubscribed ? (
                <Button type="button" onClick={cancelSubscription} variant="destructive">
                  Cancel subscription
                </Button>
              ) : (
                <Link href="/subscribe">
                  <Button>Upgrade to premium</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function AccountMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-primary">{icon}</div>
      <p className="mt-5 text-4xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm font-medium uppercase tracking-normal text-muted-foreground">{label}</p>
    </Card>
  );
}

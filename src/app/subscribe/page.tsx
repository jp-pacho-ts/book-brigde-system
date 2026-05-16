"use client";

import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SubscribePage() {
  const router = useRouter();
  const { user, isSubscribed, activateSubscription } = useAuth();
  const [accountName, setAccountName] = useState("Student Reader");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("Please sign in before activating premium access.");
      return;
    }

    if (!accountName.trim()) {
      setMessage("Enter an account name before confirming.");
      return;
    }

    activateSubscription();
    router.push("/account");
  }

  return (
    <main className="surface-line">
      <section className="border-b bg-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-14">
          <div>
            <Badge variant="secondary" className="gap-2 rounded-full px-3 py-1">
              <Sparkles size={14} aria-hidden="true" />
              Premium access
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Upgrade your reading access.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Premium opens the full shelf. This sample checkout activates access in your browser only,
              so no payment details are collected.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Benefit
                icon={<ShieldCheck size={22} aria-hidden="true" />}
                title="No payment details"
                description="No card, wallet, or bank information is collected."
              />
              <Benefit
                icon={<LockKeyhole size={22} aria-hidden="true" />}
                title="Clear access"
                description="Premium titles unlock immediately after activation."
              />
            </div>
          </div>

          <Card className="bg-foreground p-5 text-background shadow-soft">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-normal text-background/60">Plan snapshot</p>
                <h2 className="mt-2 text-3xl font-semibold">Premium library access</h2>
              </div>
              <span className="grid h-14 w-14 place-items-center rounded-lg bg-background/10">
                <CreditCard size={26} aria-hidden="true" />
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <DemoField label="Mode" value="Sample" />
              <DemoField label="Payment" value="None" />
              <DemoField label="Charge" value="PHP 0" />
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
                  Plan summary
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-foreground">Premium Plan</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Monthly access for premium ebooks in the library.
                </p>
              </div>
              <ReceiptText className="text-primary" size={28} aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="border-y py-5">
              <p className="text-5xl font-semibold text-foreground">PHP 99</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-normal text-muted-foreground">
                sample monthly price
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {["Unlimited premium ebook access", "Works with the sample login", "Stored only in this browser"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                    <CheckCircle2 className="text-primary" size={18} aria-hidden="true" />
                    {item}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          {isSubscribed ? (
            <CardContent className="p-6">
              <div className="rounded-lg bg-primary/10 p-6">
                <BadgeCheck className="text-primary" size={28} aria-hidden="true" />
                <h2 className="mt-3 text-2xl font-semibold text-foreground">Premium is active</h2>
                <p className="mt-2 text-muted-foreground">You can already open premium ebooks.</p>
                <Link href="/" className="mt-5 inline-flex">
                  <Button>Back to library</Button>
                </Link>
              </div>
            </CardContent>
          ) : (
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b pb-5">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">Checkout</h2>
                    <p className="text-sm text-muted-foreground">Sample subscription activation</p>
                  </div>
                  <Badge variant="secondary">No charge</Badge>
                </div>

                {!user ? (
                  <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    Sign in first before activating premium access.{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                      Go to sign in
                    </Link>
                  </div>
                ) : null}

                <div>
                  <Label htmlFor="account-name">Account name</Label>
                  <Input
                    id="account-name"
                    value={accountName}
                    onChange={(event) => setAccountName(event.target.value)}
                    className="mt-2 h-11"
                    required
                  />
                </div>

                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm font-semibold text-foreground">Activation confirmation</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Confirming will activate premium access for this browser session. No card,
                    wallet, bank, or payment gateway information is used.
                  </p>
                </div>

                {message ? (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                    {message}
                  </p>
                ) : null}

                <Button type="submit" className="h-11 w-full">
                  <CreditCard size={18} aria-hidden="true" />
                  Activate premium
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      </section>
    </main>
  );
}

function Benefit({
  icon,
  title,
  description
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-4">
      <div className="text-primary">{icon}</div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
    </Card>
  );
}

function DemoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-background/10 bg-background/10 p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-background/55">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold text-background">{value}</p>
    </div>
  );
}

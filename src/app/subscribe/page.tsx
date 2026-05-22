"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  Check,
  CreditCard,
  Crown,
  LockKeyhole,
  Mail,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ACCEPTED_CARD_NUMBER = "4242 4242 4242 4242";
const ACCEPTED_CARD_DIGITS = "4242424242424242";
const ACCEPTED_EXPIRY = "12/34";
const ACCEPTED_CVC = "123";
const PAYMENT_REFERENCE = "BB-0424-8610";

const PLAN_FEATURES = [
  "Unlimited access to all premium ebooks",
  "Instant activation after payment",
  "All subject categories included",
  "New titles added every month",
  "Read on any device, anytime",
  "Cancel anytime — no hidden fees",
];

export default function SubscribePage() {
  const router = useRouter();
  const { user, isSubscribed, activateSubscription } = useAuth();
  const [cardholderName, setCardholderName] = useState("Student Reader");
  const [cardNumber, setCardNumber] = useState(ACCEPTED_CARD_NUMBER);
  const [expiry, setExpiry] = useState(ACCEPTED_EXPIRY);
  const [cvc, setCvc] = useState(ACCEPTED_CVC);
  const [billingCountry, setBillingCountry] = useState("Philippines");
  const [billingZip, setBillingZip] = useState("1000");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setCardholderName(user.name);
    }
  }, [user?.name]);

  const cardLastFour = normalizeCardNumber(cardNumber).slice(-4) || "••••";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("Please sign in before activating premium access.");
      return;
    }
    if (!cardholderName.trim()) {
      setMessage("Enter the cardholder name before confirming.");
      return;
    }
    if (normalizeCardNumber(cardNumber) !== ACCEPTED_CARD_DIGITS) {
      setMessage("Use the accepted test card number to activate the membership.");
      return;
    }
    if (!isFutureExpiry(expiry)) {
      setMessage("Enter a future expiry date in MM/YY format.");
      return;
    }
    if (!cvc.match(/^\d{3,4}$/)) {
      setMessage("Enter a 3 or 4 digit CVC.");
      return;
    }
    if (!billingCountry.trim()) {
      setMessage("Select a billing country before confirming.");
      return;
    }
    if (!billingZip.trim()) {
      setMessage("Enter a billing ZIP or postal code before confirming.");
      return;
    }

    setIsProcessing(true);
    window.setTimeout(() => {
      if (!activateSubscription()) {
        setIsProcessing(false);
        setMessage("Please sign in before activating premium access.");
        return;
      }

      router.push("/account");
    }, 650);
  }

  function resetCardDetails() {
    setCardholderName(user?.name ?? "Student Reader");
    setCardNumber(ACCEPTED_CARD_NUMBER);
    setExpiry(ACCEPTED_EXPIRY);
    setCvc(ACCEPTED_CVC);
    setBillingCountry("Philippines");
    setBillingZip("1000");
    setMessage("");
  }

  return (
    <main>
      {/* ══════════════════════════════════════
          PLAN HERO
      ══════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20 text-white"
        style={{ background: "linear-gradient(135deg, #0d3d35 0%, #1f7a6d 50%, #155f55 100%)" }}
      >
        {/* Dot grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* ── Left: Plan info ── */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                <Crown size={14} />
                Premium Membership
              </div>

              <h1 className="mt-6 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
                One plan,<br />full access.
              </h1>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-white/65">
                Get unlimited access to our entire library of curated ebooks. No limits, no waiting.
              </p>

              {/* Price */}
              <div className="mt-8 flex items-end gap-2">
                <span className="text-6xl font-extrabold leading-none">PHP 99</span>
                <span className="mb-1 text-lg font-medium text-white/55">/ month</span>
              </div>

              {/* Features list */}
              <ul className="mt-8 space-y-3">
                {PLAN_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm font-medium text-white/80">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Right: Credit card preview ── */}
            <div className="flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[380px] overflow-hidden rounded-3xl p-7 shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #17202a 0%, #1a2d40 60%, #0f1f2e 100%)",
                  aspectRatio: "1.586 / 1",
                }}
              >
                {/* Decorative circles */}
                <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/[0.04]" />
                <div className="absolute -bottom-14 -right-6 h-56 w-56 rounded-full bg-white/[0.04]" />

                {/* Top row: chip + network */}
                <div className="relative flex items-start justify-between">
                  <div
                    className="h-9 w-12 rounded-md"
                    style={{ background: "linear-gradient(135deg, #f6c752, #d4941a)" }}
                  />
                  <span className="font-mono text-sm font-bold tracking-widest text-white/30">
                    VISA
                  </span>
                </div>

                {/* Card number */}
                <p className="relative mt-7 font-mono text-2xl font-semibold tracking-[0.18em] text-white">
                  •••• •••• •••• {cardLastFour}
                </p>

                {/* Card footer */}
                <div className="relative mt-5 flex items-end justify-between">
                  <p className="max-w-[180px] truncate text-sm font-semibold text-white">
                    {cardholderName || "FULL NAME"}
                  </p>
                  <p className="text-sm font-semibold text-white">{expiry || "MM/YY"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CHECKOUT
      ══════════════════════════════════════ */}
      <section className="bg-paper py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.55fr]">

            {/* ── Order summary ── */}
            <div className="space-y-4">
              <Card className="overflow-hidden rounded-2xl">
                {/* Dark card header */}
                <div
                  className="p-6 text-white"
                  style={{ background: "linear-gradient(135deg, #17202a, #1e2d3d)" }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Order Summary
                  </p>
                  <p className="mt-1.5 text-2xl font-extrabold">BookBridge Premium</p>
                  <p className="mt-1 text-sm text-white/55">
                    Monthly membership · Billed every 30 days
                  </p>

                  {/* Price in summary */}
                  <div className="mt-5 flex items-end gap-1.5">
                    <span className="text-4xl font-extrabold">PHP 99</span>
                    <span className="mb-0.5 text-sm text-white/50">/ mo</span>
                  </div>
                </div>

                <CardContent className="p-5">
                  {/* Line items */}
                  <div className="space-y-2.5 border-b pb-4">
                    <SummaryRow label="Premium membership" value="PHP 99.00" />
                    <SummaryRow label="Tax (VAT)" value="PHP 0.00" />
                  </div>
                  <div className="pt-4">
                    <SummaryRow label="Total due today" value="PHP 99.00" strong />
                  </div>

                  {/* Trust notes */}
                  <div className="mt-5 space-y-2.5 rounded-xl bg-muted/60 p-4">
                    <TrustNote icon={<ShieldCheck size={15} />} text="256-bit SSL encrypted" />
                    <TrustNote icon={<RefreshCcw size={15} />} text="Renews monthly, cancel anytime" />
                    <TrustNote icon={<Zap size={15} />} text="Instant access after payment" />
                    <TrustNote icon={<BookOpen size={15} />} text="All premium titles unlocked" />
                  </div>
                </CardContent>
              </Card>

              {/* Reference number */}
              <div className="rounded-xl border bg-white px-4 py-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Payment Reference
                </p>
                <p className="mt-1 font-mono text-base font-bold text-foreground">
                  {PAYMENT_REFERENCE}
                </p>
              </div>
            </div>

            {/* ── Payment form ── */}
            <Card className="rounded-2xl shadow-soft">
              {isSubscribed ? (
                /* Already subscribed state */
                <CardContent className="flex flex-col items-center p-10 text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-3xl bg-primary/10">
                    <BadgeCheck className="text-primary" size={40} />
                  </div>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                    <Sparkles size={13} />
                    Premium Active
                  </div>
                  <h2 className="mt-4 text-2xl font-extrabold text-foreground">
                    You&apos;re already Premium!
                  </h2>
                  <p className="mt-2 max-w-xs text-muted-foreground">
                    You have full access to all premium ebooks in the BookBridge library.
                  </p>
                  <Link href="/" className="mt-8">
                    <Button size="lg" className="h-12 gap-2 px-8 font-bold">
                      <BookOpen size={18} />
                      Go to Library
                    </Button>
                  </Link>
                </CardContent>
              ) : (
                /* Payment form */
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-7">
                    {/* Form header */}
                    <div className="flex items-center justify-between border-b pb-5">
                      <div>
                        <h2 className="text-xl font-extrabold text-foreground">Payment Details</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Secure card payment</p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
                        <LockKeyhole size={11} />
                        Secure
                      </div>
                    </div>

                    {/* Sign-in warning */}
                    {!user && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-bold text-amber-800">Sign in required</p>
                        <p className="mt-1 text-sm text-amber-700">
                          Please{" "}
                          <Link
                            href="/login?redirect=/subscribe"
                            className="font-bold underline underline-offset-2 hover:text-amber-900"
                          >
                            sign in or create an account
                          </Link>{" "}
                          before activating premium access.
                        </p>
                      </div>
                    )}

                    {/* Card info section */}
                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Card Information
                      </p>

                      <div>
                        <Label htmlFor="cardholder-name">Cardholder Name</Label>
                        <Input
                          id="cardholder-name"
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value)}
                          className="mt-2 h-11"
                          placeholder="Full name on card"
                          autoComplete="off"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="card-number">Card Number</Label>
                          <button
                            type="button"
                            onClick={resetCardDetails}
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            Use test card
                          </button>
                        </div>
                        <div className="relative mt-2">
                          <CreditCard
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={16}
                          />
                          <Input
                            id="card-number"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            className="h-11 pl-10 font-mono tracking-widest"
                            inputMode="numeric"
                            placeholder="1234 5678 9012 3456"
                            autoComplete="off"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="card-expiry">Expiry Date</Label>
                          <Input
                            id="card-expiry"
                            value={expiry}
                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            className="mt-2 h-11"
                            inputMode="numeric"
                            placeholder="MM/YY"
                            autoComplete="off"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="card-cvc">CVC</Label>
                          <Input
                            id="card-cvc"
                            value={cvc}
                            onChange={(e) =>
                              setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                            }
                            className="mt-2 h-11"
                            inputMode="numeric"
                            placeholder="123"
                            autoComplete="off"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Billing info section */}
                    <div className="space-y-4 border-t pt-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Billing Information
                      </p>

                      <div>
                        <Label htmlFor="billing-email">Billing Email</Label>
                        <div className="relative mt-2">
                          <Mail
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={16}
                          />
                          <Input
                            id="billing-email"
                            value={user?.email ?? "Sign in required"}
                            className="h-11 bg-muted/50 pl-10"
                            disabled
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billing-country">Country</Label>
                          <div className="relative mt-2">
                            <MapPin
                              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                              size={16}
                            />
                            <select
                              id="billing-country"
                              value={billingCountry}
                              onChange={(e) => setBillingCountry(e.target.value)}
                              className="flex h-11 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option>Philippines</option>
                              <option>United States</option>
                              <option>Singapore</option>
                              <option>Japan</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="billing-zip">ZIP / Postal Code</Label>
                          <Input
                            id="billing-zip"
                            value={billingZip}
                            onChange={(e) => setBillingZip(e.target.value.slice(0, 12))}
                            className="mt-2 h-11"
                            autoComplete="off"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Error */}
                    {message && (
                      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                        {message}
                      </div>
                    )}

                    {/* Submit */}
                    <div className="space-y-3 border-t pt-6">
                      <Button
                        type="submit"
                        size="lg"
                        className="h-12 w-full gap-2 text-base font-bold"
                        disabled={isProcessing}
                      >
                        <LockKeyhole size={18} />
                        {isProcessing
                          ? "Processing payment…"
                          : "Subscribe — PHP 99 / month"}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        By subscribing you agree to our terms. Cancel anytime from your account.
                      </p>
                    </div>
                  </form>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function normalizeCardNumber(value: string) {
  return value.replace(/\D/g, "");
}

function formatCardNumber(value: string) {
  return normalizeCardNumber(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isFutureExpiry(value: string) {
  const [monthValue, yearValue] = value.split("/");
  const month = Number(monthValue);
  const year = Number(yearValue);
  if (!monthValue || !yearValue || month < 1 || month > 12 || yearValue.length !== 2) {
    return false;
  }
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear() % 100;
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className={strong ? "font-bold text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={strong ? "font-bold text-foreground" : "font-medium text-foreground"}>
        {value}
      </span>
    </div>
  );
}

function TrustNote({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
      <span className="text-primary">{icon}</span>
      {text}
    </div>
  );
}

"use client";

import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  LockKeyhole,
  Mail,
  MapPin,
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

const ACCEPTED_CARD_NUMBER = "4242 4242 4242 4242";
const ACCEPTED_CARD_DIGITS = "4242424242424242";
const ACCEPTED_EXPIRY = "12/34";
const ACCEPTED_CVC = "123";
const PAYMENT_REFERENCE = "BB-0424-8610";

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

  const cardLastFour = normalizeCardNumber(cardNumber).slice(-4) || "4242";

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
      setMessage("Use the accepted card number to activate the membership.");
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
      activateSubscription();
      router.push("/account");
    }, 650);
  }

  function resetCardDetails() {
    setCardholderName("Student Reader");
    setCardNumber(ACCEPTED_CARD_NUMBER);
    setExpiry(ACCEPTED_EXPIRY);
    setCvc(ACCEPTED_CVC);
    setBillingCountry("Philippines");
    setBillingZip("1000");
    setMessage("");
  }

  return (
    <main className="surface-line">
      <section className="border-b bg-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-14">
          <div>
            <Badge variant="secondary" className="gap-2 rounded-full px-3 py-1">
              <Sparkles size={14} aria-hidden="true" />
              Premium membership
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Premium membership checkout.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Enter your card and billing details to start premium access. Your membership
              unlocks the full BookBridge library immediately after approval.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Benefit
                icon={<ShieldCheck size={22} aria-hidden="true" />}
                title="Secure checkout"
                description="Card, billing, and order details are reviewed before approval."
              />
              <Benefit
                icon={<LockKeyhole size={22} aria-hidden="true" />}
                title="Instant access"
                description="Premium titles unlock as soon as the membership is active."
              />
            </div>
          </div>

          <Card className="bg-foreground p-5 text-background shadow-soft">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-normal text-background/60">
                  Secure checkout
                </p>
                <h2 className="mt-2 text-3xl font-semibold">BookBridge Premium</h2>
              </div>
              <span className="grid h-14 w-14 place-items-center rounded-lg bg-background/10">
                <CreditCard size={26} aria-hidden="true" />
              </span>
            </div>

            <div className="mt-6 rounded-lg border border-background/10 bg-background/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-background/70">Visa card</p>
                <Badge variant="secondary" className="shrink-0">
                  Secure
                </Badge>
              </div>
              <p className="mt-5 font-mono text-2xl font-semibold tracking-normal text-background">
                **** **** **** {cardLastFour}
              </p>
              <div className="mt-5 flex items-center justify-between gap-4 text-sm text-background/65">
                <span className="truncate">{cardholderName || "Cardholder"}</span>
                <span>{expiry || "MM/YY"}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <DetailField label="Status" value="Ready" />
              <DetailField label="Due today" value="PHP 99" />
              <DetailField label="Reference" value={PAYMENT_REFERENCE} />
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[0.78fr_1.22fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
                  Order summary
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
                monthly price
              </p>
            </div>

            <div className="mt-5 space-y-3 border-b pb-5">
              <SummaryRow label="Premium membership" value="PHP 99.00" />
              <SummaryRow label="Tax" value="PHP 0.00" />
              <SummaryRow label="Total due today" value="PHP 99.00" strong />
            </div>

            <div className="mt-5 space-y-3">
              <TrustNote icon={<CircleDollarSign size={18} aria-hidden="true" />} text="Secure payment review." />
              <TrustNote icon={<CalendarDays size={18} aria-hidden="true" />} text="Membership renews monthly." />
              <TrustNote icon={<CheckCircle2 size={18} aria-hidden="true" />} text="Premium ebooks unlock after approval." />
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
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">Payment details</h2>
                    <p className="text-sm text-muted-foreground">Card payment</p>
                  </div>
                  <Badge variant="outline" className="w-fit gap-2">
                    <LockKeyhole size={14} aria-hidden="true" />
                    Secure
                  </Badge>
                </div>

                {!user ? (
                  <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    Sign in first before activating premium access.{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                      Go to sign in
                    </Link>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="cardholder-name">Cardholder name</Label>
                    <Input
                      id="cardholder-name"
                      name="cardholder-name"
                      value={cardholderName}
                      onChange={(event) => setCardholderName(event.target.value)}
                      className="mt-2 h-11"
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="card-number">Card number</Label>
                      <button
                        type="button"
                        onClick={resetCardDetails}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Reset card
                      </button>
                    </div>
                    <Input
                      id="card-number"
                      name="card-number"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                      className="mt-2 h-11 font-mono tracking-normal"
                      inputMode="numeric"
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="card-expiry">Expiry</Label>
                    <Input
                      id="card-expiry"
                      name="card-expiry"
                      value={expiry}
                      onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                      className="mt-2 h-11"
                      inputMode="numeric"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="card-cvc">CVC</Label>
                    <Input
                      id="card-cvc"
                      name="card-cvc"
                      value={cvc}
                      onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="mt-2 h-11"
                      inputMode="numeric"
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="billing-email">Billing email</Label>
                    <div className="relative mt-2">
                      <Mail
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={16}
                        aria-hidden="true"
                      />
                      <Input
                        id="billing-email"
                        value={user?.email ?? "Sign in required"}
                        className="h-11 pl-9"
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billing-country">Country</Label>
                    <div className="relative mt-2">
                      <MapPin
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={16}
                        aria-hidden="true"
                      />
                      <select
                        id="billing-country"
                        value={billingCountry}
                        onChange={(event) => setBillingCountry(event.target.value)}
                        className="flex h-11 w-full rounded-md border border-input bg-background px-9 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option>Philippines</option>
                        <option>United States</option>
                        <option>Singapore</option>
                        <option>Japan</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billing-zip">ZIP / postal code</Label>
                    <Input
                      id="billing-zip"
                      value={billingZip}
                      onChange={(event) => setBillingZip(event.target.value.slice(0, 12))}
                      className="mt-2 h-11"
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 shrink-0 text-primary" size={18} aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Secure membership activation</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        After approval, your premium access is applied to this account and premium
                        ebooks are available from the library.
                      </p>
                    </div>
                  </div>
                </div>

                {message ? (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                    {message}
                  </p>
                ) : null}

                <Button type="submit" className="h-11 w-full" disabled={isProcessing}>
                  <LockKeyhole size={18} aria-hidden="true" />
                  {isProcessing ? "Authorizing payment..." : "Subscribe now"}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      </section>
    </main>
  );
}

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

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isFutureExpiry(value: string) {
  const [monthValue, yearValue] = value.split("/");
  const month = Number(monthValue);
  const year = Number(yearValue);

  if (!monthValue || !yearValue || month < 1 || month > 12 || yearValue.length !== 2) {
    return false;
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear() % 100;

  return year > currentYear || (year === currentYear && month >= currentMonth);
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className={strong ? "font-semibold text-foreground" : "text-muted-foreground"}>{label}</span>
      <span className={strong ? "font-semibold text-foreground" : "font-medium text-foreground"}>{value}</span>
    </div>
  );
}

function TrustNote({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
      <span className="text-primary">{icon}</span>
      {text}
    </div>
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

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-background/10 bg-background/10 p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-background/55">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold text-background">{value}</p>
    </div>
  );
}

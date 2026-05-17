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

const DEMO_CARD_NUMBER = "4242 4242 4242 4242";
const DEMO_CARD_DIGITS = "4242424242424242";
const DEMO_EXPIRY = "12/34";
const DEMO_CVC = "123";

export default function SubscribePage() {
  const router = useRouter();
  const { user, isSubscribed, activateSubscription } = useAuth();
  const [cardholderName, setCardholderName] = useState("Student Reader");
  const [cardNumber, setCardNumber] = useState(DEMO_CARD_NUMBER);
  const [expiry, setExpiry] = useState(DEMO_EXPIRY);
  const [cvc, setCvc] = useState(DEMO_CVC);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("Please sign in before activating premium access.");
      return;
    }

    if (!cardholderName.trim()) {
      setMessage("Enter the demo cardholder name before confirming.");
      return;
    }

    if (normalizeCardNumber(cardNumber) !== DEMO_CARD_DIGITS) {
      setMessage("Use the demo card number to activate the sample membership.");
      return;
    }

    if (!isFutureExpiry(expiry)) {
      setMessage("Enter a future expiry date in MM/YY format.");
      return;
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      setMessage("Enter a 3 or 4 digit demo CVC.");
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
              Premium opens the full shelf. This sample checkout uses demo card details only,
              activates access in your browser, and never sends a payment.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Benefit
                icon={<ShieldCheck size={22} aria-hidden="true" />}
                title="Demo card only"
                description="Sample values are checked locally and discarded."
              />
              <Benefit
                icon={<LockKeyhole size={22} aria-hidden="true" />}
                title="No gateway charge"
                description="Premium titles unlock immediately in this demo."
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
              <DemoField label="Payment" value="Demo card" />
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
                    <p className="text-sm text-muted-foreground">Demo card subscription activation</p>
                  </div>
                  <Badge variant="secondary">Demo mode</Badge>
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
                  <Label htmlFor="cardholder-name">Cardholder name</Label>
                  <Input
                    id="cardholder-name"
                    name="demo-cardholder-name"
                    value={cardholderName}
                    onChange={(event) => setCardholderName(event.target.value)}
                    className="mt-2 h-11"
                    autoComplete="off"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="demo-card-number">Card number</Label>
                  <Input
                    id="demo-card-number"
                    name="demo-card-number"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                    className="mt-2 h-11"
                    inputMode="numeric"
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="demo-expiry">Expiry</Label>
                    <Input
                      id="demo-expiry"
                      name="demo-expiry"
                      value={expiry}
                      onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                      className="mt-2 h-11"
                      inputMode="numeric"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="demo-cvc">CVC</Label>
                    <Input
                      id="demo-cvc"
                      name="demo-cvc"
                      value={cvc}
                      onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="mt-2 h-11"
                      inputMode="numeric"
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm font-semibold text-foreground">Demo activation confirmation</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    The demo card fields are validated in the browser and discarded after activation.
                    No real card, wallet, bank, or payment gateway information is used.
                  </p>
                </div>

                {message ? (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                    {message}
                  </p>
                ) : null}

                <Button type="submit" className="h-11 w-full">
                  <CreditCard size={18} aria-hidden="true" />
                  Activate with demo card
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

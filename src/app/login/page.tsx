"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpenCheck, LibraryBig, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const isRegisterMode = mode === "register";

  function getRedirectPath() {
    if (typeof window === "undefined") {
      return "/account";
    }

    const redirect = new URLSearchParams(window.location.search).get("redirect");
    return redirect?.startsWith("/") ? redirect : "/account";
  }

  function switchMode(nextMode: "signin" | "register") {
    setMode(nextMode);
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isRegisterMode) {
      const result = register(name, email, password);

      if (!result.ok) {
        setError(result.message ?? "Unable to create account.");
        return;
      }

      router.push(getRedirectPath());
      return;
    }

    if (!login(email, password)) {
      setError("Invalid email or password.");
      return;
    }

    router.push(getRedirectPath());
  }

  return (
    <main className="surface-line flex items-center">
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-14">
        <div>
          <Badge variant="secondary" className="gap-2 rounded-full px-3 py-1">
            <ShieldCheck size={14} aria-hidden="true" />
            Member access
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Welcome back to BookBridge.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Sign in to manage your reading access, continue browsing, and open premium titles when
            your plan is active.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-background p-4 shadow-sm">
              <LibraryBig className="text-primary" size={22} aria-hidden="true" />
              <p className="mt-3 font-semibold text-foreground">Your library</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Keep free and premium titles organized in one place.
              </p>
            </div>
            <div className="rounded-lg border bg-background p-4 shadow-sm">
              <ShieldCheck className="text-primary" size={22} aria-hidden="true" />
              <p className="mt-3 font-semibold text-foreground">Access status</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Check whether your account is free or premium.
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-soft">
          <CardHeader className="flex-row items-center justify-between border-b">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                {isRegisterMode ? "Create account" : "Sign in"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isRegisterMode ? "Start with a free account" : "Enter your account credentials"}
              </p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
              {isRegisterMode ? (
                <UserPlus size={24} aria-hidden="true" />
              ) : (
                <BookOpenCheck size={24} aria-hidden="true" />
              )}
            </span>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegisterMode ? (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="mt-2 h-11"
                    required
                  />
                </div>
              ) : null}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="mt-2 h-11"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="mt-2 h-11"
                  required
                />
              </div>

              {error ? (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="h-11 w-full">
                {isRegisterMode ? (
                  <UserPlus size={18} aria-hidden="true" />
                ) : (
                  <LogIn size={18} aria-hidden="true" />
                )}
                {isRegisterMode ? "Create account" : "Sign in"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {isRegisterMode ? "Already have an account?" : "New to BookBridge?"}{" "}
                <button
                  type="button"
                  onClick={() => switchMode(isRegisterMode ? "signin" : "register")}
                  className="font-medium text-primary hover:underline"
                >
                  {isRegisterMode ? "Sign in" : "Create account"}
                </button>
              </p>

              <p className="text-center text-sm text-muted-foreground">
                Browse first?{" "}
                <Link href="/" className="font-medium text-primary hover:underline">
                  Go to library
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

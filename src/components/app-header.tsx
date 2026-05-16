"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LogIn, LogOut, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Library" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/account", label: "Account" }
];

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout, isSubscribed } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <BookOpen size={20} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xl font-semibold tracking-normal text-foreground">BookBridge</span>
            <span className="block text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Digital library
            </span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 rounded-lg border bg-background p-1 shadow-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          {user ? (
            <Button
              type="button"
              onClick={logout}
              variant="ghost"
              size="sm"
              title="Log out"
            >
              <LogOut size={16} aria-hidden="true" />
              Logout
            </Button>
          ) : (
            <Link href="/login">
              <Button size="sm" className="shadow-sm">
                <LogIn size={16} aria-hidden="true" />
                Login
              </Button>
            </Link>
          )}
        </nav>

        {user ? (
          <div className="flex w-full items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-sm shadow-sm lg:w-auto">
            <span className="flex min-w-0 items-center gap-2">
              <UserRound size={16} className="text-muted-foreground" aria-hidden="true" />
              <span className="truncate font-medium">{user.name}</span>
            </span>
            <Badge variant={isSubscribed ? "default" : "secondary"} className="gap-1">
              {isSubscribed ? <Sparkles size={12} aria-hidden="true" /> : null}
              {isSubscribed ? "Premium" : "Free"}
            </Badge>
          </div>
        ) : null}
      </div>
    </header>
  );
}

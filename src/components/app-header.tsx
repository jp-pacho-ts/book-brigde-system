"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Crown,
  FilePlus2,
  LayoutDashboard,
  LogIn,
  LogOut,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCog,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logoutAdminAction } from "@/app/admin/actions";

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout, isSubscribed } = useAuth();
  const publicLinks = [
    { href: "/", label: "Library", icon: BookOpen },
    { href: "/about", label: "About", icon: UsersRound },
  ];

  if (pathname.startsWith("/admin")) {
    return <AdminHeader pathname={pathname} />;
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <BookOpen size={18} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-bold leading-none text-foreground">BookBridge</span>
            <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Digital Library
            </span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 rounded-lg border bg-muted/60 p-1">
            {publicLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background hover:text-foreground"
                  )}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {user ? (
            /* ── Logged in ── */
            <>
              {/* User info */}
              <div className="hidden items-center gap-2.5 sm:flex">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <UserRound size={16} aria-hidden="true" />
                </span>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold leading-none text-foreground">{user.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
                </div>
                {isSubscribed ? (
                  <Badge className="gap-1">
                    <Sparkles size={11} aria-hidden="true" />
                    Premium
                  </Badge>
                ) : null}
              </div>

              {/* Upload link for premium users */}
              {isSubscribed && (
                <Link href="/upload">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Upload size={14} aria-hidden="true" />
                    <span className="hidden sm:inline">Upload</span>
                  </Button>
                </Link>
              )}

              {/* Upgrade nudge for non-subscribers */}
              {!isSubscribed && (
                <Link href="/subscribe">
                  <Button size="sm" className="gap-1.5">
                    <Crown size={14} aria-hidden="true" />
                    Upgrade
                  </Button>
                </Link>
              )}

              {/* Log out */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={logout}
              >
                <LogOut size={14} aria-hidden="true" />
                Log Out
              </Button>
            </>
          ) : (
            /* ── Logged out ── */
            <Link href="/login">
              <Button size="sm" className="gap-1.5">
                <LogIn size={14} aria-hidden="true" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function AdminHeader({ pathname }: { pathname: string }) {
  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/ebooks/new", label: "Add ebook", icon: FilePlus2 },
    { href: "/admin/admins", label: "Admins", icon: UserCog },
  ];

  return (
    <header className="sticky top-0 z-30 border-b bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:min-h-16 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/admin/dashboard" className="flex shrink-0 items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-background/10 text-background shadow-sm">
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xl font-semibold tracking-normal">BookBridge Admin</span>
            <span className="block text-xs font-medium uppercase tracking-normal text-background/60">
              Catalog management
            </span>
          </span>
        </Link>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <nav className="flex w-full flex-wrap items-center gap-1 rounded-lg border border-background/10 bg-background/10 p-1 shadow-sm lg:w-auto">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-background/75 hover:bg-background/10 hover:text-background"
                  )}
                >
                  <Icon size={16} aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md border border-background/15 px-3 text-sm font-medium text-background/80 transition hover:bg-background/10 hover:text-background"
          >
            Public library
          </Link>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-background/15 px-3 text-sm font-medium text-background/80 transition hover:bg-background/10 hover:text-background"
            >
              <LogOut size={16} aria-hidden="true" />
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

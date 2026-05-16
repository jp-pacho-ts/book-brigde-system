"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FilePlus2,
  LayoutDashboard,
  LogIn,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserCog,
  UserRound
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logoutAdminAction } from "@/app/admin/actions";

const navLinks = [
  { href: "/", label: "Library" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/account", label: "Account" }
];

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout, isSubscribed } = useAuth();

  if (pathname.startsWith("/admin")) {
    return <AdminHeader pathname={pathname} />;
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:min-h-16 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex shrink-0 items-center gap-3">
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

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <nav className="flex w-full flex-wrap items-center gap-1 rounded-lg border bg-background p-1 shadow-sm lg:w-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {user ? (
              <>
                <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm shadow-sm">
                  <UserRound size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="max-w-40 truncate font-medium">{user.name}</span>
                  <Badge variant={isSubscribed ? "default" : "secondary"} className="gap-1">
                    {isSubscribed ? <Sparkles size={12} aria-hidden="true" /> : null}
                    {isSubscribed ? "Premium" : "Free"}
                  </Badge>
                </div>
                <Button type="button" onClick={logout} variant="outline" size="sm" title="Log out">
                  <LogOut size={16} aria-hidden="true" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm" className="shadow-sm">
                  <LogIn size={16} aria-hidden="true" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function AdminHeader({ pathname }: { pathname: string }) {
  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/ebooks/new", label: "Add ebook", icon: FilePlus2 },
    { href: "/admin/admins", label: "Admins", icon: UserCog }
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

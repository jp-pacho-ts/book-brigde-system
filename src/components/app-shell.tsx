"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AuthProvider } from "@/components/auth-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isReaderPage = /^\/ebooks\/[^/]+\/read$/.test(pathname);
  const hideChrome = pathname === "/login" || pathname === "/admin/login" || isReaderPage;

  return (
    <AuthProvider>
      {hideChrome ? null : <AppHeader />}
      <div className="flex flex-1 flex-col [&>main]:flex-1">{children}</div>
      {hideChrome ? null : (
        <footer className="border-t bg-background">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-foreground">BookBridge</p>
            <p>Digital library access for curious student readers.</p>
          </div>
        </footer>
      )}
    </AuthProvider>
  );
}

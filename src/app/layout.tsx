import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "BookBridge",
  description: "A focused digital library for student readers"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <AuthProvider>
          <AppHeader />
          <div className="flex flex-1 flex-col [&>main]:flex-1">{children}</div>
          <footer className="border-t bg-background">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p className="font-medium text-foreground">BookBridge</p>
              <p>Digital library access for curious student readers.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

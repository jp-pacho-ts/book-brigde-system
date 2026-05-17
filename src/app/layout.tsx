import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "BookBridge",
  description: "A focused digital library for student readers"
};

const siteLoaderScript = `
(() => {
  try {
    const seenKey = "bookbridge_loader_seen";
    const hardRefreshKey = "bookbridge_hard_refresh_requested";
    const hasSeenLoader = window.sessionStorage.getItem(seenKey) === "true";
    const requestedHardRefresh = window.sessionStorage.getItem(hardRefreshKey) === "true";

    document.documentElement.dataset.siteLoader =
      !hasSeenLoader || requestedHardRefresh ? "show" : "hide";
  } catch {
    document.documentElement.dataset.siteLoader = "show";
  }
})();
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <script dangerouslySetInnerHTML={{ __html: siteLoaderScript }} />
        <div id="bookbridge-startup-loader" role="status" aria-label="Loading BookBridge">
          <div className="startup-loader-content">
            <div className="startup-loader-mark" aria-hidden="true">
              <span className="startup-loader-page startup-loader-page-left" />
              <span className="startup-loader-page startup-loader-page-right" />
            </div>
            <div className="startup-loader-copy">
              <span className="startup-loader-title">BookBridge</span>
              <span className="startup-loader-line" />
            </div>
          </div>
        </div>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

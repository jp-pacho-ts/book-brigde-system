"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Library,
  Loader2,
  LockKeyhole
} from "lucide-react";
import type { Ebook } from "@/lib/ebooks";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function EbookReader({ ebook }: { ebook: Ebook }) {
  const { isReady, isSubscribed } = useAuth();
  const isLocked = ebook.isPremium && !isSubscribed;

  if (ebook.isPremium && !isReady) {
    return (
      <ReaderShell ebook={ebook}>
        <ReaderState
          icon={<Loader2 className="animate-spin" size={28} aria-hidden="true" />}
          title="Checking access"
          description="Preparing the reader for this premium ebook."
        />
      </ReaderShell>
    );
  }

  if (isLocked) {
    return (
      <ReaderShell ebook={ebook}>
        <ReaderState
          icon={<LockKeyhole size={28} aria-hidden="true" />}
          title="Premium access required"
          description="Upgrade your account to open this ebook in the BookBridge reader."
          action={
            <Link href="/subscribe">
              <Button>
                <Crown size={16} aria-hidden="true" />
                Upgrade to read
              </Button>
            </Link>
          }
        />
      </ReaderShell>
    );
  }

  if (!ebook.fileUrl) {
    return (
      <ReaderShell ebook={ebook}>
        <ReaderState
          icon={<FileText size={28} aria-hidden="true" />}
          title="PDF not attached"
          description="This ebook has catalog details, but the PDF file has not been uploaded yet."
        />
      </ReaderShell>
    );
  }

  return (
    <ReaderShell ebook={ebook}>
      <NativePdfReader ebook={ebook} fileUrl={ebook.fileUrl} />
    </ReaderShell>
  );
}

function NativePdfReader({ ebook, fileUrl }: { ebook: Ebook; fileUrl: string }) {
  const { isSubscribed } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const downloadHref = `/api/ebooks/${ebook.slug}/download`;

  return (
    <section className="flex flex-1 flex-col bg-muted/60">
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Badge variant="secondary" className="gap-2">
              <FileText size={13} aria-hidden="true" />
              PDF
            </Badge>
            <span className="truncate text-sm font-medium text-muted-foreground">{ebook.title}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ExternalLink size={18} aria-hidden="true" />
              Open in tab
            </a>
            {isSubscribed ? (
              <a
                href={downloadHref}
                className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                download
              >
                <Download size={18} aria-hidden="true" />
                Download
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-5 lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="rounded-lg border bg-background p-4 shadow-sm">
          <Badge variant="secondary" className="gap-2">
            <Library size={13} aria-hidden="true" />
            {ebook.category}
          </Badge>
          <h2 className="mt-4 text-lg font-semibold leading-snug text-foreground">{ebook.title}</h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">by {ebook.author}</p>
          <dl className="mt-5 space-y-3 text-sm">
            <ReaderMeta label="Pages" value={ebook.pages.toString()} />
            <ReaderMeta label="Published" value={ebook.publishedYear.toString()} />
            <ReaderMeta label="Access" value={ebook.isPremium ? "Premium" : "Free"} />
          </dl>
        </aside>

        <div className="min-w-0 rounded-lg border bg-background p-3 shadow-sm md:p-4">
          <div className="relative h-[calc(100svh-220px)] min-h-[72vh] overflow-hidden rounded-md bg-muted">
            {!isLoaded ? (
              <div className="absolute inset-x-3 top-3 z-10 rounded-md bg-background px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                Loading PDF...
              </div>
            ) : null}
            <iframe
              src={getNativePdfSrc(fileUrl)}
              title={`${ebook.title} PDF`}
              className="h-full w-full border-0 bg-background"
              onLoad={() => setIsLoaded(true)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function getNativePdfSrc(fileUrl: string) {
  const separator = fileUrl.includes("#") ? "&" : "#";
  return `${fileUrl}${separator}toolbar=1&navpanes=0&view=FitH`;
}

function ReaderShell({ ebook, children }: { ebook: Ebook; children: React.ReactNode }) {
  return (
    <main className="surface-line flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:min-h-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/ebooks/${ebook.slug}`}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
              title="Back to ebook details"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>

            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <BookOpen size={18} aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-semibold text-foreground">{ebook.title}</h1>
                {ebook.isPremium ? (
                  <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-800">
                    <Crown size={13} aria-hidden="true" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    Free
                  </Badge>
                )}
              </div>
              <p className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                <Library size={13} aria-hidden="true" />
                <span className="truncate">{ebook.category}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {children}
    </main>
  );
}

function ReaderMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function ReaderState({
  icon,
  title,
  description,
  action
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="grid flex-1 place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 text-center text-foreground shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </section>
  );
}

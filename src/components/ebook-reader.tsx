"use client";

import Link from "next/link";
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
    <ReaderShell ebook={ebook} fileUrl={ebook.fileUrl}>
      <section className="flex min-h-0 flex-1 bg-neutral-950 px-3 pb-3 md:px-5 md:pb-5">
        <div className="min-h-0 w-full overflow-hidden rounded-md border border-white/10 bg-neutral-900 shadow-2xl">
          <iframe
            src={getPdfEmbedUrl(ebook.fileUrl)}
            title={`${ebook.title} reader`}
            className="h-full min-h-[calc(100vh-6rem)] w-full border-0 bg-neutral-900"
          />
        </div>
      </section>
    </ReaderShell>
  );
}

function ReaderShell({
  ebook,
  fileUrl,
  children
}: {
  ebook: Ebook;
  fileUrl?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-neutral-950 text-white">
      <header className="border-b border-white/10 bg-neutral-950/95">
        <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/ebooks/${ebook.slug}`}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/10 text-white/75 transition hover:bg-white/10 hover:text-white"
              title="Back to ebook details"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>

            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
              <BookOpen size={18} aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-base font-semibold md:text-lg">{ebook.title}</h1>
                {ebook.isPremium ? (
                  <Badge variant="outline" className="border-amber-300/40 bg-amber-300/10 text-amber-100">
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-300/40 bg-emerald-300/10 text-emerald-100">
                    Free
                  </Badge>
                )}
              </div>
              <p className="mt-1 flex min-w-0 items-center gap-2 text-xs text-white/55">
                <Library size={13} aria-hidden="true" />
                <span className="truncate">{ebook.category}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {fileUrl ? (
              <>
                <a
                  href={fileUrl}
                  download
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <Download size={16} aria-hidden="true" />
                  Download
                </a>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <ExternalLink size={16} aria-hidden="true" />
                  Open original
                </a>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {children}
    </main>
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
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-white p-6 text-center text-foreground shadow-2xl">
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

function getPdfEmbedUrl(fileUrl: string) {
  return `${fileUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
}

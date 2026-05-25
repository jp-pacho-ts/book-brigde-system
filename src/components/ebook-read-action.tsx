"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Download, LockKeyhole } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

export function EbookReadAction({
  fileUrl,
  isPremium,
  slug
}: {
  fileUrl: string | null;
  isPremium: boolean;
  slug: string;
}) {
  const { isSubscribed } = useAuth();
  const downloadHref = `/api/ebooks/${slug}/download`;

  if (isPremium && !isSubscribed) {
    return (
      <Link href="/subscribe" className="inline-flex">
        <Button>
          <LockKeyhole size={16} aria-hidden="true" />
          Upgrade to read
        </Button>
      </Link>
    );
  }

  if (!fileUrl) {
    return (
      <Button type="button" disabled>
        <BookOpen size={16} aria-hidden="true" />
        PDF not attached
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/ebooks/${slug}/read`}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
      >
        <BookOpen size={16} aria-hidden="true" />
        Open reader
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
      {isSubscribed ? (
        <a
          href={downloadHref}
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          download
        >
          <Download size={16} aria-hidden="true" />
          Download PDF
        </a>
      ) : null}
    </div>
  );
}
